import { z } from "zod";
import {
  applicationFields,
  applicationQuestions,
  emptyAnswers,
  MAX_RESUME_BYTES,
} from "./application-schema";
export const submissionSchema = z
  .object({
    slug: z
      .string()
      .min(3)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    requestKey: z.uuid(),
    revision: z.number().int().positive(),
    consent: z.literal(true),
    answers: z.object({
      ...applicationFields,
      institution: z.string().trim().max(200),
      graduationYear: z.string().trim().max(4),
    }),
  })
  .superRefine(({ answers }, ctx) => {
    for (const q of applicationQuestions(answers)) {
      const result = applicationFields[q.key].safeParse(answers[q.key]);
      if (!result.success)
        ctx.addIssue({
          code: "custom",
          path: ["answers", q.key],
          message: result.error.issues[0].message,
        });
    }
  })
  .transform((data) => {
    const answers = {
      ...emptyAnswers,
      ...data.answers,
      email: data.answers.email.toLowerCase(),
    };
    if (answers.educationStatus === "other") {
      answers.institution = "";
      answers.graduationYear = "";
    }
    return { ...data, answers };
  });
export function pdfContentValid(bytes: Uint8Array) {
  if (bytes.length < 12 || bytes.length > MAX_RESUME_BYTES) return false;
  const header = new TextDecoder().decode(bytes.slice(0, 8));
  const tail = new TextDecoder().decode(bytes.slice(-1024));
  return /^%PDF-\d\.\d/.test(header) && tail.includes("%%EOF");
}
export function confirmationText(
  name: string,
  title: string,
  registration: string,
  date: Date,
) {
  return `Hello ${name},\n\nYour application for ${title} at DORVANTECH has been received.\n\nRegistration number: ${registration}\nSubmitted: ${date.toISOString()}\n\nIf you are selected for the next round, we will contact you using the details you provided.\n\nThank you for your interest in DORVANTECH.`;
}
