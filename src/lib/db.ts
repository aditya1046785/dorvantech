import "server-only";
import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "./database-config";

const datasourceUrl = runtimeDatabaseUrl(process.env.DATABASE_URL_POOLED);
const globalDb = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionKey?: string;
};
const cached =
  globalDb.prismaConnectionKey === datasourceUrl ? globalDb.prisma : undefined;

// Hot reload preserves globalThis. Retire a client using old connection settings
// rather than silently retaining the old pool after an environment/code change.
if (globalDb.prisma && !cached) {
  void globalDb.prisma.$disconnect().catch(() => {});
}
export const db =
  cached ?? new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);
if (process.env.NODE_ENV !== "production") {
  globalDb.prisma = db;
  globalDb.prismaConnectionKey = datasourceUrl;
}
