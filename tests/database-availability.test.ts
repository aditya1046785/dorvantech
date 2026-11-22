import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import nextConfig from "../next.config";
import { runtimeDatabaseUrl } from "../src/lib/database-config";
import { isDatabaseUnavailable } from "../src/lib/database-errors";

test("runtime pool defaults are bounded and preserve provider connection settings", () => {
  const url = new URL(
    runtimeDatabaseUrl(
      "postgresql://user:password@pooled.db.prisma.io:5432/postgres?sslmode=require",
    )!,
  );
  assert.equal(url.hostname, "pooled.db.prisma.io");
  assert.equal(url.searchParams.get("sslmode"), "require");
  assert.equal(url.searchParams.get("connection_limit"), "3");
  assert.equal(url.searchParams.get("connect_timeout"), "10");
  assert.equal(url.searchParams.get("pool_timeout"), "20");
  const override = new URL(
    runtimeDatabaseUrl(
      "postgresql://u:p@localhost/db?connection_limit=1&pool_timeout=7&connect_timeout=5&pgbouncer=true",
    )!,
  );
  assert.equal(override.searchParams.get("connection_limit"), "1");
  assert.equal(override.searchParams.get("pool_timeout"), "7");
  assert.equal(override.searchParams.get("connect_timeout"), "5");
  assert.equal(override.searchParams.get("pgbouncer"), "true");
  assert.equal(runtimeDatabaseUrl(undefined), undefined);
});
test("pool timeout and connectivity errors are recognized without swallowing unrelated errors", () => {
  assert.equal(
    isDatabaseUnavailable(
      new Prisma.PrismaClientKnownRequestError("Pool timeout", {
        code: "P2024",
        clientVersion: "6.19.3",
        meta: { connection_limit: 17, timeout: 10 },
      }),
    ),
    true,
  );
  assert.equal(
    isDatabaseUnavailable(
      new Prisma.PrismaClientInitializationError(
        "Unavailable",
        "6.19.3",
        "P1001",
      ),
    ),
    true,
  );
  assert.equal(
    isDatabaseUnavailable(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "6.19.3",
      }),
    ),
    false,
  );
  assert.equal(isDatabaseUnavailable(new Error("NEXT_REDIRECT")), false);
  assert.equal(isDatabaseUnavailable({ code: "P2024" }), false);
});
test("admin policy enables React debugging eval only in development", async () => {
  const original = process.env.NODE_ENV;
  try {
    for (const mode of ["development", "production"]) {
      Object.assign(process.env, { NODE_ENV: mode });
      const rules = await nextConfig.headers!();
      const policy = rules
        .find((rule) => rule.source === "/aditya/:path*")!
        .headers.find(
          (header) => header.key === "Content-Security-Policy",
        )!.value;
      assert.equal(policy.includes("'unsafe-eval'"), mode === "development");
      assert.ok(policy.includes("object-src 'none'"));
      assert.ok(policy.includes("frame-ancestors 'none'"));
      const pdf = rules
        .find((rule) => rule.source.endsWith("/:id/resume"))!
        .headers.find(
          (header) => header.key === "Content-Security-Policy",
        )!.value;
      assert.equal(pdf.includes("unsafe-eval"), false);
    }
  } finally {
    if (original === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: original });
  }
});
