import { mockBlobStorage } from "./blob-mock";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { emptyVacancy } from "../src/lib/vacancy-schema";
test(
  "review changes are atomic, reject stale edits, preserve notes and retry email safely",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const { db } = await import("../src/lib/db");
    const {
      appendApplicantNote,
      updateApplicantStatus,
      queueConfirmationRetry,
    } = await import("../src/lib/applicant-review");
    const { readResume } = await import("../src/lib/resume-storage");
    const nonce = randomUUID();
    const vacancy = await db.vacancy.create({
      data: { slug: `review-${nonce}`, draft: emptyVacancy },
    });
    const revision = await db.vacancyRevision.create({
      data: { vacancyId: vacancy.id, revision: 1, content: emptyVacancy },
    });
    const bytes = new TextEncoder().encode(
      "%PDF-1.7\nexample test document\n%%EOF\n",
    );
    const resume = await db.resumeObject.create({
      data: {
        objectKey: `applications/${nonce}.pdf`,
        filename: "resume.pdf",
        size: bytes.length,
        scannedAt: new Date(),
      },
    });
    const applicant = await db.application.create({
      data: {
        registration: `TEST-${nonce}`,
        requestKey: nonce,
        vacancyId: vacancy.id,
        revisionId: revision.id,
        email: "review@example.com",
        name: "Review applicant",
        answers: {},
        consentVersion: "test",
        resumeId: resume.id,
        confirmation: { create: { payload: {} } },
      },
    });
    const originalFetch = globalThis.fetch;
    const blobMock = mockBlobStorage();
    try {
      assert.equal(
        await updateApplicantStatus(applicant.id, 1, "REVIEWING"),
        2,
      );
      await assert.rejects(() =>
        updateApplicantStatus(applicant.id, 1, "SELECTED"),
      );
      assert.equal(
        (
          await db.application.findUniqueOrThrow({
            where: { id: applicant.id },
          })
        ).status,
        "REVIEWING",
      );
      await Promise.all([
        appendApplicantNote(applicant.id, "First note"),
        appendApplicantNote(applicant.id, "Second note"),
      ]);
      assert.equal(
        await db.applicationActivity.count({
          where: { applicationId: applicant.id, kind: "NOTE" },
        }),
        2,
      );
      assert.equal(
        await db.applicationActivity.count({
          where: { applicationId: applicant.id, kind: "STATUS" },
        }),
        1,
      );
      const outcomes = await Promise.allSettled([
        updateApplicantStatus(applicant.id, 2, "SHORTLISTED"),
        updateApplicantStatus(applicant.id, 2, "REJECTED"),
      ]);
      assert.equal(outcomes.filter((r) => r.status === "fulfilled").length, 1);
      assert.equal(
        await db.applicationActivity.count({
          where: { applicationId: applicant.id, kind: "STATUS" },
        }),
        2,
      );
      const emailId = await queueConfirmationRetry(applicant.id);
      await db.confirmationEmail.update({
        where: { id: emailId },
        data: { lockedUntil: new Date(Date.now() + 60000) },
      });
      await assert.rejects(() => queueConfirmationRetry(applicant.id));
      await db.confirmationEmail.update({
        where: { id: emailId },
        data: { lockedUntil: null, status: "SENT" },
      });
      await assert.rejects(() => queueConfirmationRetry(applicant.id));
      await db.confirmationEmail.update({
        where: { id: emailId },
        data: {
          status: "NEEDS_REVIEW",
          createdAt: new Date(Date.now() - 21 * 3600000),
        },
      });
      await assert.rejects(() => queueConfirmationRetry(applicant.id));
      blobMock.files
        .intercept({
          path: `/${resume.objectKey}?cache=0`,
          headers: {
            authorization: "Bearer vercel_blob_rw_teststore_testsecret",
          },
        })
        .reply(200, bytes);
      assert.deepEqual(
        new Uint8Array(await readResume(resume.objectKey)),
        bytes,
      );
      await assert.rejects(() => readResume("../private-object"));
      blobMock.files
        .intercept({ path: `/${resume.objectKey}?cache=0` })
        .reply(200, "", {
          headers: { "content-length": String(6 * 1024 * 1024) },
        });
      await assert.rejects(() => readResume(resume.objectKey));
    } finally {
      await blobMock.close();
      globalThis.fetch = originalFetch;
      await db.application.delete({ where: { id: applicant.id } });
      assert.equal(
        await db.applicationActivity.count({
          where: { applicationId: applicant.id },
        }),
        0,
      );
      await db.resumeObject.delete({ where: { id: resume.id } });
      await db.vacancyRevision.delete({ where: { id: revision.id } });
      await db.vacancy.delete({ where: { id: vacancy.id } });
      await db.$disconnect();
    }
  },
);
