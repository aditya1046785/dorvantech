import { mockBlobStorage } from "./blob-mock";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { emptyVacancy } from "../src/lib/vacancy-schema";
test(
  "signed delivery events, deletion recovery and opt-in retention",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    assert.equal(
      process.env.DATABASE_URL_POOLED,
      process.env.TEST_DATABASE_URL,
      "Use the same disposable database for server modules",
    );
    const { db } = await import("../src/lib/db");
    const { eraseApplicant, purgeExpiredApplicants } =
      await import("../src/lib/applicant-retention");
    const {
      recordDeliveryEvent,
      reconcilePendingDelivery,
      verifyDeliveryWebhook,
    } = await import("../src/lib/recruitment-webhooks");
    const { runRecruitmentJobs } = await import("../src/lib/recruitment-jobs");
    const { POST } = await import("../src/app/api/webhooks/resend/route");
    const nonce = randomUUID();
    const providerId = `provider-${nonce}`;
    const vacancy = await db.vacancy.create({
      data: { slug: `lifecycle-${nonce}`, draft: emptyVacancy },
    });
    const revision = await db.vacancyRevision.create({
      data: { vacancyId: vacancy.id, revision: 1, content: emptyVacancy },
    });
    const savedPolicy = await db.recruitmentSettings.findUnique({
      where: { id: "recruitment" },
    });
    const oldFetch = globalThis.fetch;
    const appIds: string[] = [];
    const resumeIds: string[] = [];
    async function makeApplication(
      status = "NEW",
      finalizedAt: Date | null = null,
    ) {
      const resume = await db.resumeObject.create({
        data: {
          objectKey: `applications/${randomUUID()}.pdf`,
          filename: "Private Applicant Name.pdf",
          size: 30,
          scannedAt: new Date(),
        },
      });
      resumeIds.push(resume.id);
      const id = randomUUID();
      const app = await db.application.create({
        data: {
          vacancyId: vacancy.id,
          revisionId: revision.id,
          email: `${id}@example.com`,
          name: "Private Applicant",
          answers: {},
          consentVersion: "test",
          resumeId: resume.id,
          requestKey: id,
          registration: `TEST-${id}`,
          status,
          finalizedAt,
          confirmation: { create: { payload: {} } },
        },
      });
      appIds.push(app.id);
      return app;
    }
    const app = await makeApplication();
    const blobMock = mockBlobStorage();
    try {
      const body = {
        type: "email.delivered",
        created_at: new Date().toISOString(),
        data: { email_id: providerId, to: ["do-not-persist@example.com"] },
      };
      const secretBytes = randomBytes(32);
      const secret = `whsec_${secretBytes.toString("base64")}`;
      const raw = JSON.stringify(body);
      const eventId = `msg_${nonce}`;
      const timestamp = String(Math.floor(Date.now() / 1000));
      const signature = createHmac("sha256", secretBytes)
        .update(`${eventId}.${timestamp}.${raw}`)
        .digest("base64");
      const headers = new Headers({
        "svix-id": eventId,
        "svix-timestamp": timestamp,
        "svix-signature": `v1,${signature}`,
      });
      assert.ok(verifyDeliveryWebhook(raw, headers, secret));
      assert.throws(() => verifyDeliveryWebhook(raw + " ", headers, secret));
      process.env.RESEND_WEBHOOK_SECRET = secret;
      assert.equal(
        (
          await POST(
            new Request("http://localhost/api/webhooks/resend", {
              method: "POST",
              body: raw,
              headers,
            }),
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await POST(
            new Request("http://localhost/api/webhooks/resend", {
              method: "POST",
              body: raw,
              headers,
            }),
          )
        ).status,
        200,
      );
      assert.equal(
        await db.recruitmentWebhookEvent.count({ where: { id: eventId } }),
        1,
      );
      const stored = await db.recruitmentWebhookEvent.findUniqueOrThrow({
        where: { id: eventId },
      });
      assert.equal(JSON.stringify(stored).includes("do-not-persist"), false);
      await db.confirmationEmail.update({
        where: { applicationId: app.id },
        data: { providerId, status: "SENT" },
      });
      await db.recruitmentWebhookEvent.update({
        where: { id: eventId },
        data: { nextCheck: new Date(0) },
      });
      await reconcilePendingDelivery();
      assert.equal(
        (
          await db.confirmationEmail.findUniqueOrThrow({
            where: { applicationId: app.id },
          })
        ).deliveryStatus,
        "DELIVERED",
      );
      await Promise.all([
        recordDeliveryEvent(`bounce-${nonce}`, {
          ...body,
          type: "email.bounced",
        }),
        recordDeliveryEvent(`delay-${nonce}`, {
          ...body,
          type: "email.delivery_delayed",
        }),
      ]);
      assert.equal(
        (
          await db.confirmationEmail.findUniqueOrThrow({
            where: { applicationId: app.id },
          })
        ).deliveryStatus,
        "BOUNCED",
      );
      await db.recruitmentWebhookEvent.deleteMany({ where: { providerId } });
      await recordDeliveryEvent(`late-${nonce}`, {
        ...body,
        type: "email.sent",
      });
      assert.equal(
        (
          await db.confirmationEmail.findUniqueOrThrow({
            where: { applicationId: app.id },
          })
        ).deliveryStatus,
        "BOUNCED",
      );
      assert.equal(
        (
          await POST(
            new Request("http://localhost/api/webhooks/resend", {
              method: "POST",
              body: raw,
              headers: {
                ...Object.fromEntries(headers),
                "svix-signature": "invalid",
              },
            }),
          )
        ).status,
        400,
      );
      await assert.rejects(() =>
        eraseApplicant(app.id, { version: 1, registration: "wrong" }),
      );
      await db.applicationActivity.create({
        data: {
          applicationId: app.id,
          kind: "NOTE",
          body: "Delete this private note",
        },
      });
      await db.confirmationEmail.update({
        where: { applicationId: app.id },
        data: { lockedUntil: new Date(Date.now() + 60000) },
      });
      await assert.rejects(() =>
        eraseApplicant(app.id, { version: 1, registration: app.registration }),
      );
      await db.confirmationEmail.update({
        where: { applicationId: app.id },
        data: { lockedUntil: null },
      });
      await assert.rejects(() =>
        eraseApplicant(app.id, { version: 2, registration: app.registration }),
      );
      assert.equal(
        await eraseApplicant(app.id, {
          version: 1,
          registration: app.registration,
        }),
        true,
      );
      assert.equal(
        await db.application.findUnique({ where: { id: app.id } }),
        null,
      );
      assert.equal(
        await db.applicationActivity.count({
          where: { applicationId: app.id },
        }),
        0,
      );
      assert.equal(
        await db.confirmationEmail.findUnique({
          where: { applicationId: app.id },
        }),
        null,
      );
      const scrubbed = await db.resumeObject.findUniqueOrThrow({
        where: { id: app.resumeId },
      });
      assert.equal(scrubbed.filename, "deleted-resume.pdf");
      assert.ok(scrubbed.deleteAfter);
      blobMock.api
        .intercept({ path: "/api/blob/delete", method: "POST" })
        .reply(403, { error: { code: "forbidden", message: "unavailable" } });
      await runRecruitmentJobs();
      assert.ok(
        await db.resumeObject.findUnique({ where: { id: app.resumeId } }),
      );
      blobMock.api
        .intercept({ path: "/api/blob/delete", method: "POST" })
        .reply(200, {})
        .persist();
      await runRecruitmentJobs();
      assert.equal(
        await db.resumeObject.findUnique({ where: { id: app.resumeId } }),
        null,
      );
      const oldDate = new Date(Date.now() - 200 * 86400000);
      const expired = await makeApplication("REJECTED", oldDate);
      const active = await makeApplication("REVIEWING", oldDate);
      const recent = await makeApplication("SELECTED", new Date());
      await db.recruitmentSettings.upsert({
        where: { id: "recruitment" },
        create: { autoDelete: false, retentionDays: 180 },
        update: { autoDelete: false, retentionDays: 180 },
      });
      assert.equal(await purgeExpiredApplicants(), 0);
      assert.ok(await db.application.findUnique({ where: { id: expired.id } }));
      await db.recruitmentSettings.update({
        where: { id: "recruitment" },
        data: { autoDelete: true },
      });
      assert.equal(await purgeExpiredApplicants(), 1);
      assert.equal(
        await db.application.findUnique({ where: { id: expired.id } }),
        null,
      );
      assert.ok(await db.application.findUnique({ where: { id: active.id } }));
      assert.ok(await db.application.findUnique({ where: { id: recent.id } }));
    } finally {
      await blobMock.close();
      globalThis.fetch = oldFetch;
      await db.application.deleteMany({ where: { id: { in: appIds } } });
      await db.resumeObject.deleteMany({ where: { id: { in: resumeIds } } });
      await db.recruitmentWebhookEvent.deleteMany({ where: { providerId } });
      if (savedPolicy)
        await db.recruitmentSettings.update({
          where: { id: "recruitment" },
          data: {
            retentionDays: savedPolicy.retentionDays,
            autoDelete: savedPolicy.autoDelete,
            version: savedPolicy.version,
          },
        });
      else
        await db.recruitmentSettings.deleteMany({
          where: { id: "recruitment" },
        });
      await db.vacancyRevision.delete({ where: { id: revision.id } });
      await db.vacancy.delete({ where: { id: vacancy.id } });
      await db.$disconnect();
    }
  },
);
