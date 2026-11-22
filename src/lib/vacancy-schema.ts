import { z } from "zod";

const text = z.string().trim().max(10000);
export const vacancySchema = z.object({
  title: text.min(3).max(150),
  department: text.max(150),
  summary: text.max(400),
  type: z.enum(["INTERNSHIP", "JOB"]),
  mode: z.enum(["REMOTE", "HYBRID", "ON_SITE"]),
  location: text.max(200),
  openings: z.coerce.number().int().min(1).max(10000),
  duration: text.max(150),
  hours: text.max(150),
  startDate: text.max(150),
  compensation: z.enum(["PAID", "UNPAID"]),
  stipend: text.max(200),
  overview: text,
  responsibilities: text,
  qualifications: text,
  requiredSkills: text,
  preferredSkills: text,
  eligibility: text,
  benefits: text,
  selectionProcess: text,
  deadline: z.string().refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v), "Enter a valid deadline date."),
  position: z.coerce.number().int().min(0).max(10000),
});
export type VacancyContent = z.infer<typeof vacancySchema>;
export const vacancySlugSchema = z.string().trim().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");
export const emptyVacancy: VacancyContent = {
  title: "", department: "", summary: "", type: "INTERNSHIP", mode: "REMOTE", location: "", openings: 1,
  duration: "", hours: "", startDate: "", compensation: "PAID", stipend: "", overview: "", responsibilities: "",
  qualifications: "", requiredSkills: "", preferredSkills: "", eligibility: "", benefits: "", selectionProcess: "", deadline: "", position: 0,
};
// Date-only deadlines include the entire stated day in India Standard Time.
export function vacancyExpired(content: Pick<VacancyContent, "deadline">, now = new Date()) {
  return Boolean(content.deadline && now.getTime() >= Date.parse(`${content.deadline}T23:59:59.999+05:30`) + 1);
}
export function publicationErrors(content: VacancyContent, now = new Date()): string[] {
  const required: (keyof VacancyContent)[] = ["summary", "duration", "hours", "startDate", "overview", "responsibilities", "qualifications", "requiredSkills", "eligibility", "selectionProcess", "deadline"];
  const errors = required.filter((key) => !String(content[key]).trim()).map((key) => `${key} is required to publish.`);
  if (content.compensation === "PAID" && !content.stipend) errors.push("Enter the stipend/salary amount, currency and payment frequency.");
  if (content.mode !== "REMOTE" && !content.location) errors.push("Enter the work location.");
  if (vacancyExpired(content, now)) errors.push("The application deadline has passed.");
  return errors;
}
