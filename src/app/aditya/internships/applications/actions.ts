"use server";
import { redirect } from "next/navigation";
import { eraseApplicant } from "@/lib/applicant-retention";
import { deletionSchema } from "@/lib/recruitment-lifecycle-schema";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { noteSchema, reviewSchema } from "@/lib/applicant-schema";
import {
  appendApplicantNote,
  queueConfirmationRetry,
  ReviewConflict,
  updateApplicantStatus,
} from "@/lib/applicant-review";
import { processConfirmation } from "@/lib/recruitment-jobs";
export type ReviewResult = {
  error?: string;
  success?: string;
  version?: number;
};
function refresh(id: string) {
  for (const path of [
    "/aditya/internships",
    "/aditya/internships/applications",
    `/aditya/internships/applications/${id}`,
  ])
    revalidatePath(path);
}
export async function changeApplicantStatus(
  _: ReviewResult,
  form: FormData,
): Promise<ReviewResult> {
  await requireOwner();
  const parsed = reviewSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Choose a valid application status." };
  const { id, version, status } = parsed.data;
  try {
    const next = await updateApplicantStatus(id, version, status);
    refresh(id);
    return { version: next, success: "Status updated. No email was sent." };
  } catch (error) {
    return {
      error:
        error instanceof ReviewConflict
          ? error.message
          : "Unable to update the status. Please try again.",
    };
  }
}
export async function addApplicantNote(
  _: ReviewResult,
  form: FormData,
): Promise<ReviewResult> {
  await requireOwner();
  const parsed = noteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await appendApplicantNote(parsed.data.id, parsed.data.body);
    refresh(parsed.data.id);
    return { success: "Internal note added." };
  } catch {
    return { error: "Unable to save this note. Please try again." };
  }
}
export async function retryApplicantEmail(
  _: ReviewResult,
  form: FormData,
): Promise<ReviewResult> {
  await requireOwner();
  const id = String(form.get("id") ?? "");
  if (!id || id.length > 100) return { error: "Invalid application." };
  if (!process.env.RESEND_API_KEY)
    return { error: "Configure Resend before retrying email." };
  try {
    const emailId = await queueConfirmationRetry(id);
    after(() => processConfirmation(emailId));
    refresh(id);
    return {
      success: "Confirmation queued. Refresh to see its latest email status.",
    };
  } catch (error) {
    return {
      error:
        error instanceof ReviewConflict
          ? error.message
          : "Unable to queue the email. Please try again.",
    };
  }
}

export async function deleteApplicant(
  _: ReviewResult,
  form: FormData,
): Promise<ReviewResult> {
  await requireOwner();
  const parsed = deletionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await eraseApplicant(parsed.data.id, {
      version: parsed.data.version,
      registration: parsed.data.registration,
    });
  } catch (error) {
    return {
      error:
        error instanceof ReviewConflict
          ? error.message
          : "Unable to delete the application. Please retry.",
    };
  }
  refresh(parsed.data.id);
  revalidatePath("/aditya/internships/settings");
  redirect("/aditya/internships/applications");
}
