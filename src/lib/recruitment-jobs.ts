import {
  reconcileDelivery,
  reconcilePendingDelivery,
} from "./recruitment-webhooks";
import { purgeExpiredApplicants } from "./applicant-retention";
import "server-only";
import { db } from "./db";
import { deleteResume } from "./resume-storage";
import { z } from "zod";
const emailPayload = z.object({
  from: z.string(),
  to: z.string(),
  reply_to: z.string(),
  subject: z.string(),
  text: z.string(),
});
export async function processConfirmation(id: string) {
  const now = new Date();
  const lease = new Date(now.getTime() + 120000);
  const claim = await db.confirmationEmail.updateMany({
    where: {
      id,
      status: "PENDING",
      nextAttempt: { lte: now },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
    },
    data: { lockedUntil: lease, attempts: { increment: 1 } },
  });
  if (!claim.count) return;
  const job = await db.confirmationEmail.findUniqueOrThrow({ where: { id } });
  // Resend deduplicates keys for 24h. Ambiguous older attempts require operator review.
  if (
    job.attempts > 1 &&
    now.getTime() - job.createdAt.getTime() > 20 * 3600000
  ) {
    await db.confirmationEmail.updateMany({
      where: { id, lockedUntil: lease },
      data: { status: "NEEDS_REVIEW", lockedUntil: null },
    });
    return;
  }
  try {
    const payload = emailPayload.parse(job.payload);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `application-confirmation/${id}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw Error("Email provider rejected request.");
    const result = z.object({ id: z.string() }).parse(await response.json());
    await db.$transaction(async (tx) => {
      await tx.confirmationEmail.updateMany({
        where: { id, lockedUntil: lease, status: "PENDING" },
        data: {
          status: "SENT",
          providerId: result.id,
          sentAt: new Date(),
          lockedUntil: null,
        },
      });
      await reconcileDelivery(tx, result.id);
    });
  } catch {
    await db.confirmationEmail.updateMany({
      where: { id, lockedUntil: lease },
      data: {
        status: job.attempts >= 6 ? "NEEDS_REVIEW" : "PENDING",
        lockedUntil: null,
        nextAttempt: new Date(
          Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts),
        ),
      },
    });
  }
}
export async function runRecruitmentJobs() {
  const deadline = Date.now() + 240000;
  const applicantsDeleted = await purgeExpiredApplicants();
  await reconcilePendingDelivery();
  const jobs = await db.confirmationEmail.findMany({
    where: {
      status: "PENDING",
      nextAttempt: { lte: new Date() },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
    },
    take: 10,
    select: { id: true },
  });
  for (const job of jobs) {
    if (Date.now() > deadline) break;
    await processConfirmation(job.id);
  }
  const orphans = await db.resumeObject.findMany({
    where: {
      application: null,
      OR: [
        { deleteAfter: { lte: new Date() } },
        { createdAt: { lt: new Date(Date.now() - 86400000) } },
      ],
    },
    take: 30,
  });
  let cleaned = 0;
  for (const orphan of orphans) {
    if (Date.now() > deadline) break;
    try {
      await deleteResume(orphan.objectKey);
      await db.resumeObject.delete({ where: { id: orphan.id } });
      cleaned++;
    } catch {
      /* Retain the record so the next job can retry deletion. */
    }
  }
  await db.auditLog.create({ data: { action: "RECRUITMENT_JOB_COMPLETED" } });
  return {
    emailJobs: jobs.length,
    orphanFilesRemoved: cleaned,
    applicantsDeleted,
  };
}
