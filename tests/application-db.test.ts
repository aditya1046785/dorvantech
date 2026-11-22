import { mockBlobStorage } from "./blob-mock";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { emptyVacancy } from "../src/lib/vacancy-schema";

test(
  "application persistence, outbox retries, private storage and orphan cleanup",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    // Run with --conditions=react-server and DATABASE_URL_POOLED set to TEST_DATABASE_URL.
    const { db } = await import("../src/lib/db");
    const { processConfirmation, runRecruitmentJobs } =
      await import("../src/lib/recruitment-jobs");
    const { assertResumeStorage, scanResume } =
      await import("../src/lib/resume-storage");
    const oldFetch = globalThis.fetch;
    const nonce = randomUUID();
    const vacancy = await db.vacancy.create({
      data: {
        slug: `test-${nonce}`,
        draft: emptyVacancy,
        status: "PUBLISHED",
        published: emptyVacancy,
        publishedRevision: 1,
      },
    });
    const revision = await db.vacancyRevision.create({
      data: { vacancyId: vacancy.id, revision: 1, content: emptyVacancy },
    });
    const resume = await db.resumeObject.create({
      data: {
        objectKey: `applications/${nonce}.pdf`,
        filename: "resume.pdf",
        size: 100,
        scannedAt: new Date(),
      },
    });
    const payload = {
      from: "test@example.com",
      to: "applicant@example.com",
      reply_to: "recruitment@example.com",
      subject: "Application received",
      text: "Your registration is TEST",
    };
    const createData = {
      registration: `TEST-${nonce}`,
      requestKey: nonce,
      vacancyId: vacancy.id,
      revisionId: revision.id,
      email: "applicant@example.com",
      name: "Test Applicant",
      answers: {},
      consentVersion: "test",
      resumeId: resume.id,
      confirmation: { create: { payload } },
    };
    const blobMock = mockBlobStorage();
    try {
      const application = await db.application.create({
        data: createData,
        include: { confirmation: true },
      });
      assert.ok(application.confirmation);
      await assert.rejects(() =>
        db.application.create({
          data: {
            ...createData,
            requestKey: randomUUID(),
            registration: randomUUID(),
          },
        }),
      );
      assert.equal(
        await db.application.count({ where: { vacancyId: vacancy.id } }),
        1,
      );
      const jobId = application.confirmation!.id;
      let requests = 0;
      globalThis.fetch = async () => {
        requests++;
        return new Response("unavailable", { status: 503 });
      };
      await processConfirmation(jobId);
      assert.equal(
        (await db.confirmationEmail.findUniqueOrThrow({ where: { id: jobId } }))
          .status,
        "PENDING",
      );
      assert.ok(
        await db.application.findUnique({ where: { id: application.id } }),
      );
      await db.confirmationEmail.update({
        where: { id: jobId },
        data: { nextAttempt: new Date(0) },
      });
      globalThis.fetch = async (_url, options) => {
        requests++;
        assert.ok(new Headers(options?.headers).get("Idempotency-Key"));
        return Response.json({ id: "mock-provider-id" });
      };
      await Promise.all([
        processConfirmation(jobId),
        processConfirmation(jobId),
      ]);
      assert.equal(requests, 2, "concurrent workers must not double-send");
      const sent = await db.confirmationEmail.findUniqueOrThrow({
        where: { id: jobId },
      });
      assert.equal(sent.status, "SENT");
      assert.equal(sent.providerId, "mock-provider-id");
      await processConfirmation(jobId);
      assert.equal(requests, 2);
      blobMock.api.intercept({ path: "/api/blob?limit=1" }).reply(200, {
        blobs: [
          { url: "https://teststore.public.blob.vercel-storage.com/test.pdf" },
        ],
        hasMore: false,
      });
      await assert.rejects(() => assertResumeStorage());
      blobMock.api
        .intercept({ path: "/api/blob?limit=1" })
        .reply(200, { blobs: [], hasMore: false });
      await assertResumeStorage();
      process.env.CLOUDMERSIVE_API_KEY = "test-key";
      globalThis.fetch = async () => Response.json({ CleanResult: false });
      await assert.rejects(() => scanResume(new Uint8Array([1, 2])));
      globalThis.fetch = async () => Response.json({ CleanResult: true });
      await scanResume(new Uint8Array([1, 2]));
      const orphan = await db.resumeObject.create({
        data: {
          objectKey: `applications/ffff-${nonce}.pdf`,
          filename: "orphan.pdf",
          size: 1,
          scannedAt: new Date(),
          createdAt: new Date(Date.now() - 2 * 86400000),
        },
      });
      blobMock.api
        .intercept({ path: "/api/blob/delete", method: "POST" })
        .reply(200, {});
      await runRecruitmentJobs();
      assert.equal(
        await db.resumeObject.findUnique({ where: { id: orphan.id } }),
        null,
      );
      assert.ok(
        await db.resumeObject.findUnique({ where: { id: resume.id } }),
        "cleanup must preserve attached résumés",
      );
    } finally {
      await blobMock.close();
      globalThis.fetch = oldFetch;
      await db.application.deleteMany({ where: { vacancyId: vacancy.id } });
      await db.resumeObject.deleteMany({
        where: { objectKey: { contains: nonce } },
      });
      await db.vacancyRevision.deleteMany({ where: { vacancyId: vacancy.id } });
      await db.vacancy.delete({ where: { id: vacancy.id } });
      await db.$disconnect();
    }
  },
);
