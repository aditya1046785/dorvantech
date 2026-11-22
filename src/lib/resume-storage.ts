import { MAX_RESUME_BYTES } from "./application-schema";
import "server-only";
import { del, get, list, put } from "@vercel/blob";

function storageConfig() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw Error("Vercel Blob storage is not configured.");
  return { token };
}
function validateKey(key: string) {
  if (!/^applications\/[a-f0-9-]+\.pdf$/i.test(key))
    throw Error("Invalid résumé object key.");
}
export async function assertResumeStorage() {
  const result = await list({
    ...storageConfig(),
    limit: 1,
    abortSignal: AbortSignal.timeout(10000),
  });
  // An empty store has no URL to inspect. put(access: "private") enforces
  // store privacy on every upload, including the first one.
  if (
    result.blobs.some(
      (blob) =>
        !new URL(blob.url).hostname.endsWith(
          ".private.blob.vercel-storage.com",
        ),
    )
  )
    throw Error("A private Vercel Blob store is required.");
}
export async function scanResume(bytes: Uint8Array) {
  const apiKey = process.env.CLOUDMERSIVE_API_KEY?.trim();
  if (!apiKey) throw Error("Scanner unavailable.");
  if (!bytes.length || bytes.length > MAX_RESUME_BYTES)
    throw Error("Invalid résumé size.");
  const form = new FormData();
  form.set(
    "inputFile",
    new Blob([Buffer.from(bytes)], { type: "application/pdf" }),
    "resume.pdf",
  );
  const response = await fetch("https://api.cloudmersive.com/virus/scan/file", {
    method: "POST",
    headers: { Apikey: apiKey },
    body: form,
    signal: AbortSignal.timeout(30000),
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok) throw Error("Scanner unavailable.");
  const result = await response.json();
  if (!result || typeof result.CleanResult !== "boolean")
    throw Error("Scanner unavailable.");
  if (
    result.CleanResult !== true ||
    (Array.isArray(result.FoundViruses) && result.FoundViruses.length > 0)
  )
    throw Error(
      "The résumé did not pass the document security check. Please upload a different PDF.",
    );
}

export async function uploadResume(key: string, bytes: Uint8Array) {
  validateKey(key);
  if (!bytes.length || bytes.length > MAX_RESUME_BYTES)
    throw Error("Invalid résumé size.");
  await put(key, Buffer.from(bytes), {
    ...storageConfig(),
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: false,
    abortSignal: AbortSignal.timeout(20000),
  });
}
export async function deleteResume(key: string) {
  validateKey(key);
  await del(key, {
    ...storageConfig(),
    abortSignal: AbortSignal.timeout(15000),
  });
}

export async function readResume(key: string) {
  validateKey(key);
  const result = await get(key, {
    ...storageConfig(),
    access: "private",
    useCache: false,
    abortSignal: AbortSignal.timeout(20000),
  });
  if (!result || result.statusCode !== 200)
    throw Error("Résumé storage is unavailable.");
  const limit = MAX_RESUME_BYTES;
  if (Number(result.headers.get("content-length")) > limit) {
    await result.stream.cancel();
    throw Error("Résumé is too large.");
  }
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > limit) {
        await reader.cancel();
        throw Error("Résumé is too large.");
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
