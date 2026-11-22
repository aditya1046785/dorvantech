import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { emptyVacancy } from "../src/lib/vacancy-schema";
import { emptyAnswers } from "../src/lib/application-schema";
test(
  "production HTTP submission, PDF access, delivery tracking and retention cleanup with mocked providers",
  {
    skip:
      !process.env.TEST_DATABASE_URL ||
      !process.env.TEST_APP_URL ||
      !process.env.TEST_MOCK_SERVICES,
  },
  async () => {
    const db = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL,
    });
    const base = process.env.TEST_APP_URL!;
    const nonce = randomUUID();
    const token = randomUUID();
    const sessionId = createHash("sha256").update(token).digest("hex");
    let createdOwner = false;
    let vacancyId = "";
    const resumeIds: string[] = [];
    const originalPolicy = await db.recruitmentSettings.findUnique({
      where: { id: "recruitment" },
    });
    try {
      if (!(await db.adminUser.findUnique({ where: { id: "owner" } }))) {
        await db.adminUser.create({
          data: {
            id: "owner",
            email: "launch-owner@example.com",
            passwordHash: "unused-test-hash",
            totpSecret: "unused-test-secret",
            recoveryCodes: [],
          },
        });
        createdOwner = true;
      }
      await db.session.create({
        data: {
          id: sessionId,
          userId: "owner",
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      const content = {
        ...emptyVacancy,
        title: "Launch Test Internship",
        summary: "A test opportunity",
        deadline: "2099-01-01",
      };
      const vacancy = await db.vacancy.create({
        data: {
          slug: `launch-${nonce}`,
          draft: content,
          published: content,
          publishedRevision: 1,
          status: "PUBLISHED",
        },
      });
      vacancyId = vacancy.id;
      await db.vacancyRevision.create({
        data: { vacancyId, revision: 1, content },
      });
      const answers = {
        ...emptyAnswers,
        name: "Launch Test Applicant",
        email: `${nonce}@example.com`,
        location: "Kochi, India",
        educationStatus: "other",
        qualification: "Self taught",
        skills: "React",
        motivation: "I would like to learn and build useful products.",
        startDate: "Immediately",
        hours: "20",
      };
      const pdf = "%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n";
      const requestKey = randomUUID();
      function form(
        options: { requestKey?: string; pdf?: string; revision?: number } = {},
      ) {
        const body = new FormData();
        body.set(
          "application",
          JSON.stringify({
            slug: vacancy.slug,
            answers,
            requestKey: options.requestKey ?? requestKey,
            revision: options.revision ?? 1,
            consent: true,
          }),
        );
        body.set(
          "resume",
          new Blob([options.pdf ?? pdf], { type: "application/pdf" }),
          "resume.pdf",
        );
        return body;
      }
      const headers = { origin: base };
      const apply = await fetch(`${base}/careers/${vacancy.slug}/apply`);
      assert.equal(apply.status, 200);
      assert.equal((await apply.text()).includes("Admin preview"), false);
      const submitted = await fetch(`${base}/api/applications`, {
        method: "POST",
        headers,
        body: form(),
      });
      assert.equal(submitted.status, 201, await submitted.clone().text());
      const receipt = await submitted.json();
      assert.ok(receipt.registration.startsWith("DVT-"));
      const app = await db.application.findUniqueOrThrow({
        where: { requestKey },
      });
      resumeIds.push(app.resumeId);
      assert.equal(app.registration, receipt.registration);
      const repeat = await fetch(`${base}/api/applications`, {
        method: "POST",
        headers,
        body: form(),
      });
      assert.equal(repeat.status, 200);
      assert.equal((await repeat.json()).registration, receipt.registration);
      assert.equal(await db.application.count({ where: { vacancyId } }), 1);
      assert.equal(
        (
          await fetch(`${base}/api/applications`, {
            method: "POST",
            headers,
            body: form({ requestKey: randomUUID() }),
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await fetch(`${base}/api/applications`, {
            method: "POST",
            body: form(),
          })
        ).status,
        403,
      );
      const auth = { cookie: `owner-session=${token}` };
      assert.equal(
        (
          await fetch(
            `${base}/aditya/internships/applications/${app.id}/resume`,
          )
        ).status,
        401,
      );
      const file = await fetch(
        `${base}/aditya/internships/applications/${app.id}/resume`,
        { headers: auth },
      );
      assert.equal(file.status, 200, await file.clone().text());
      assert.equal(file.headers.get("x-frame-options"), "SAMEORIGIN");
      assert.ok(file.headers.get("cache-control")?.includes("no-store"));
      assert.equal(await file.text(), pdf);
      const settings = await fetch(`${base}/aditya/internships/settings`, {
        headers: auth,
      });
      assert.equal(settings.status, 200);
      assert.ok((await settings.text()).includes("Launch readiness"));
      const jobsHeaders = {
        authorization: `Bearer ${process.env.RECRUITMENT_JOBS_SECRET}`,
      };
      await fetch(`${base}/api/internal/recruitment-jobs`, {
        method: "POST",
        headers: jobsHeaders,
      });
      let confirmation = await db.confirmationEmail.findUniqueOrThrow({
        where: { applicationId: app.id },
      });
      for (
        let attempt = 0;
        attempt < 20 && confirmation.status !== "SENT";
        attempt++
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        confirmation = await db.confirmationEmail.findUniqueOrThrow({
          where: { applicationId: app.id },
        });
      }
      assert.equal(confirmation.status, "SENT");
      assert.ok(confirmation.providerId?.startsWith("mock-confirmation-"));
      const payload = JSON.stringify({
        type: "email.delivered",
        created_at: new Date().toISOString(),
        data: { email_id: confirmation.providerId },
      });
      const id = `msg_${nonce}`;
      const timestamp = String(Math.floor(Date.now() / 1000));
      const secret = Buffer.from(
        process.env.RESEND_WEBHOOK_SECRET!.replace(/^whsec_/, ""),
        "base64",
      );
      const signature = createHmac("sha256", secret)
        .update(`${id}.${timestamp}.${payload}`)
        .digest("base64");
      const hook = await fetch(`${base}/api/webhooks/resend`, {
        method: "POST",
        body: payload,
        headers: {
          "svix-id": id,
          "svix-timestamp": timestamp,
          "svix-signature": `v1,${signature}`,
        },
      });
      assert.equal(hook.status, 200);
      assert.equal(
        (
          await db.confirmationEmail.findUniqueOrThrow({
            where: { applicationId: app.id },
          })
        ).deliveryStatus,
        "DELIVERED",
      );
      await db.application.update({
        where: { id: app.id },
        data: {
          status: "REJECTED",
          finalizedAt: new Date(Date.now() - 200 * 86400000),
        },
      });
      await db.recruitmentSettings.upsert({
        where: { id: "recruitment" },
        create: { autoDelete: true, retentionDays: 180 },
        update: { autoDelete: true, retentionDays: 180 },
      });
      const purge = await fetch(`${base}/api/internal/recruitment-jobs`, {
        method: "POST",
        headers: jobsHeaders,
      });
      assert.equal(purge.status, 200);
      assert.equal(
        await db.application.findUnique({ where: { id: app.id } }),
        null,
      );
      assert.equal(
        await db.resumeObject.findUnique({ where: { id: app.resumeId } }),
        null,
      );
      assert.equal(
        (
          await fetch(
            `${base}/aditya/internships/applications/${app.id}/resume`,
            { headers: auth },
          )
        ).status,
        404,
      );
    } finally {
      if (vacancyId) {
        const remaining = await db.application.findMany({
          where: { vacancyId },
          select: { resumeId: true },
        });
        resumeIds.push(...remaining.map((a) => a.resumeId));
        await db.application.deleteMany({ where: { vacancyId } });
        await db.resumeObject.deleteMany({ where: { id: { in: resumeIds } } });
        await db.vacancyRevision.deleteMany({ where: { vacancyId } });
        await db.vacancy.delete({ where: { id: vacancyId } });
      }
      if (originalPolicy)
        await db.recruitmentSettings.update({
          where: { id: "recruitment" },
          data: {
            retentionDays: originalPolicy.retentionDays,
            autoDelete: originalPolicy.autoDelete,
            version: originalPolicy.version,
          },
        });
      else
        await db.recruitmentSettings.deleteMany({
          where: { id: "recruitment" },
        });
      await db.session.deleteMany({ where: { id: sessionId } });
      if (createdOwner) await db.adminUser.delete({ where: { id: "owner" } });
      await db.$disconnect();
    }
  },
);
