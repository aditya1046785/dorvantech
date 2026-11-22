import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { isDatabaseUnavailable } from "./database-errors";
import { publishedVacancies } from "./vacancy-public";

// A missing database or unapplied additive migration must not break the homepage.
export const publicVacancies = cache(async () => {
  if (!process.env.DATABASE_URL_POOLED) return null;
  try {
    const rows = await db.vacancy.findMany({
      where: { status: { in: ["PUBLISHED", "CLOSED"] } },
      select: {
        slug: true,
        status: true,
        published: true,
        publishedRevision: true,
      },
    });
    return publishedVacancies(rows);
  } catch (error) {
    if (
      isDatabaseUnavailable(error) ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021")
    )
      return null;
    throw error;
  }
});
