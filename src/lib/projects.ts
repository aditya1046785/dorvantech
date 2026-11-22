import "server-only";
import { db } from "./db";
import { contentSchema } from "./project-schema";
export async function publicProjects() {
  if (!process.env.DATABASE_URL_POOLED) return null;
  const rows = await db.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  return rows
    .filter((p) => p.published !== null)
    .map((p) => ({ ...p, content: contentSchema.parse(p.published) }));
}
