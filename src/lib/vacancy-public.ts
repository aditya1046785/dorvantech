import {
  vacancyExpired,
  vacancySchema,
  type VacancyContent,
} from "./vacancy-schema";

export type PublicVacancy = {
  slug: string;
  content: VacancyContent;
  revision: number;
  open: boolean;
};
export function publishedVacancies(
  rows: {
    slug: string;
    status: string;
    published: unknown;
    publishedRevision?: number;
  }[],
  now = new Date(),
): PublicVacancy[] {
  return rows
    .flatMap((row) => {
      if (!["PUBLISHED", "CLOSED"].includes(row.status) || !row.published)
        return [];
      const parsed = vacancySchema.safeParse(row.published);
      if (!parsed.success) return [];
      return [
        {
          slug: row.slug,
          revision: row.publishedRevision ?? 0,
          content: parsed.data,
          open: row.status === "PUBLISHED" && !vacancyExpired(parsed.data, now),
        },
      ];
    })
    .sort(
      (a, b) =>
        a.content.position - b.content.position ||
        a.content.title.localeCompare(b.content.title) ||
        a.slug.localeCompare(b.slug),
    );
}
export function workMode(mode: VacancyContent["mode"]) {
  return { REMOTE: "Remote", HYBRID: "Hybrid", ON_SITE: "On-site" }[mode];
}
export function deadlineLabel(date: string) {
  if (!date) return "Not specified";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}
