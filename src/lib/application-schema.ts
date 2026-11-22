import { z } from "zod";

const short = z.string().trim().max(200);
const optionalLink = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return (
        ["https:", "http:"].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        Boolean(url.hostname.includes("."))
      );
    } catch {
      return false;
    }
  }, "Enter a complete website address starting with https://, or skip this question.");
export const applicationFields = {
  name: short.min(2, "Please enter your full name."),
  email: z
    .string()
    .trim()
    .max(254)
    .email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (v) => !v || /^[+()\d\s.-]{7,30}$/.test(v),
      "Enter a valid phone number, or skip.",
    ),
  location: short.min(2, "Please enter your city and country."),
  educationStatus: z.enum(["student", "graduate", "other"], {
    error: "Choose your current status.",
  }),
  institution: short.min(2, "Please enter your college or university."),
  qualification: short.min(
    2,
    "Please enter your qualification or specialization.",
  ),
  graduationYear: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter a four-digit graduation year.")
    .refine(
      (v) => Number(v) >= 1950 && Number(v) <= new Date().getFullYear() + 15,
      "Please enter a valid graduation year.",
    ),
  skills: z
    .string()
    .trim()
    .min(2, "Tell us about your relevant skills.")
    .max(2000),
  experience: z.string().trim().max(3000),
  motivation: z
    .string()
    .trim()
    .min(20, "Please tell us a little more (at least 20 characters).")
    .max(3000),
  startDate: short.min(2, "Tell us when you can start."),
  hours: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Enter a whole number of hours.")
    .refine(
      (v) => Number(v) >= 1 && Number(v) <= 80,
      "Enter between 1 and 80 hours per week.",
    ),
  github: optionalLink.refine(
    (value) =>
      !value ||
      (() => {
        try {
          return ["github.com", "www.github.com"].includes(
            new URL(value).hostname.toLowerCase(),
          );
        } catch {
          return false;
        }
      })(),
    "Enter a github.com profile address, or skip.",
  ),
  linkedin: optionalLink.refine(
    (value) =>
      !value ||
      (() => {
        try {
          return ["linkedin.com", "www.linkedin.com"].includes(
            new URL(value).hostname.toLowerCase(),
          );
        } catch {
          return false;
        }
      })(),
    "Enter a linkedin.com profile address, or skip.",
  ),
  portfolio: optionalLink,
};
export type AnswerKey = keyof typeof applicationFields;
export type ApplicationAnswers = Record<AnswerKey, string>;
export const emptyAnswers: ApplicationAnswers = {
  name: "",
  email: "",
  phone: "",
  location: "",
  educationStatus: "",
  institution: "",
  qualification: "",
  graduationYear: "",
  skills: "",
  experience: "",
  motivation: "",
  startDate: "",
  hours: "",
  github: "",
  linkedin: "",
  portfolio: "",
};
export type Question = {
  key: AnswerKey;
  label: string;
  title: string;
  help?: string;
  optional?: boolean;
  type?: string;
  multiline?: boolean;
  autocomplete?: string;
  maxLength?: number;
};
const questions: Question[] = [
  {
    key: "name",
    label: "Full name",
    title: "Let’s start with your name.",
    autocomplete: "name",
    maxLength: 200,
  },
  {
    key: "email",
    label: "Email address",
    title: "Where can we reach you?",
    help: "We’ll use this email for your confirmation and any next steps.",
    type: "email",
    autocomplete: "email",
    maxLength: 254,
  },
  {
    key: "phone",
    label: "Phone number",
    title: "Would you like to share a phone number?",
    optional: true,
    type: "tel",
    autocomplete: "tel",
    maxLength: 30,
  },
  {
    key: "location",
    label: "City and country",
    title: "Where are you based?",
    autocomplete: "off",
    maxLength: 200,
  },
  {
    key: "educationStatus",
    label: "Current status",
    title: "What are you doing currently?",
    type: "select",
  },
  {
    key: "institution",
    label: "College or university",
    title: "Where do you study, or where did you graduate?",
    maxLength: 200,
  },
  {
    key: "qualification",
    label: "Qualification and specialization",
    title: "Tell us about your qualification.",
    help: "For example, B.Tech in Computer Science, a diploma, or your relevant training.",
    maxLength: 200,
  },
  {
    key: "graduationYear",
    label: "Graduation year",
    title: "What is your graduation year?",
    help: "Your completed or expected year.",
    type: "year",
    maxLength: 4,
  },
  {
    key: "skills",
    label: "Relevant skills",
    title: "What skills would you bring?",
    multiline: true,
    maxLength: 2000,
  },
  {
    key: "experience",
    label: "Projects or experience",
    title: "Anything you’ve built or worked on?",
    help: "A class project, personal experiment or previous role all count.",
    optional: true,
    multiline: true,
    maxLength: 3000,
  },
  {
    key: "motivation",
    label: "Why this opportunity",
    title: "What interests you about this opportunity?",
    multiline: true,
    maxLength: 3000,
  },
  {
    key: "startDate",
    label: "Availability to start",
    title: "When could you start?",
    help: "A date or a short answer such as Immediately or After my exams.",
    maxLength: 200,
  },
  {
    key: "hours",
    label: "Hours per week",
    title: "How many hours a week can you commit?",
    help: "Enter a number between 1 and 80.",
    type: "hours",
    maxLength: 2,
  },
  {
    key: "github",
    label: "GitHub profile",
    title: "Do you have a GitHub profile?",
    help: "Share your full profile URL, or choose I don’t have one.",
    optional: true,
    type: "url",
    maxLength: 500,
  },
  {
    key: "linkedin",
    label: "LinkedIn profile",
    title: "Do you have a LinkedIn profile?",
    help: "This is separate from your GitHub and portfolio links.",
    optional: true,
    type: "url",
    maxLength: 500,
  },
  {
    key: "portfolio",
    label: "Portfolio website",
    title: "Do you have a portfolio website?",
    help: "Share your full website URL, or choose I don’t have one.",
    optional: true,
    type: "url",
    maxLength: 500,
  },
];
export function applicationQuestions(
  answers: Pick<ApplicationAnswers, "educationStatus">,
) {
  return questions.filter(
    (q) =>
      answers.educationStatus !== "other" ||
      !["institution", "graduationYear"].includes(q.key),
  );
}
export function validateAnswer(key: AnswerKey, value: string) {
  const result = applicationFields[key].safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}
