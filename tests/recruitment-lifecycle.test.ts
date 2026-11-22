import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isFinalStatus,
  retentionCutoff,
  retentionSchema,
  deletionSchema,
  strongestDelivery,
  deliveryLabel,
} from "../src/lib/recruitment-lifecycle-schema";
test("retention is explicit and restricted to final recruitment stages", () => {
  assert.equal(isFinalStatus("SELECTED"), true);
  assert.equal(isFinalStatus("REJECTED"), true);
  assert.equal(isFinalStatus("WITHDRAWN"), true);
  for (const status of ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW"])
    assert.equal(isFinalStatus(status), false);
  assert.equal(
    retentionSchema.safeParse({
      version: 0,
      retentionDays: 180,
      autoDelete: false,
      acknowledged: false,
    }).success,
    true,
  );
  assert.equal(
    retentionSchema.safeParse({
      version: 0,
      retentionDays: 180,
      autoDelete: true,
      acknowledged: false,
    }).success,
    false,
  );
  assert.equal(
    retentionSchema.safeParse({
      version: 0,
      retentionDays: 29,
      autoDelete: true,
      acknowledged: true,
    }).success,
    false,
  );
  assert.equal(
    retentionSchema.safeParse({
      version: 0,
      retentionDays: 731,
      autoDelete: false,
      acknowledged: false,
    }).success,
    false,
  );
  assert.equal(
    retentionCutoff(180, new Date("2026-11-22T00:00:00Z")).toISOString(),
    "2026-05-26T00:00:00.000Z",
  );
});
test("deletion requires a current version and a registration confirmation", () => {
  assert.equal(
    deletionSchema.safeParse({ id: "id", version: 1, registration: "" })
      .success,
    false,
  );
  assert.equal(
    deletionSchema.safeParse({ id: "id", version: 0, registration: "DVT-123" })
      .success,
    false,
  );
  assert.equal(
    deletionSchema.parse({ id: "id", version: 2, registration: " DVT-123 " })
      .registration,
    "DVT-123",
  );
});
test("delivery events cannot downgrade delivery or permanent failure due to arrival order", () => {
  const newer = new Date("2026-11-22T12:00:00Z");
  const older = new Date("2026-11-22T11:00:00Z");
  assert.equal(
    strongestDelivery([
      { type: "email.delivery_delayed", occurredAt: newer },
      { type: "email.delivered", occurredAt: older },
    ])?.type,
    "email.delivered",
  );
  assert.equal(
    strongestDelivery([
      { type: "email.bounced", occurredAt: older },
      { type: "email.delivered", occurredAt: newer },
    ])?.type,
    "email.bounced",
  );
  assert.equal(
    strongestDelivery([{ type: "email.opened", occurredAt: newer }]),
    undefined,
  );
  assert.equal(deliveryLabel("DELIVERED"), "Delivered");
});
