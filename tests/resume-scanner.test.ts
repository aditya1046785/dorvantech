import { test } from "node:test";
import assert from "node:assert/strict";

test(
  "Cloudmersive receives authenticated PDF multipart and fails closed",
  {
    skip: !process.execArgv.includes("--conditions=react-server"),
  },
  async () => {
    const { scanResume } = await import("../src/lib/resume-storage");
    const originalFetch = globalThis.fetch;
    const originalKey = process.env.CLOUDMERSIVE_API_KEY;
    const bytes = Buffer.from("%PDF-1.4\n%%EOF");
    try {
      process.env.CLOUDMERSIVE_API_KEY = "test-api-key";
      globalThis.fetch = async (url, options) => {
        assert.equal(url, "https://api.cloudmersive.com/virus/scan/file");
        assert.equal(options?.method, "POST");
        const headers = new Headers(options?.headers);
        assert.equal(headers.get("Apikey"), "test-api-key");
        assert.equal(headers.has("content-type"), false);
        assert.equal(options?.redirect, "error");
        const file = (options?.body as FormData).get("inputFile") as File;
        assert.equal(file.name, "resume.pdf");
        assert.equal(file.type, "application/pdf");
        assert.deepEqual(Buffer.from(await file.arrayBuffer()), bytes);
        return Response.json({ CleanResult: true, FoundViruses: [] });
      };
      await scanResume(bytes);
      for (const result of [
        { CleanResult: false },
        { clean: true },
        {},
        null,
        { CleanResult: "true" },
        { CleanResult: true, FoundViruses: [{}] },
      ]) {
        globalThis.fetch = async () => Response.json(result);
        await assert.rejects(() => scanResume(bytes));
      }
      for (const status of [401, 429, 500]) {
        globalThis.fetch = async () =>
          new Response("provider error", { status });
        await assert.rejects(() => scanResume(bytes), /Scanner unavailable/);
      }
      globalThis.fetch = async () => {
        throw Error("timeout");
      };
      await assert.rejects(() => scanResume(bytes));
      globalThis.fetch = async () => new Response("invalid JSON");
      await assert.rejects(() => scanResume(bytes));
      delete process.env.CLOUDMERSIVE_API_KEY;
      await assert.rejects(() => scanResume(bytes), /Scanner unavailable/);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalKey === undefined) delete process.env.CLOUDMERSIVE_API_KEY;
      else process.env.CLOUDMERSIVE_API_KEY = originalKey;
    }
  },
);