export function validateApplicationAnswers(answers: ApplicationAnswers) {
  return applicationQuestions(answers).flatMap((q) => {
    const error = validateAnswer(q.key, answers[q.key]);
    return error ? [{ key: q.key, error }] : [];
  });
}
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export function resumeMetadataError(file: {
  name: string;
  size: number;
  type: string;
}) {
  if (!file.name.toLowerCase().endsWith(".pdf"))
    return "Please choose a PDF résumé.";
  if (file.size === 0) return "This file is empty. Please choose another PDF.";
  if (file.size > MAX_RESUME_BYTES) return "Your PDF must be 5 MB or smaller.";
  if (file.type && file.type !== "application/pdf")
    return "Please choose a PDF résumé.";
}
// Session drafts are local to a tab and expire after a day. Files are never stored.
export function restoreApplicationDraft(
  raw: string | null,
  now = Date.now(),
): { answers: ApplicationAnswers; step: string; requestKey?: string } | null {
  try {
    const draft = JSON.parse(raw || "null");
    if (
      !draft ||
      draft.version !== 1 ||
      typeof draft.savedAt !== "number" ||
      draft.savedAt > now ||
      now - draft.savedAt > 86400000 ||
      !draft.answers ||
      typeof draft.answers !== "object"
    )
      return null;
    const answers = { ...emptyAnswers };
    for (const key of Object.keys(answers) as AnswerKey[]) {
      const value = draft.answers[key];
      if (typeof value === "string" && value.length <= 3000)
        answers[key] = value;
    }
    const validSteps = [
      ...applicationQuestions(answers).map((q) => q.key),
      "resume",
      "review",
    ];
    return {
      answers,
      requestKey: z.uuid().safeParse(draft.requestKey).success
        ? draft.requestKey
        : undefined,
      step: validSteps.includes(draft.step) ? draft.step : "name",
    };
  } catch {
    return null;
  }
}
