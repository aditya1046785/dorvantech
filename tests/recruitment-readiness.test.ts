import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inspectRecruitmentReadiness,
  recruitmentRequirements,
  vacancyApplicationMode,
} from "../src/lib/recruitment-readiness";
test("publishing alone cannot enable submissions without storage and email configuration", () => {
  const env: Record<string, string | undefined> = {
    DATABASE_URL_POOLED: "configured",
    RESEND_API_KEY: "configured",
  };
  const readiness = inspectRecruitmentReadiness(env);
  assert.equal(readiness.enabled, false);
  assert.equal(readiness.flagEnabled, false);
  assert.ok(readiness.missing.includes("BLOB_READ_WRITE_TOKEN"));
  assert.ok(readiness.missing.includes("CLOUDMERSIVE_API_KEY"));
  env.APPLICATIONS_ENABLED = "true";
  assert.equal(inspectRecruitmentReadiness(env).enabled, false);
  for (const key of recruitmentRequirements) env[key] = "configured";
  assert.equal(inspectRecruitmentReadiness(env).enabled, true);
  env.BLOB_READ_WRITE_TOKEN = "   ";
  assert.equal(inspectRecruitmentReadiness(env).enabled, false);
});
test("owner gets a test path without exposing an unusable live application to students", () => {
  assert.equal(vacancyApplicationMode(true, false, true), "preview");
  assert.equal(vacancyApplicationMode(true, false, false), "unavailable");
  assert.equal(vacancyApplicationMode(true, true, true), "live");
  assert.equal(vacancyApplicationMode(true, true, false), "live");
  for (const live of [true, false])
    for (const owner of [true, false])
      assert.equal(vacancyApplicationMode(false, live, owner), "closed");
});
