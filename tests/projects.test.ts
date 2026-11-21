import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  contentSchema,
  emptyContent,
  slugSchema,
} from "../src/lib/project-schema";
const content = {
  ...emptyContent,
  title: "Test project",
  category: "Software",
  summary: "A useful project.",
  overview: "The project story.",
};
test("rejects executable URLs, invalid slugs, oversized summaries and excess tags", () => {
  assert.equal(
    contentSchema.safeParse({ ...content, url: "javascript:alert(1)" }).success,
    false,
  );
  assert.equal(
    contentSchema.safeParse({ ...content, url: "http://example.com" }).success,
    false,
  );
  assert.equal(slugSchema.safeParse("../aditya").success, false);
  assert.equal(
    contentSchema.safeParse({ ...content, summary: "a".repeat(241) }).success,
    false,
  );
  assert.equal(
    contentSchema.safeParse({ ...content, tags: Array(7).fill("tag") }).success,
    false,
  );
  assert.equal(contentSchema.safeParse(content).success, true);
});
test(
  "database preserves published snapshots, rejects stale updates and enforces slug uniqueness",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const db = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL,
    });
    const slug = `integration-${Date.now()}`;
    let id = "";
    try {
      const p = await db.project.create({
        data: { slug, draft: content, published: content, status: "PUBLISHED" },
      });
      id = p.id;
      await db.project.update({
        where: { id },
        data: {
          draft: { ...content, title: "Unpublished edit" },
          version: { increment: 1 },
        },
      });
      const updated = await db.project.findUniqueOrThrow({ where: { id } });
      assert.equal(
        (updated.published as { title: string }).title,
        "Test project",
      );
      assert.equal(
        (updated.draft as { title: string }).title,
        "Unpublished edit",
      );
      const conflict = await db.project.updateMany({
        where: { id, version: 1 },
        data: { version: { increment: 1 } },
      });
      assert.equal(conflict.count, 0);
      await assert.rejects(() =>
        db.project.create({ data: { slug, draft: content } }),
      );
    } finally {
      if (id) await db.project.delete({ where: { id } });
      await db.$disconnect();
    }
  },
);
