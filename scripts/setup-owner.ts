import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { TOTP } from "otpauth";
import { createCipheriv, randomBytes, createHash } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
async function main() {
  const db = new PrismaClient();
  let hidden = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!hidden) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const input = createInterface({
    input: process.stdin,
    output,
    terminal: Boolean(process.stdin.isTTY),
  });
  async function askPassword(prompt: string) {
    if (!process.stdin.isTTY)
      throw Error(
        "Run owner setup in an interactive terminal to enter a password.",
      );
    process.stdout.write(prompt);
    hidden = true;
    try {
      return await input.question("");
    } finally {
      hidden = false;
      process.stdout.write("\n");
    }
  }
  try {
    const email = (await input.question("Owner email: ")).trim().toLowerCase();
    const password =
      process.env.OWNER_PASSWORD ||
      (await askPassword(
        "Choose a password (16–256 characters; typing is hidden): ",
      ));
    const key = process.env.AUTH_ENCRYPTION_KEY;
    if (!password || password.length < 16 || password.length > 256)
      throw Error(
        "Password must contain 16–256 characters. Run owner setup again and choose a longer password.",
      );
    if (
      !process.env.OWNER_PASSWORD &&
      password !== (await askPassword("Confirm password (typing is hidden): "))
    )
      throw Error("Passwords do not match. Run owner setup again.");
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
