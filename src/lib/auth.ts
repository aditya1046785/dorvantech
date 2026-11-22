import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { db } from "./db";
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
function key() {
  const s = process.env.AUTH_ENCRYPTION_KEY;
  if (!s || !/^[a-f0-9]{64}$/i.test(s))
    throw Error("Configure AUTH_ENCRYPTION_KEY");
  return Buffer.from(s, "hex");
}
export function encrypt(s: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  return Buffer.concat([iv, c.update(s), c.final(), c.getAuthTag()]).toString(
    "base64",
  );
}
export function decrypt(s: string) {
  const b = Buffer.from(s, "base64");
  const d = createDecipheriv("aes-256-gcm", key(), b.subarray(0, 12));
  d.setAuthTag(b.subarray(-16));
  return Buffer.concat([d.update(b.subarray(12, -16)), d.final()]).toString();
}
export async function session() {
  const token = (await cookies()).get("owner-session")?.value;
  if (!token || !process.env.DATABASE_URL_POOLED) return null;
  const s = await db.session.findUnique({ where: { id: digest(token) } });
  if (
    !s ||
    s.userId !== "owner" ||
    s.expiresAt < new Date() ||
    Date.now() - s.lastSeen.getTime() > 30 * 60 * 1000
  )
    return null;
  if (Date.now() - s.lastSeen.getTime() > 60000)
    await db.session.update({
      where: { id: s.id },
      data: { lastSeen: new Date() },
    });
  return s;
}
export async function requireOwner() {
  const s = await session();
  if (!s) redirect("/aditya");
  return s;
}
