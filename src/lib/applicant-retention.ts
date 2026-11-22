import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { isFinalStatus, retentionCutoff } from "./recruitment-lifecycle-schema";
import { ReviewConflict } from "./applicant-review";
export async function eraseApplicant(
  id: string,
  options: { version: number; registration?: string; retention?: boolean },
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT "id" FROM "Application" WHERE "id"=${id} FOR UPDATE`,
    );
    const application = await tx.application.findUnique({ where: { id } });
    if (!application) throw new ReviewConflict("Applicant not found.");
    if (application.version !== options.version)
      throw new ReviewConflict(
        "This application changed. Reload before deleting it.",
      );
    if (options.retention) {
      await tx.$queryRaw(
        Prisma.sql`SELECT "id" FROM "RecruitmentSettings" WHERE "id"='recruitment' FOR UPDATE`,
      );
      const policy = await tx.recruitmentSettings.findUnique({
        where: { id: "recruitment" },
      });
      if (
        !policy?.autoDelete ||
        !isFinalStatus(application.status) ||
        !application.finalizedAt ||
        application.finalizedAt > retentionCutoff(policy.retentionDays)
      )
        return false;
    } else if (options.registration !== application.registration)
      throw new ReviewConflict(
        "Enter the exact registration number to confirm deletion.",
      );
    await tx.$queryRaw(
      Prisma.sql`SELECT "id" FROM "ConfirmationEmail" WHERE "applicationId"=${id} FOR UPDATE`,
    );
    const email = await tx.confirmationEmail.findUnique({
      where: { applicationId: id },
    });
    if (email?.lockedUntil && email.lockedUntil > new Date())
      throw new ReviewConflict(
        "The confirmation email is being processed. Try deleting again in two minutes.",
      );
    if (email?.providerId)
      await tx.recruitmentWebhookEvent.deleteMany({
        where: { providerId: email.providerId },
      });
    await tx.application.delete({ where: { id } });
    await tx.resumeObject.update({
      where: { id: application.resumeId },
      data: { filename: "deleted-resume.pdf", deleteAfter: new Date() },
    });
    return true;
  });
}
export async function purgeExpiredApplicants() {
  const policy = await db.recruitmentSettings.findUnique({
    where: { id: "recruitment" },
  });
  if (!policy?.autoDelete) return 0;
  const expired = await db.application.findMany({
    where: {
      status: { in: ["SELECTED", "REJECTED", "WITHDRAWN"] },
      finalizedAt: { lte: retentionCutoff(policy.retentionDays) },
    },
    select: { id: true, version: true },
    take: 20,
    orderBy: { finalizedAt: "asc" },
  });
  let deleted = 0;
  for (const row of expired) {
    try {
      if (
        await eraseApplicant(row.id, { version: row.version, retention: true })
      )
        deleted++;
    } catch {
      /* Retry busy/changed records on the next scheduled run. */
    }
  }
  return deleted;
}
