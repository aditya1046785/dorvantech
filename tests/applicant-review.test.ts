import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applicantFilters,
  noteSchema,
  reviewSchema,
  profileLink,
  emailLabel,
  adminDate,
} from "../src/lib/applicant-schema";
test("filters search applicant fields and include the whole selected day in IST", () => {
  const result = applicantFilters({
    q: " ananya ",
    vacancy: "vacancy-id",
    status: "SHORTLISTED",
    from: "2026-12-01",
    to: "2026-12-01",
    page: "2",
  });
  assert.equal(result.q, "ananya");
  assert.equal(result.page, 2);
  assert.equal(result.where.vacancyId, "vacancy-id");
  assert.equal(result.where.status, "SHORTLISTED");
  const dates = result.where.createdAt as { gte: Date; lte: Date };
  assert.equal(dates.gte.toISOString(), "2026-11-30T18:30:00.000Z");
  assert.equal(dates.lte.toISOString(), "2026-12-01T18:29:59.999Z");
  assert.equal(result.where.OR?.length, 3);
});
test("filters reject impossible dates and reversed ranges and bound pagination/search", () => {
  const result = applicantFilters({
    status: "INVALID",
    from: "2026-02-30",
    to: "invalid",
    page: "-1",
    q: "x".repeat(1000),
  });
  assert.equal(result.status, "");
  assert.equal(result.from, "");
  assert.equal(result.to, "");
  assert.equal(result.page, 1);
  assert.equal(result.q.length, 200);
  assert.ok(applicantFilters({ from: "2026-12-02", to: "2026-12-01" }).error);
  assert.equal(applicantFilters({ page: "99999999999999999999" }).page, 1);
});
test("notes and status changes require bounded valid inputs", () => {
  assert.equal(noteSchema.safeParse({ id: "id", body: "  " }).success, false);
  assert.equal(
    noteSchema.safeParse({ id: "id", body: "x".repeat(4001) }).success,
    false,
  );
  assert.equal(
    noteSchema.parse({ id: "id", body: " Useful note " }).body,
    "Useful note",
  );
  assert.equal(
    reviewSchema.safeParse({ id: "id", version: 0, status: "NEW" }).success,
    false,
  );
  assert.equal(
    reviewSchema.safeParse({ id: "id", version: 1, status: "UNKNOWN" }).success,
    false,
  );
  assert.equal(
    reviewSchema.safeParse({ id: "id", version: 2, status: "INTERVIEW" })
      .success,
    true,
  );
});
test("profile links reject executable URLs, credentials, and incorrect profile hosts", () => {
  assert.equal(profileLink("javascript:alert(1)", "portfolio"), null);
  assert.equal(
    profileLink("https://user:password@example.com", "portfolio"),
    null,
  );
  assert.equal(
    profileLink("https://github.com.evil.example/name", "github"),
    null,
  );
  assert.equal(
    profileLink("https://github.com/name", "github"),
    "https://github.com/name",
  );
  assert.equal(
    profileLink("https://www.linkedin.com/in/name", "linkedin"),
    "https://www.linkedin.com/in/name",
  );
});
test("email acceptance is distinct from delivery and dates display in IST", () => {
  assert.equal(emailLabel("SENT"), "Accepted by email provider");
  assert.equal(emailLabel(undefined), "No email record");
  assert.ok(adminDate(new Date("2026-12-01T18:30:00Z")).includes("2 Dec 2026"));
});

test("repeated query parameters are normalized safely", () => {
  const filters = applicantFilters({
    q: ["Ananya", "ignored"],
    page: ["2", "3"],
    status: ["NEW", "INVALID"],
  });
  assert.equal(filters.q, "Ananya");
  assert.equal(filters.page, 2);
  assert.equal(filters.status, "NEW");
});
