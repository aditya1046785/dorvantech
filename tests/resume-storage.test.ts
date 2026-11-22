import { test } from "node:test";
import assert from "node:assert/strict";
import { mockBlobStorage } from "./blob-mock";

// Server-only modules require the same condition Next.js uses on the server.
test(
  "private Blob storage validates keys, credentials, privacy and bounded reads",
  {
    skip: !process.execArgv.includes("--conditions=react-server"),
  },
  async () => {
    const { assertResumeStorage, uploadResume, readResume, deleteResume } =
      await import("../src/lib/resume-storage");
    const mock = mockBlobStorage();
    const key = "applications/12345678-abcd.pdf";
    try {
      mock.api.intercept({ path: "/api/blob?limit=1" }).reply(200, {
        blobs: [
          { url: "https://teststore.public.blob.vercel-storage.com/test.pdf" },
        ],
        hasMore: false,
      });
      await assert.rejects(assertResumeStorage, /private Vercel Blob/);
      mock.api
        .intercept({ path: "/api/blob?limit=1" })
        .reply(200, { blobs: [], hasMore: false });
      await assertResumeStorage();
      for (const bad of [
        "../file.pdf",
        "https://other.example/file.pdf",
        "applications/file.txt",
      ]) {
        await assert.rejects(
          () => uploadResume(bad, new Uint8Array([1])),
          /object key/,
        );
        await assert.rejects(() => readResume(bad), /object key/);
        await assert.rejects(() => deleteResume(bad), /object key/);
      }
      await assert.rejects(() => uploadResume(key, new Uint8Array()), /size/);
      const bytes = Buffer.from("%PDF-1.4\n%%EOF");
      mock.files
        .intercept({
          path: `/${key}?cache=0`,
          headers: {
            authorization: "Bearer vercel_blob_rw_teststore_testsecret",
          },
        })
        .reply(200, bytes);
      assert.deepEqual(await readResume(key), bytes);
      mock.files.intercept({ path: `/${key}?cache=0` }).reply(404, "missing");
      await assert.rejects(() => readResume(key), /unavailable/);
      mock.files
        .intercept({ path: `/${key}?cache=0` })
        .reply(200, "small", {
          headers: { "content-length": String(6 * 1024 * 1024) },
        });
      await assert.rejects(() => readResume(key), /too large/);
      mock.files
        .intercept({ path: `/${key}?cache=0` })
        .reply(200, Buffer.alloc(6 * 1024 * 1024));
      await assert.rejects(() => readResume(key), /too large/);
      mock.api
        .intercept({
          path: "/api/blob/delete",
          method: "POST",
          body: JSON.stringify({ urls: [key] }),
        })
        .reply(200, {});
      await deleteResume(key);
      delete process.env.BLOB_READ_WRITE_TOKEN;
      await assert.rejects(assertResumeStorage, /not configured/);
      mock.agent.assertNoPendingInterceptors();
    } finally {
      await mock.close();
    }
  },
);
