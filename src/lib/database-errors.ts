import { Prisma } from "@prisma/client";

export function isDatabaseUnavailable(error: unknown) {
  const codes = ["P1001", "P1002", "P1008", "P1017", "P2024"];
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      codes.includes(error.code)) ||
    (error instanceof Prisma.PrismaClientInitializationError &&
      codes.includes(error.errorCode ?? ""))
  );
}
