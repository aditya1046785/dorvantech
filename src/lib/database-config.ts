// Prisma 6 otherwise sizes the pool from the machine's CPU count, which can be
// much larger than a small hosted database needs. Preserve operator overrides.
export function runtimeDatabaseUrl(value: string | undefined) {
  if (!value) return undefined;
  const url = new URL(value);
  for (const [key, fallback] of Object.entries({
    connection_limit: "3",
    connect_timeout: "10",
    pool_timeout: "20",
  })) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, fallback);
  }
  return url.toString();
}
