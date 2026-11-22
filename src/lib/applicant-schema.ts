import { z } from "zod";
import type { Prisma } from "@prisma/client";
export const applicationStatuses = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export const reviewSchema = z.object({
  id: z.string().min(1).max(100),
  version: z.coerce.number().int().positive(),
  status: z.enum(applicationStatuses),
});
export const noteSchema = z.object({
  id: z.string().min(1).max(100),
  body: z
    .string()
    .trim()
    .min(1, "Write a note first.")
    .max(4000, "Keep notes under 4,000 characters."),
});
export function statusLabel(status: string) {
  return (
    (
      {
        NEW: "New",
        REVIEWING: "Reviewing",
        SHORTLISTED: "Shortlisted",
        INTERVIEW: "Interview",
        SELECTED: "Selected",
        REJECTED: "Rejected",
        WITHDRAWN: "Withdrawn",
      } as Record<string, string>
    )[status] ?? status
  );
}
export function emailLabel(status?: string) {
  return (
    (
      {
        PENDING: "Queued",
        SENT: "Accepted by email provider",
        NEEDS_REVIEW: "Needs review",
      } as Record<string, string>
    )[status ?? ""] ?? "No email record"
  );
}
export function adminDate(date: Date) {
  return (
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(date) + " IST"
  );
}
export type ApplicantQuery = Partial<
  Record<"q" | "vacancy" | "status" | "from" | "to" | "page", string | string[]>
>;
function scalar(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) =>
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value,
  );
export function applicantFilters(raw: ApplicantQuery) {
  const query = {
    q: scalar(raw.q),
    vacancy: scalar(raw.vacancy),
    status: scalar(raw.status),
    from: scalar(raw.from),
    to: scalar(raw.to),
    page: scalar(raw.page),
  };
  const q = (query.q ?? "").trim().slice(0, 200);
  const vacancy = (query.vacancy ?? "").slice(0, 100);
  const status = applicationStatuses.includes(
    query.status as (typeof applicationStatuses)[number],
  )
    ? query.status!
    : "";
  const from = dateOnly.safeParse(query.from).success ? query.from! : "";
  const to = dateOnly.safeParse(query.to).success ? query.to! : "";
  const error =
    from && to && from > to
      ? "The start date must be on or before the end date."
      : "";
  const createdAt = {
    ...(from ? { gte: new Date(`${from}T00:00:00+05:30`) } : {}),
    ...(to ? { lte: new Date(`${to}T23:59:59.999+05:30`) } : {}),
  };
  const where: Prisma.ApplicationWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { registration: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(vacancy ? { vacancyId: vacancy } : {}),
    ...(status ? { status } : {}),
    ...(from || to ? { createdAt } : {}),
  };
  const page = /^\d{1,7}$/.test(query.page ?? "")
    ? Math.max(1, Number(query.page))
    : 1;
  return { q, vacancy, status, from, to, page, where, error };
}
export function profileLink(
  value: unknown,
  kind: "github" | "linkedin" | "portfolio",
) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    if (
      kind === "github" &&
      !["github.com", "www.github.com"].includes(url.hostname)
    )
      return null;
    if (
      kind === "linkedin" &&
      !["linkedin.com", "www.linkedin.com"].includes(url.hostname)
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
