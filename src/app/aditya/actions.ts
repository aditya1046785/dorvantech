"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { verify, hash } from "@node-rs/argon2";
import { TOTP, Secret } from "otpauth";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { decrypt, digest, requireOwner } from "@/lib/auth";
import { contentSchema, slugSchema } from "@/lib/project-schema";
export type Result = { error?: string; success?: string; id?: string };
export async function login(_: Result, form: FormData): Promise<Result> {
  if (!process.env.DATABASE_URL)
    return { error: "Database setup is required. See the setup guide." };
  const h = await headers();
  if (
    h.get("origin") !==
    new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").origin
  )
    return { error: "Request origin is not allowed." };
  const bucket = digest("owner-login");
  const throttle = await db.authThrottle.upsert({
    where: { id: bucket },
    create: { id: bucket, attempts: 1, resetAt: new Date(Date.now() + 900000) },
    update: { attempts: { increment: 1 } },
  });
  if (throttle.resetAt < new Date())
    await db.authThrottle.update({
      where: { id: bucket },
      data: { attempts: 1, resetAt: new Date(Date.now() + 900000) },
    });
  else if (throttle.attempts > 5)
    return { error: "Too many attempts. Try again in 15 minutes." };
  const owner = await db.adminUser.findUnique({ where: { id: "owner" } });
  const password = String(form.get("password") || "");
  if (
    password.length > 256 ||
    !owner ||
    owner.email !== String(form.get("email")).toLowerCase() ||
    !(await verify(owner.passwordHash, password))
  )
    return { error: "Unable to sign in. Check your credentials." };
  const otp = new TOTP({
    secret: Secret.fromBase32(decrypt(owner.totpSecret)),
  });
  const code = String(form.get("code"));
  const recovery = digest(code);
  const isRecovery = owner.recoveryCodes.includes(recovery);
  const delta = isRecovery ? 0 : otp.validate({ token: code, window: 1 });
  const step = BigInt(Math.floor(Date.now() / 30000) + (delta ?? 0));
  if (delta === null)
    return { error: "Unable to sign in. Check your credentials." };
  const used = isRecovery
    ? await db.adminUser.updateMany({
        where: { id: "owner", recoveryCodes: { equals: owner.recoveryCodes } },
        data: {
          recoveryCodes: owner.recoveryCodes.filter((c) => c !== recovery),
        },
      })
    : await db.adminUser.updateMany({
        where: { id: "owner", lastTotpStep: { lt: step } },
        data: { lastTotpStep: step },
      });
  if (!used.count)
    return { error: "Code already used. Wait for the next code." };
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      id: digest(token),
      userId: owner.id,
      expiresAt: new Date(Date.now() + 43200000),
    },
  });
  (await cookies()).set("owner-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 43200,
  });
  redirect("/aditya");
}
export async function logout() {
  const s = await requireOwner();
  await db.session.delete({ where: { id: s.id } });
  (await cookies()).delete("owner-session");
  redirect("/aditya");
}
function refresh(slug?: string) {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/aditya");
  if (slug) revalidatePath(`/work/${slug}`);
}
export async function saveProject(_: Result, f: FormData): Promise<Result> {
  await requireOwner();
  const id = String(f.get("id") || "");
  const mode = String(f.get("intent") || "save");
  try {
    const raw: Record<string, unknown> = {};
    for (const key of Object.keys(contentSchema.shape))
      raw[key] = String(f.get(key) || "");
    for (const key of ["tags", "features", "steps"])
      raw[key] = String(f.get(key) || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    raw.seed = Number(f.get("seed"));
    const data = contentSchema.parse(raw);
    const slug = slugSchema.parse(f.get("slug"));
    const homepage = f.get("homepage") === "on";
    const saved = await db.$transaction(async (tx) => {
      if (id) {
        const current = await tx.project.findUniqueOrThrow({ where: { id } });
        if (current.published && current.slug !== slug)
          throw Error("Published slugs cannot change.");
        const result = await tx.project.updateMany({
          where: { id, version: Number(f.get("version")) },
          data: {
            slug,
            draft: data,
            homepage,
            version: { increment: 1 },
            ...(mode === "publish"
              ? { published: data, status: "PUBLISHED" }
              : {}),
          },
        });
        if (!result.count)
          throw Error(
            "This project changed in another tab. Reload before saving.",
          );
      } else {
        const last = await tx.project.aggregate({ _max: { position: true } });
        const p = await tx.project.create({
          data: {
            slug,
            draft: data,
            homepage,
            position: (last._max.position ?? -1) + 1,
            ...(mode === "publish"
              ? { published: data, status: "PUBLISHED" }
              : {}),
          },
        });
        await tx.auditLog.create({ data: { action: mode, projectId: p.id } });
        return p;
      }
      await tx.auditLog.create({ data: { action: mode, projectId: id } });
      return tx.project.findUniqueOrThrow({ where: { id } });
    });
    refresh(slug);
    return {
      id: saved.id,
      success: `${mode === "publish" ? "Published" : "Draft saved"}.`,
      ...(!id
        ? {
            success: `Saved. Open this project from the project list to continue editing. ID: ${saved.id}`,
          }
        : {}),
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "That slug is already in use." };
    return {
      error:
        e instanceof Error
          ? e.message
          : "Unable to save. Your changes are still in the form.",
    };
  }
}
export async function projectAction(f: FormData) {
  await requireOwner();
  const id = String(f.get("id"));
  const intent = String(f.get("intent"));
  await db.$transaction(async (tx) => {
    const p = await tx.project.findUniqueOrThrow({ where: { id } });
    if (intent === "feature") {
      if (p.status !== "PUBLISHED" || !p.homepage)
        throw Error("Publish and show this project on the homepage first.");
      await tx.siteSettings.upsert({
        where: { id: "site" },
        create: { featuredId: id },
        update: { featuredId: id },
      });
    }
    if (intent === "archive" || intent === "unpublish") {
      await tx.project.update({
        where: { id },
        data: {
          status: intent === "archive" ? "ARCHIVED" : "DRAFT",
          version: { increment: 1 },
        },
      });
      await tx.siteSettings.updateMany({
        where: { featuredId: id },
        data: { featuredId: null },
      });
    }
    if (intent === "duplicate") {
      await tx.project.create({
        data: {
          slug: `${p.slug.slice(0, 75)}-${randomBytes(4).toString("hex")}`,
          draft: p.draft as Prisma.InputJsonValue,
          position: p.position + 1,
        },
      });
    }
    if (intent === "restore")
      await tx.project.update({
        where: { id },
        data: { status: "DRAFT", version: { increment: 1 } },
      });
    if (intent === "up" || intent === "down") {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(914220)`;
      const list = await tx.project.findMany({
        orderBy: [{ position: "asc" }, { id: "asc" }],
      });
      const index = list.findIndex((r) => r.id === id);
      const target = index + (intent === "up" ? -1 : 1);
      if (target >= 0 && target < list.length) {
        [list[index], list[target]] = [list[target], list[index]];
        for (let i = 0; i < list.length; i++)
          await tx.project.update({
            where: { id: list[i].id },
            data: { position: i },
          });
      }
    }
    await tx.auditLog.create({ data: { action: intent, projectId: id } });
  });
  refresh();
  const p = await db.project.findUnique({ where: { id } });
  if (p) refresh(p.slug);
}
export async function changePassword(_: Result, f: FormData): Promise<Result> {
  await requireOwner();
  const owner = await db.adminUser.findUniqueOrThrow({
    where: { id: "owner" },
  });
  if (!(await verify(owner.passwordHash, String(f.get("current")))))
    return { error: "Current password is incorrect." };
  const password = String(f.get("password"));
  if (password.length < 16 || password.length > 256)
    return { error: "Use 16–256 characters." };
  await db.$transaction([
    db.adminUser.update({
      where: { id: "owner" },
      data: { passwordHash: await hash(password) },
    }),
    db.session.deleteMany(),
    db.auditLog.create({ data: { action: "password-changed" } }),
  ]);
  (await cookies()).delete("owner-session");
  redirect("/aditya");
}
export async function revokeSessions() {
  await requireOwner();
  await db.session.deleteMany();
  (await cookies()).delete("owner-session");
  redirect("/aditya");
}
