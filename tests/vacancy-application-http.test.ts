import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID, createHash } from "node:crypto";
import { emptyVacancy } from "../src/lib/vacancy-schema";
test(
  "published vacancies offer an owner preview while clearly distinguishing unavailable live submissions",
  {
    skip:
      process.env.TEST_READINESS_HTTP !== "true" ||
      !process.env.TEST_DATABASE_URL ||
      !process.env.TEST_APP_URL,
  },
  async () => {
    const db = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL,
    });
    const base = process.env.TEST_APP_URL!;
    const nonce = randomUUID();
    const token = randomUUID();
    const sessionId = createHash("sha256").update(token).digest("hex");
    let ownerCreated = false;
    let vacancyId = "";
    try {
      if (!(await db.adminUser.findUnique({ where: { id: "owner" } }))) {
        await db.adminUser.create({
          data: {
            id: "owner",
            email: "readiness-owner@example.com",
            passwordHash: "unused-test-hash",
            totpSecret: "unused-test-secret",
            recoveryCodes: [],
          },
        });
        ownerCreated = true;
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
        title: "Readiness integration internship",
        deadline: "2099-01-01",
      };
      const vacancy = await db.vacancy.create({
        data: {
          slug: `readiness-${nonce}`,
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
      const list = await fetch(`${base}/careers`);
      assert.equal(list.status, 200);
      const listHtml = await list.text();
      assert.ok(
        listHtml.includes("View details for Readiness integration internship"),
      );
      const details = await fetch(`${base}/careers/${vacancy.slug}`);
      assert.equal(details.status, 200);
      const publicHtml = await details.text();
      assert.ok(publicHtml.includes("Applications open soon."));
      assert.equal(publicHtml.includes("BLOB_READ_WRITE_TOKEN"), false);
      assert.equal(publicHtml.includes("Preview application</a>"), false);
      const auth = { cookie: `owner-session=${token}` };
      const ownerDetails = await fetch(`${base}/careers/${vacancy.slug}`, {
        headers: auth,
      });
      assert.equal(ownerDetails.status, 200);
      const ownerHtml = await ownerDetails.text();
      assert.ok(ownerHtml.includes("Preview application</a>"));
      assert.ok(ownerHtml.includes(`/careers/${vacancy.slug}/apply?preview=1`));
      assert.ok(ownerHtml.includes("BLOB_READ_WRITE_TOKEN"));
      assert.ok(ownerHtml.includes("Complete recruitment setup"));
      const preview = await fetch(
        `${base}/careers/${vacancy.slug}/apply?preview=1`,
        { headers: auth },
      );
      assert.equal(preview.status, 200);
      assert.ok(
        (await preview.text()).replaceAll("\\", "").includes('"preview":true'),
      );
      const blocked = await fetch(
        `${base}/careers/${vacancy.slug}/apply?preview=1`,
      );
      assert.equal(blocked.status, 200);
      assert.ok((await blocked.text()).includes("Applications open soon."));
      const editor = await fetch(`${base}/aditya/internships/${vacancy.id}`, {
        headers: auth,
      });
      assert.equal(editor.status, 200);
      assert.ok(
        (await editor.text()).includes("Application setup is incomplete"),
      );
      assert.equal(
        (
          await fetch(`${base}/api/applications`, {
            method: "POST",
            headers: { origin: base },
          })
        ).status,
        503,
      );
      assert.equal(await db.application.count({ where: { vacancyId } }), 0);
      await db.vacancy.update({
        where: { id: vacancyId },
        data: { status: "CLOSED" },
      });
      const closed = await fetch(`${base}/careers/${vacancy.slug}`, {
        headers: auth,
      });
      const closedHtml = await closed.text();
      assert.ok(closedHtml.includes("This opportunity is closed."));
      assert.equal(closedHtml.includes("Preview application</a>"), false);
    } finally {
      if (vacancyId) {
        await db.vacancyRevision.deleteMany({ where: { vacancyId } });
        await db.vacancy.delete({ where: { id: vacancyId } });
      }
      await db.session.deleteMany({ where: { id: sessionId } });
      if (ownerCreated) await db.adminUser.delete({ where: { id: "owner" } });
      await db.$disconnect();
    }
  },
);
