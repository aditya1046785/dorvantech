import { test } from "node:test";
import assert from "node:assert/strict";
// Only run against an isolated server with the test-only P2024 preload installed.
test(
  "login handles a pool timeout without a 500, leaked stack, or session cookie",
  {
    skip:
      process.env.TEST_LOGIN_POOL_TIMEOUT !== "true" ||
      !process.env.TEST_APP_URL,
  },
  async () => {
    const base = process.env.TEST_APP_URL!;
    assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
    const response = await fetch(`${base}/aditya`);
    assert.equal(response.status, 200);
    const policy = response.headers.get("content-security-policy") ?? "";
    assert.ok(policy.includes("'unsafe-eval'"));
    const html = await response.text();
    const form = html
      .match(/<form\b[\s\S]*?<\/form>/g)
      ?.find(
        (value) =>
          value.includes('name="email"') && value.includes('name="code"'),
      );
    assert.ok(form, "Expected the server-rendered owner login form");
    function decode(value: string) {
      return value
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
    }
    const body = new FormData();
    for (const input of form.match(/<input\b[^>]*>/g) ?? []) {
      if (!input.includes('type="hidden"')) continue;
      const name = input.match(/\bname="([^"]*)"/)?.[1];
      const value = input.match(/\bvalue="([^"]*)"/)?.[1] ?? "";
      if (name) body.append(decode(name), decode(value));
    }
    assert.ok(
      [...body.keys()].some((key) => key.startsWith("$ACTION_")),
      "Expected the framework's action fields",
    );
    body.set("email", "test-login@example.com");
    body.set("password", "test-password-never-used");
    body.set("code", "123456");
    const submitted = await fetch(`${base}/aditya`, {
      method: "POST",
      headers: { origin: base },
      body,
    });
    assert.equal(submitted.status, 200);
    const result = await submitted.text();
    assert.ok(result.includes("The database is temporarily unavailable"));
    assert.equal(result.includes("PrismaClientKnownRequestError"), false);
    assert.equal(result.includes("Simulated connection pool timeout"), false);
    assert.equal(
      submitted.headers.get("set-cookie")?.includes("owner-session=") ?? false,
      false,
    );
  },
);
