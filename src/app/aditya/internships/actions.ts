"use server";
import { applicationsEnabled } from "@/lib/recruitment-config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import {
  publicationErrors,
  vacancySchema,
  vacancySlugSchema,
} from "@/lib/vacancy-schema";

export type VacancyResult = {
  error?: string;
  success?: string;
  version?: number;
};
export async function saveVacancy(
  _: VacancyResult,
  form: FormData,
): Promise<VacancyResult> {
  await requireOwner();
  const parsed = vacancySchema.safeParse(Object.fromEntries(form));
  const slug = vacancySlugSchema.safeParse(form.get("slug"));
  if (!parsed.success)
    return {
      error: parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(" "),
    };
  if (!slug.success) return { error: slug.error.issues[0].message };
  const intent = String(form.get("intent") || "save");
  if (!["save", "publish", "close", "archive", "restore"].includes(intent))
    return { error: "Unknown action." };
  if (intent === "publish") {
    const errors = publicationErrors(parsed.data);
    if (errors.length) return { error: errors.join(" ") };
  }
  const id = String(form.get("id") || "");
  let savedId = id;
  let version = 1;
  try {
    await db.$transaction(async (tx) => {
      const current = id
        ? await tx.vacancy.findUnique({ where: { id } })
        : null;
      if (id && !current) throw Error("Vacancy not found.");
      if (current && current.version !== Number(form.get("version")))
        throw Error(
          "This vacancy changed in another tab. Reload before saving.",
        );
      if (current?.published && current.slug !== slug.data)
        throw Error("The URL cannot change after publication.");
      if (!current && !["save", "publish"].includes(intent))
        throw Error("Save the vacancy first.");
      if (current?.status === "ARCHIVED" && intent !== "restore")
        throw Error("Restore this vacancy before editing.");
      if (intent === "restore" && current?.status !== "ARCHIVED")
        throw Error("Only archived vacancies can be restored.");
      if (intent === "close" && current?.status !== "PUBLISHED")
        throw Error("Only published vacancies can be closed.");
      const status =
        intent === "publish"
          ? "PUBLISHED"
          : intent === "close"
            ? "CLOSED"
            : intent === "archive"
              ? "ARCHIVED"
              : intent === "restore"
                ? "DRAFT"
                : (current?.status ?? "DRAFT");
      const revision =
        (current?.publishedRevision ?? 0) + (intent === "publish" ? 1 : 0);
      const data = {
        slug: slug.data,
        draft: parsed.data,
        status,
        ...(intent === "publish"
          ? { published: parsed.data, publishedRevision: revision }
          : {}),
      };
      if (current) {
        const result = await tx.vacancy.updateMany({
          where: { id, version: current.version },
          data: { ...data, version: { increment: 1 } },
        });
        if (!result.count)
          throw Error(
            "This vacancy changed in another tab. Reload before saving.",
          );
        version = current.version + 1;
      } else {
        const created = await tx.vacancy.create({ data });
        savedId = created.id;
      }
      if (intent === "publish")
        await tx.vacancyRevision.create({
          data: { vacancyId: savedId, revision, content: parsed.data },
        });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error:
          error.code === "P2002"
            ? "That URL is already in use. Choose another slug."
            : "Unable to save. Please try again.",
      };
    }
    return {
      error: error instanceof Error ? error.message : "Unable to save.",
    };
  }
  for (const path of [
    "/aditya/internships",
    `/aditya/internships/${savedId}`,
    `/aditya/internships/${savedId}/preview`,
    "/",
    "/careers",
    `/careers/${slug.data}`,
  ])
    revalidatePath(path);
  if (!id) redirect(`/aditya/internships/${savedId}`);
  return {
    success:
      intent === "publish"
        ? applicationsEnabled()
          ? "Published. Students can now proceed to the application."
          : "Vacancy published. Live applications are off; preview the questionnaire or complete recruitment setup."
        : intent === "save"
          ? "Draft saved. Published content is unchanged."
          : `Vacancy ${intent === "close" ? "closed" : intent === "archive" ? "archived" : "restored as a draft"}.`,
    version,
  };
}
