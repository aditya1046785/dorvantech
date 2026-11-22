"use server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { retentionSchema } from "@/lib/recruitment-lifecycle-schema";
import { assertResumeStorage } from "@/lib/resume-storage";
import { ReviewConflict } from "@/lib/applicant-review";
import type { ReviewResult } from "../applications/actions";
export async function saveRetention(
  _: ReviewResult,
  form: FormData,
): Promise<ReviewResult> {
  await requireOwner();
  const parsed = retentionSchema.safeParse({
    version: form.get("version"),
    retentionDays: form.get("retentionDays"),
    autoDelete: form.get("autoDelete") === "on",
    acknowledged: form.get("acknowledged") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { version, retentionDays, autoDelete } = parsed.data;
  try {
    await db.$transaction(async (tx) => {
      if (version === 0)
        await tx.recruitmentSettings.create({
          data: { retentionDays, autoDelete },
        });
      else {
        const changed = await tx.recruitmentSettings.updateMany({
          where: { id: "recruitment", version },
          data: { retentionDays, autoDelete, version: { increment: 1 } },
        });
        if (!changed.count)
          throw new ReviewConflict(
            "These settings changed in another tab. Reload before saving.",
          );
      }
      await tx.auditLog.create({
        data: { action: "RECRUITMENT_RETENTION_UPDATED" },
      });
    });
    revalidatePath("/aditya/internships/settings");
    return { success: "Retention settings saved.", version: version + 1 };
  } catch (error) {
    return {
      error:
        error instanceof ReviewConflict
          ? error.message
          : "Unable to save settings. Reload and try again.",
    };
  }
}
export async function checkPrivateStorage(): Promise<ReviewResult> {
  await requireOwner();
  try {
    await assertResumeStorage();
    return {
      success:
        "Vercel Blob connection verified. Uploads enforce private access. No file was uploaded.",
    };
  } catch {
    return {
      error:
        "Could not verify the private Vercel Blob store. Check its configuration and credentials.",
    };
  }
}
