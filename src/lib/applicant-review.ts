import { isFinalStatus } from "./recruitment-lifecycle-schema";
import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";
export class ReviewConflict extends Error {}
export async function updateApplicantStatus(
  id: string,
  version: number,
  status: string,
) {
  return db.$transaction(async (tx) => {
    const current = await tx.application.findUnique({
      where: { id },
      select: { status: true, version: true },
    });
    if (!current) throw new ReviewConflict("Applicant not found.");
    if (current.version !== version)
      throw new ReviewConflict(
        "The application changed in another tab. Reload before updating its status.",
      );
    if (current.status === status) return version;
    const result = await tx.application.updateMany({
      where: { id, version },
      data: {
        status,
        version: { increment: 1 },
        finalizedAt: isFinalStatus(status) ? new Date() : null,
      },
    });
    if (!result.count)
      throw new ReviewConflict(
        "The application changed in another tab. Reload before updating its status.",
      );
    await tx.applicationActivity.create({
      data: {
        applicationId: id,
        kind: "STATUS",
        fromStatus: current.status,
        toStatus: status,
      },
    });
    return version + 1;
  });
}
export async function appendApplicantNote(id: string, body: string) {
  // Notes are append-only, so parallel notes never overwrite one another.
  return db.applicationActivity.create({
    data: { applicationId: id, kind: "NOTE", body },
  });
}
export async function queueConfirmationRetry(applicationId: string) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT "id" FROM "Application" WHERE "id"=${applicationId} FOR UPDATE`,
    );
    const email = await tx.confirmationEmail.findUnique({
      where: { applicationId },
    });
    if (!email)
      throw new ReviewConflict(
        "This application has no confirmation email record.",
      );
    if (email.status === "SENT")
      throw new ReviewConflict(
        "The email provider already accepted this confirmation. Check its delivery in Resend before sending another message.",
      );
    if (Date.now() - email.createdAt.getTime() > 20 * 3600000)
      throw new ReviewConflict(
        "This email needs provider review because its safe automatic retry window has ended. Check the message in Resend before contacting the applicant.",
      );
    const result = await tx.confirmationEmail.updateMany({
      where: {
        id: email.id,
        status: { in: ["PENDING", "NEEDS_REVIEW"] },
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
      },
      data: { status: "PENDING", nextAttempt: new Date() },
    });
    if (!result.count)
      throw new ReviewConflict(
        "This email is currently being processed. Refresh in a moment.",
      );
    await tx.applicationActivity.create({
      data: {
        applicationId,
        kind: "EMAIL_RETRY",
        body: "Confirmation retry requested.",
      },
    });
    return email.id;
  });
}
