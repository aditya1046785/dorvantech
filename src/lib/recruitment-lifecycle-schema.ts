import { z } from "zod";
export const finalStatuses = ["SELECTED", "REJECTED", "WITHDRAWN"] as const;
export function isFinalStatus(status: string) {
  return finalStatuses.includes(status as (typeof finalStatuses)[number]);
}
export function retentionCutoff(days: number, now = new Date()) {
  return new Date(now.getTime() - days * 86400000);
}
export const retentionSchema = z
  .object({
    version: z.coerce.number().int().min(0),
    retentionDays: z.coerce.number().int().min(30).max(730),
    autoDelete: z.boolean(),
    acknowledged: z.boolean(),
  })
  .refine((v) => !v.autoDelete || v.acknowledged, {
    message:
      "Confirm that you understand automatic deletion before enabling it.",
    path: ["acknowledged"],
  });
export const deletionSchema = z.object({
  id: z.string().min(1).max(100),
  version: z.coerce.number().int().positive(),
  registration: z.string().trim().min(1).max(100),
});
export const deliveryStates: Record<string, { status: string; rank: number }> =
  {
    "email.sent": { status: "SENT", rank: 0 },
    "email.delivery_delayed": { status: "DELAYED", rank: 1 },
    "email.delivered": { status: "DELIVERED", rank: 2 },
    "email.failed": { status: "FAILED", rank: 3 },
    "email.suppressed": { status: "SUPPRESSED", rank: 4 },
    "email.bounced": { status: "BOUNCED", rank: 5 },
    "email.complained": { status: "COMPLAINED", rank: 6 },
  };
export function strongestDelivery(
  events: { type: string; occurredAt: Date }[],
) {
  return events
    .filter((e) => deliveryStates[e.type])
    .sort(
      (a, b) =>
        deliveryStates[b.type].rank - deliveryStates[a.type].rank ||
        b.occurredAt.getTime() - a.occurredAt.getTime(),
    )[0];
}
export function deliveryLabel(status?: string) {
  return (
    (
      {
        UNKNOWN: "Not reported",
        SENT: "Sent by provider",
        DELAYED: "Delivery delayed",
        DELIVERED: "Delivered",
        FAILED: "Delivery failed",
        SUPPRESSED: "Suppressed",
        BOUNCED: "Bounced",
        COMPLAINED: "Spam complaint",
      } as Record<string, string>
    )[status ?? "UNKNOWN"] ?? "Not reported"
  );
}
