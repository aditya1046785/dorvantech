import { after } from "next/server";
import { processConfirmation } from "@/lib/recruitment-jobs";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isDatabaseUnavailable } from "@/lib/database-errors";
import { applicationsEnabled } from "@/lib/recruitment-config";
import {
  submissionSchema,
  pdfContentValid,
  confirmationText,
} from "@/lib/application-submission";
import {
  MAX_RESUME_BYTES,
  resumeMetadataError,
} from "@/lib/application-schema";
import { vacancySchema, vacancyExpired } from "@/lib/vacancy-schema";
import {
  assertResumeStorage,
  scanResume,
  uploadResume,
} from "@/lib/resume-storage";
export const runtime = "nodejs";
export const maxDuration = 90;
const BODY_LIMIT = MAX_RESUME_BYTES + 128 * 1024;
function reply(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
class SubmissionError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
async function throttle(key: string, limit: number) {
  const hash = createHash("sha256").update(`application:${key}`).digest("hex");
  const rows = await db.$queryRaw<{ attempts: number }[]>(
    Prisma.sql`INSERT INTO "AuthThrottle" ("id", "attempts", "resetAt") VALUES (${hash}, 1, NOW() + INTERVAL '1 hour') ON CONFLICT ("id") DO UPDATE SET "attempts" = CASE WHEN "AuthThrottle"."resetAt" < NOW() THEN 1 ELSE "AuthThrottle"."attempts" + 1 END, "resetAt" = CASE WHEN "AuthThrottle"."resetAt" < NOW() THEN NOW() + INTERVAL '1 hour' ELSE "AuthThrottle"."resetAt" END RETURNING "attempts"`,
  );
  if (rows[0].attempts > limit)
    throw new SubmissionError(
      "Too many attempts. Please try again later.",
      429,
    );
}
async function boundedForm(request: Request) {
  if (!request.body) throw new SubmissionError("Missing application.");
  const length = Number(request.headers.get("content-length"));
  if (length > BODY_LIMIT)
    throw new SubmissionError("The application upload is too large.", 413);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    throw new SubmissionError("Invalid upload format.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > BODY_LIMIT) {
        await reader.cancel();
        throw new SubmissionError("The application upload is too large.", 413);
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
  } catch {
    throw new SubmissionError("Unable to read the application upload.");
  }
}
export async function POST(request: Request) {
  if (!applicationsEnabled())
    return reply({ error: "Applications are not open yet." }, 503);
  const origin = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ).origin;
  if (request.headers.get("origin") !== origin)
    return reply({ error: "Request origin is not allowed." }, 403);
  let stage = "rate-limit";
  const startedAt = Date.now();
  try {
    await throttle("global", 1000);
    // Only deploy behind a proxy that overwrites client-supplied forwarded headers.
    const ip = (request.headers.get("x-forwarded-for") ?? "unknown")
      .split(",")[0]
      .trim();
    await throttle(`ip:${ip}`, 15);
    const form = await boundedForm(request);
    let raw: unknown;
    try {
      raw = JSON.parse(String(form.get("application")));
    } catch {
      throw new SubmissionError("Invalid application details.");
    }
    const parsed = submissionSchema.safeParse(raw);
    if (!parsed.success)
      throw new SubmissionError(parsed.error.issues[0].message);
    const { slug, requestKey, answers } = parsed.data;
    stage = "application-lookup";
    const vacancy = await db.vacancy.findUnique({ where: { slug } });
    if (!vacancy)
      throw new SubmissionError("This vacancy is unavailable.", 404);
    const previous = await db.application.findUnique({ where: { requestKey } });
    if (previous) {
      if (previous.vacancyId !== vacancy.id || previous.email !== answers.email)
        throw new SubmissionError("Submission reference already used.", 409);
      return reply({ registration: previous.registration });
    }
    if (
      await db.application.findUnique({
        where: {
          vacancyId_email: { vacancyId: vacancy.id, email: answers.email },
        },
      })
    )
      throw new SubmissionError(
        "An application with this email has already been submitted for this vacancy. Check your confirmation email or contact us.",
        409,
      );
    const current = vacancy.published
      ? vacancySchema.safeParse(vacancy.published)
      : null;
    if (
      vacancy.status !== "PUBLISHED" ||
      !current?.success ||
      vacancyExpired(current.data)
    )
      throw new SubmissionError(
        "This vacancy is no longer accepting applications.",
        409,
      );
    const file = form.get("resume");
    if (!(file instanceof File))
      throw new SubmissionError("Please upload your PDF résumé.");
    const metadataError = resumeMetadataError(file);
    if (metadataError) throw new SubmissionError(metadataError);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!pdfContentValid(bytes))
      throw new SubmissionError("Please upload a valid PDF résumé.");
    stage = "storage-check";
    await assertResumeStorage();
    stage = "pdf-scan";
    await scanResume(bytes);
    const objectKey = `applications/${randomUUID()}.pdf`;
    // Track before uploading: even interrupted or failed requests can be cleaned up.
    stage = "resume-metadata";
    const resume = await db.resumeObject.create({
      data: {
        objectKey,
        filename: file.name.replace(/[\x00-\x1f\x7f/\\]/g, "_").slice(0, 200),
        size: bytes.length,
        scannedAt: new Date(),
      },
    });
    stage = "pdf-upload";
    await uploadResume(objectKey, bytes);
    const registration = `DVT-${new Date().getUTCFullYear()}-${randomBytes(8).toString("hex").toUpperCase()}`;
    stage = "application-save";
    const saved = await db.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Vacancy" WHERE "id" = ${vacancy.id} FOR UPDATE`,
        );
        const latest = await tx.vacancy.findUniqueOrThrow({
          where: { id: vacancy.id },
        });
        const content = latest.published
          ? vacancySchema.parse(latest.published)
          : null;
        if (
          latest.status !== "PUBLISHED" ||
          !content ||
          vacancyExpired(content)
        )
          throw new SubmissionError(
            "This vacancy closed while you were applying.",
            409,
          );
        const revision = await tx.vacancyRevision.findUnique({
          where: {
            vacancyId_revision: {
              vacancyId: vacancy.id,
              revision: latest.publishedRevision,
            },
          },
        });
        if (latest.publishedRevision !== parsed.data.revision)
          throw new SubmissionError(
            "The role details changed while you were applying. Please review the role details and reopen the application.",
            409,
          );
        if (!revision)
          throw new SubmissionError(
            "This vacancy is temporarily unavailable.",
            503,
          );
        return tx.application.create({
          include: { confirmation: true },
          data: {
            registration,
            requestKey,
            vacancyId: vacancy.id,
            revisionId: revision.id,
            email: answers.email,
            name: answers.name,
            answers,
            consentVersion: "recruitment-2026-11-22",
            resumeId: resume.id,
            confirmation: {
              create: {
                payload: {
                  from: process.env.APPLICATION_FROM_EMAIL!,
                  to: answers.email,
                  reply_to: process.env.APPLICATION_REPLY_TO!,
                  subject: `Application received · ${content.title}`,
                  text: confirmationText(
                    answers.name,
                    content.title,
                    registration,
                    new Date(),
                  ),
                },
              },
            },
          },
        });
      },
      { maxWait: 10000, timeout: 20000 },
    );
    stage = "confirmation-schedule";
    if (saved.confirmation)
      after(() => processConfirmation(saved.confirmation!.id));
    return reply({ registration: saved.registration }, 201);
  } catch (error) {
    if (error instanceof SubmissionError)
      return reply({ error: error.message }, error.status);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Concurrent retries may both reach the database. Only return a receipt to the holder of its random request key.
      return reply(
        {
          error:
            "This application was already submitted. Retry once to recover your receipt, or check your confirmation email.",
        },
        409,
      );
    }
    // Never log raw errors: Prisma/provider messages can contain applicant data.
    console.error("Application submission failed", {
      stage,
      elapsedMs: Date.now() - startedAt,
      code:
        error instanceof Prisma.PrismaClientKnownRequestError
          ? error.code
          : undefined,
      type: error instanceof Error ? error.name : "UnknownError",
    });
    if (isDatabaseUnavailable(error))
      return reply(
        {
          error:
            "The application database is temporarily busy. Your answers are still here. Please try again shortly.",
        },
        503,
      );
    return reply(
      {
        error:
          "We couldn’t complete your application. Your answers are still here. Please try again.",
      },
      503,
    );
  }
}
