import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { emptyVacancy } from "../src/lib/vacancy-schema";
test(
  "HTTP applicant pages require authentication and protect resume access",
  { skip: !process.env.TEST_DATABASE_URL || !process.env.TEST_APP_URL },
  async () => {
    const db = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL,
    });
    const base = process.env.TEST_APP_URL!;
    const token = randomUUID();
    const sessionId = createHash("sha256").update(token).digest("hex");
    const nonce = randomUUID();
    let applicationId = "";
    let vacancyId = "";
    let resumeId = "";
    let createdOwner = false;
    try {
      if (!(await db.adminUser.findUnique({ where: { id: "owner" } }))) {
        await db.adminUser.create({
          data: {
            id: "owner",
            email: "test-owner@example.com",
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
        title: "HTTP integration intern",
        deadline: "2099-01-01",
      };
      const vacancy = await db.vacancy.create({
        data: {
          slug: `http-${nonce}`,
          draft: content,
          published: content,
          publishedRevision: 1,
          status: "PUBLISHED",
        },
      });
      vacancyId = vacancy.id;
      const revision = await db.vacancyRevision.create({
        data: { vacancyId, revision: 1, content },
      });
      const resume = await db.resumeObject.create({
        data: {
          objectKey: `applications/${nonce}.pdf`,
          filename: "test.pdf",
          size: 100,
          scannedAt: new Date(),
        },
      });
      resumeId = resume.id;
      const applicant = await db.application.create({
        data: {
          registration: `HTTP-${nonce}`,
          requestKey: nonce,
          vacancyId,
          revisionId: revision.id,
          name: "HTTP Test Applicant",
          email: "http-test@example.com",
          answers: { educationStatus: "other", qualification: "Self taught" },
          consentVersion: "test",
          resumeId,
        },
      });
      applicationId = applicant.id;
      const route = `/aditya/internships/applications/${applicationId}`;
      const noAuth = await fetch(`${base}${route}`, { redirect: "manual" });
      assert.equal(noAuth.status, 307);
      assert.ok(noAuth.headers.get("location")?.includes("/aditya"));
      const noResume = await fetch(`${base}${route}/resume`, {
        redirect: "manual",
      });
      assert.equal(noResume.status, 401);
      assert.ok(noResume.headers.get("cache-control")?.includes("no-store"));
      assert.equal(
        (await noResume.text()).includes("HTTP Test Applicant"),
        false,
      );
      const headers = { cookie: `owner-session=${token}` };
      const list = await fetch(`${base}/aditya/internships/applications`, {
        headers,
      });
      assert.equal(list.status, 200);
      assert.ok((await list.text()).includes("HTTP Test Applicant"));
      const details = await fetch(`${base}${route}`, { headers });
      assert.equal(details.status, 200);
      const html = await details.text();
      assert.ok(html.includes("HTTP Test Applicant"));
      assert.ok(html.includes("Internal notes"));
      assert.ok(html.includes("iframe"));
      assert.ok(
        details.headers
          .get("content-security-policy")
          ?.includes("frame-src 'self'"),
      );
      const missing = await fetch(
        `${base}/aditya/internships/applications/missing-test/resume`,
        { headers },
      );
      assert.equal(missing.status, 404);
      const overview = await fetch(`${base}/aditya/internships`, { headers });
      assert.equal(overview.status, 200);
      assert.ok((await overview.text()).includes("Submitted applications"));
    } finally {
      if (applicationId)
        await db.application.delete({ where: { id: applicationId } });
      if (resumeId) await db.resumeObject.delete({ where: { id: resumeId } });
      if (vacancyId) {
        await db.vacancyRevision.deleteMany({ where: { vacancyId } });
        await db.vacancy.delete({ where: { id: vacancyId } });
      }
      await db.session.deleteMany({ where: { id: sessionId } });
      if (createdOwner) await db.adminUser.delete({ where: { id: "owner" } });
      await db.$disconnect();
    }
  },
);
