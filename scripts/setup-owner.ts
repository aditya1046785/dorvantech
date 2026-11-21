import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { TOTP } from "otpauth";
import { createCipheriv, randomBytes, createHash } from "node:crypto";
import { createInterface } from "node:readline/promises";
async function main() {
  const db = new PrismaClient();
  const input = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const email = (await input.question("Owner email: ")).trim().toLowerCase();
    // Read from environment to avoid echoing a password into terminal output.
    const password = process.env.OWNER_PASSWORD;
    const key = process.env.AUTH_ENCRYPTION_KEY;
    if (!password || password.length < 16 || password.length > 256)
      throw Error("Set OWNER_PASSWORD to 16–256 characters for this command.");
    if (!key || !/^[a-f0-9]{64}$/i.test(key))
      throw Error("Set AUTH_ENCRYPTION_KEY to a 32-byte hex key.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw Error("Enter a valid email.");
    const existing = await db.adminUser.findUnique({ where: { id: "owner" } });
    if (
      existing &&
      (await input.question(
        "This resets the owner password, authenticator, and sessions. Type RESET: ",
      )) !== "RESET"
    )
      throw Error("Cancelled");
    const otp = new TOTP({ issuer: "DORVANTECH", label: email });
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
    const encrypted = Buffer.concat([
      iv,
      cipher.update(otp.secret.base32),
      cipher.final(),
      cipher.getAuthTag(),
    ]).toString("base64");
    const codes = Array.from({ length: 8 }, () =>
      randomBytes(10).toString("hex"),
    );
    const data = {
      email,
      passwordHash: await hash(password),
      totpSecret: encrypted,
      lastTotpStep: BigInt(0),
      recoveryCodes: codes.map((c) =>
        createHash("sha256").update(c).digest("hex"),
      ),
    };
    await db.$transaction([
      db.session.deleteMany(),
      db.adminUser.upsert({
        where: { id: "owner" },
        create: data,
        update: data,
      }),
    ]);
    console.log(
      "Add this URI to your authenticator. Keep it private:\n" + otp.toString(),
    );
    console.log(
      "Save these single-use recovery codes privately:\n" + codes.join("\n"),
    );
  } finally {
    input.close();
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
