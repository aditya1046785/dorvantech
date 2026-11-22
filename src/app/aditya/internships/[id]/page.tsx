import { applicationsEnabled } from "@/lib/recruitment-config";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { vacancySchema } from "@/lib/vacancy-schema";
import { Shell } from "@/components/admin/Shell";
import { VacancyForm } from "@/components/admin/VacancyForm";
export default async function EditVacancy({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  const vacancy = await db.vacancy.findUnique({ where: { id } });
  if (!vacancy) notFound();
  return (
    <Shell>
      <h1>Edit vacancy</h1>
      {!applicationsEnabled() && (
        <div className="adm-glass">
          <h2>Application setup is incomplete</h2>
          <p>
            You can publish this vacancy and preview its questionnaire. Real
            student submissions are unavailable until résumé storage, scanning
            and recruitment email settings are configured.
          </p>
          <Link href="/aditya/internships/settings">
            Complete recruitment setup
          </Link>
        </div>
      )}
      <p>
        {vacancy.status.toLowerCase()} · Published revision{" "}
        {vacancy.publishedRevision}
      </p>
      {vacancy.published &&
        ["PUBLISHED", "CLOSED"].includes(vacancy.status) && (
          <p>
            <Link
              href={`/careers/${vacancy.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View public vacancy
            </Link>{" "}
            ·{" "}
            <Link
              href={`/careers/${vacancy.slug}/apply?preview=1`}
              target="_blank"
              rel="noreferrer"
            >
              Preview application session
            </Link>
          </p>
        )}
      <p>
        <Link href={`/aditya/internships/${id}/preview`}>
          Preview saved draft
        </Link>{" "}
        · <Link href="/aditya/internships">All vacancies</Link>
      </p>
      <VacancyForm
        vacancy={{
          id,
          slug: vacancy.slug,
          version: vacancy.version,
          status: vacancy.status,
          published: vacancy.published !== null,
          content: vacancySchema.parse(vacancy.draft),
        }}
      />
    </Shell>
  );
}
