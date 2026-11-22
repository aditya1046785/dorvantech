export const recruitmentRequirements = [
  "DATABASE_URL_POOLED",
  "BLOB_READ_WRITE_TOKEN",
  "CLOUDMERSIVE_API_KEY",
  "RESEND_API_KEY",
  "RESEND_WEBHOOK_SECRET",
  "APPLICATION_FROM_EMAIL",
  "APPLICATION_REPLY_TO",
  "RECRUITMENT_JOBS_SECRET",
] as const;
export function inspectRecruitmentReadiness(
  environment: Record<string, string | undefined>,
) {
  const missing = recruitmentRequirements.filter(
    (key) => !environment[key]?.trim(),
  );
  const flagEnabled = environment.APPLICATIONS_ENABLED?.trim() === "true";
  return { enabled: flagEnabled && missing.length === 0, flagEnabled, missing };
}
export function vacancyApplicationMode(
  open: boolean,
  live: boolean,
  owner: boolean,
) {
  if (!open) return "closed" as const;
  if (live) return "live" as const;
  return owner ? ("preview" as const) : ("unavailable" as const);
}
