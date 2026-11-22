import "server-only";
import { Resend } from "resend";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import {
  deliveryStates,
  strongestDelivery,
} from "./recruitment-lifecycle-schema";
export function verifyDeliveryWebhook(
  payload: string,
  headers: Headers,
  secret: string,
) {
  return new Resend("webhook-verification-only").webhooks.verify({
    payload,
    headers: {
      id: headers.get("svix-id") ?? "",
      timestamp: headers.get("svix-timestamp") ?? "",
      signature: headers.get("svix-signature") ?? "",
    },
    webhookSecret: secret,
  });
}
const deliveryEventSchema = z.object({
  type: z.string().max(80),
  created_at: z.iso.datetime({ offset: true }),
  data: z.object({ email_id: z.string().min(1).max(200) }),
});
export async function reconcileDelivery(
  tx: Prisma.TransactionClient,
  providerId: string,
) {
  await tx.$queryRaw(
    Prisma.sql`SELECT "id" FROM "ConfirmationEmail" WHERE "providerId"=${providerId} FOR UPDATE`,
  );
  const events = await tx.recruitmentWebhookEvent.findMany({
    where: { providerId },
    select: { type: true, occurredAt: true },
    orderBy: { occurredAt: "desc" },
    take: 100,
  });
  const best = strongestDelivery(events);
  if (!best) return;
  const existing = await tx.confirmationEmail.findMany({
    where: { providerId },
    select: { id: true, deliveryStatus: true, deliveryUpdatedAt: true },
  });
  const rank = (status: string) =>
    Object.values(deliveryStates).find((entry) => entry.status === status)
      ?.rank ?? -1;
  for (const email of existing) {
    if (rank(email.deliveryStatus) > deliveryStates[best.type].rank) continue;
    if (
      email.deliveryStatus === deliveryStates[best.type].status &&
      email.deliveryUpdatedAt &&
      email.deliveryUpdatedAt > best.occurredAt
    )
      continue;
    await tx.confirmationEmail.update({
      where: { id: email.id },
      data: {
        deliveryStatus: deliveryStates[best.type].status,
        deliveryUpdatedAt: best.occurredAt,
      },
    });
  }
  if (existing.length)
    await tx.recruitmentWebhookEvent.updateMany({
      where: { providerId, appliedAt: null },
      data: { appliedAt: new Date() },
    });
  else
    await tx.recruitmentWebhookEvent.updateMany({
      where: { providerId, appliedAt: null },
      data: { nextCheck: new Date(Date.now() + 300000) },
    });
}
export async function recordDeliveryEvent(id: string, payload: unknown) {
  const parsed = deliveryEventSchema.safeParse(payload);
  if (!parsed.success || !deliveryStates[parsed.data.type]) return;
  const event = parsed.data;
  await db.$transaction(async (tx) => {
    // Persist no recipients, subjects, content or bounce descriptions.
    await tx.recruitmentWebhookEvent.createMany({
      data: [
        {
          id,
          providerId: event.data.email_id,
          type: event.type,
          occurredAt: new Date(event.created_at),
        },
      ],
      skipDuplicates: true,
    });
    await reconcileDelivery(tx, event.data.email_id);
  });
}
export async function reconcilePendingDelivery() {
  const pending = await db.recruitmentWebhookEvent.findMany({
    where: { appliedAt: null, nextCheck: { lte: new Date() } },
    select: { providerId: true },
    distinct: ["providerId"],
    orderBy: { receivedAt: "desc" },
    take: 50,
  });
  for (const event of pending)
    await db.$transaction((tx) => reconcileDelivery(tx, event.providerId));
  await db.recruitmentWebhookEvent.deleteMany({
    where: { receivedAt: { lt: new Date(Date.now() - 30 * 86400000) } },
  });
}
