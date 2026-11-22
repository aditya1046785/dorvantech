import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  submissionSchema,
  pdfContentValid,
  confirmationText,
} from "../src/lib/application-submission";
import { emptyAnswers } from "../src/lib/application-schema";
const valid = {
  slug: "frontend-intern",
  requestKey: randomUUID(),
  revision: 1,
  consent: true,
  answers: {
    ...emptyAnswers,
    name: "Ananya Sharma",
    email: "ANANYA@example.com",
    location: "Kochi, India",
    educationStatus: "other",
    qualification: "Self taught",
    skills: "React",
    motivation: "I want to learn how to build useful software.",
    startDate: "Immediately",
    hours: "20",
    institution: "Stale college",
    graduationYear: "2025",
  },
};
test("submission normalizes email and removes inapplicable education answers", () => {
  const parsed = submissionSchema.parse(valid);
  assert.equal(parsed.answers.email, "ananya@example.com");
  assert.equal(parsed.answers.institution, "");
  assert.equal(parsed.answers.graduationYear, "");
});
test("submission requires consent, valid request key, revision and conditional education", () => {
  for (const patch of [
    { consent: false },
    { requestKey: "guess" },
    { revision: 0 },
    {
      answers: {
        ...valid.answers,
        educationStatus: "student",
        institution: "",
      },
    },
    { answers: { ...valid.answers, email: "invalid" } },
    { answers: { ...valid.answers, portfolio: "javascript:alert(1)" } },
  ])
    assert.equal(
      submissionSchema.safeParse({ ...valid, ...patch }).success,
      false,
    );
});
test("server PDF checks require a version header and EOF marker", () => {
  const bytes = (value: string) => new TextEncoder().encode(value);
  assert.equal(
    pdfContentValid(bytes("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n")),
    true,
  );
  assert.equal(pdfContentValid(bytes("%PDF-not-a-document")), false);
  assert.equal(pdfContentValid(bytes("%PDF-1.7\nmissing trailer")), false);
  assert.equal(pdfContentValid(bytes("not a PDF document %%EOF")), false);
});
test("confirmation includes receipt and selection wording without promising delivery or selection", () => {
  const text = confirmationText(
    "Ananya",
    "Frontend intern",
    "DVT-2026-ABC",
    new Date("2026-11-22T00:00:00Z"),
  );
  assert.ok(text.includes("DVT-2026-ABC"));
  assert.ok(text.includes("If you are selected for the next round"));
  assert.ok(text.includes("Frontend intern"));
});
