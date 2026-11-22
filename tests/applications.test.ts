import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applicationQuestions,
  emptyAnswers,
  MAX_RESUME_BYTES,
  restoreApplicationDraft,
  resumeMetadataError,
  validateAnswer,
  validateApplicationAnswers,
} from "../src/lib/application-schema";

test("students get education questions; other applicants skip institution and year", () => {
  const students = applicationQuestions({ educationStatus: "student" }).map(
    (q) => q.key,
  );
  const others = applicationQuestions({ educationStatus: "other" }).map(
    (q) => q.key,
  );
  assert.ok(students.includes("institution"));
  assert.ok(students.includes("graduationYear"));
  assert.equal(others.includes("institution"), false);
  assert.equal(others.includes("graduationYear"), false);
  assert.ok(others.includes("qualification"));
  assert.deepEqual(students.slice(-3), ["github", "linkedin", "portfolio"]);
});
test("validates complete answers including conditional education fields", () => {
  const answers = {
    ...emptyAnswers,
    name: "Ananya Sharma",
    email: "ananya@example.com",
    location: "Kochi, India",
    educationStatus: "other",
    qualification: "Self-taught developer",
    skills: "React",
    motivation: "I would like to build useful software and learn.",
    startDate: "Immediately",
    hours: "20",
  };
  assert.deepEqual(validateApplicationAnswers(answers), []);
  const studentErrors = validateApplicationAnswers({
    ...answers,
    educationStatus: "student",
  });
  assert.deepEqual(
    studentErrors.map((e) => e.key),
    ["institution", "graduationYear"],
  );
  assert.ok(validateAnswer("hours", "81"));
  assert.ok(validateAnswer("email", "invalid"));
  assert.ok(validateAnswer("motivation", "short"));
});
test("optional profiles accept empty values and reject unsafe or incorrect hosts", () => {
  for (const key of ["github", "linkedin", "portfolio"] as const) {
    assert.equal(validateAnswer(key, ""), undefined);
    assert.ok(validateAnswer(key, "javascript:alert(1)"));
    assert.ok(validateAnswer(key, "https://user:pass@example.com"));
  }
  assert.equal(
    validateAnswer("github", "https://github.com/ananya"),
    undefined,
  );
  assert.ok(validateAnswer("github", "https://github.com.evil.example/ananya"));
  assert.equal(
    validateAnswer("linkedin", "https://www.linkedin.com/in/ananya"),
    undefined,
  );
  assert.equal(
    validateAnswer("portfolio", "https://ananya.example"),
    undefined,
  );
});
test("resumes reject empty, oversized and non-PDF files", () => {
  assert.equal(
    resumeMetadataError({
      name: "resume.PDF",
      size: 500,
      type: "application/pdf",
    }),
    undefined,
  );
  assert.ok(
    resumeMetadataError({
      name: "resume.pdf",
      size: 0,
      type: "application/pdf",
    }),
  );
  assert.ok(
    resumeMetadataError({
      name: "resume.pdf",
      size: MAX_RESUME_BYTES + 1,
      type: "application/pdf",
    }),
  );
  assert.ok(
    resumeMetadataError({
      name: "resume.exe",
      size: 100,
      type: "application/pdf",
    }),
  );
  assert.ok(
    resumeMetadataError({ name: "resume.pdf", size: 100, type: "image/png" }),
  );
});
test("local drafts expire and malformed storage is safely discarded", () => {
  const now = Date.now();
  const draft = {
    version: 1,
    savedAt: now,
    answers: { ...emptyAnswers, name: "Ananya" },
    step: "email",
  };
  assert.equal(
    restoreApplicationDraft(JSON.stringify(draft), now)?.answers.name,
    "Ananya",
  );
  assert.equal(
    restoreApplicationDraft(JSON.stringify(draft), now + 86400001),
    null,
  );
  assert.equal(
    restoreApplicationDraft(
      JSON.stringify({ ...draft, savedAt: now + 1 }),
      now,
    ),
    null,
  );
  assert.equal(restoreApplicationDraft("broken JSON"), null);
  const unexpected = restoreApplicationDraft(
    JSON.stringify({
      ...draft,
      step: "invalid",
      answers: { name: 123, resume: "not stored" },
    }),
    now,
  );
  assert.equal(unexpected?.step, "name");
  assert.equal(unexpected?.answers.name, "");
  assert.equal("resume" in (unexpected?.answers ?? {}), false);
});
