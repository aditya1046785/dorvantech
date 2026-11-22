import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import type { PrismaClient } from "@prisma/client";
test(
  "development reload reuses the pool and retires stale connection settings",
  { skip: process.env.TEST_DATABASE_CLIENT_RELOAD !== "true" },
  async () => {
    const requireProject = createRequire(`${process.cwd()}/package.json`);
    const path = requireProject.resolve("./src/lib/db.ts");
    const state = globalThis as unknown as {
      prisma?: PrismaClient;
      prismaConnectionKey?: string;
    };
    const oldUrl = process.env.DATABASE_URL_POOLED;
    const oldMode = process.env.NODE_ENV;
    let retired = 0;
    let first: PrismaClient | undefined;
    let changed: PrismaClient | undefined;
    function load() {
      delete requireProject.cache[path];
      return (requireProject(path) as { db: PrismaClient }).db;
    }
    try {
      Object.assign(process.env, {
        NODE_ENV: "development",
        DATABASE_URL_POOLED: "postgresql://test:test@127.0.0.1:55599/first",
      });
      state.prisma = {
        $disconnect: async () => {
          retired++;
        },
      } as unknown as PrismaClient;
      state.prismaConnectionKey = "old settings";
      first = load();
      assert.equal(retired, 1);
      assert.equal(load(), first);
      assert.equal(retired, 1);
      first.$disconnect = async () => {
        retired++;
      };
      process.env.DATABASE_URL_POOLED =
        "postgresql://test:test@127.0.0.1:55599/changed";
      changed = load();
      assert.notEqual(changed, first);
      assert.equal(retired, 2);
      assert.equal(load(), changed);
      assert.ok(state.prismaConnectionKey?.includes("connection_limit=3"));
    } finally {
      await changed?.$disconnect();
      delete state.prisma;
      delete state.prismaConnectionKey;
      delete requireProject.cache[path];
      if (oldUrl === undefined) delete process.env.DATABASE_URL_POOLED;
      else process.env.DATABASE_URL_POOLED = oldUrl;
      if (oldMode === undefined)
        Reflect.deleteProperty(process.env, "NODE_ENV");
      else Object.assign(process.env, { NODE_ENV: oldMode });
    }
  },
);
