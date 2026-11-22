import { session } from "@/lib/auth";
import { vacancyApplicationMode } from "@/lib/recruitment-readiness";
import { recruitmentReadiness } from "@/lib/recruitment-config";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicVacancies } from "@/lib/vacancies";
import { deadlineLabel, workMode } from "@/lib/vacancy-public";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
async function getVacancy(params: Props["params"]) {
  const { slug } = await params;
  const vacancy = (await publicVacancies())?.find((v) => v.slug === slug);
  if (!vacancy) notFound();
  return vacancy;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, content: c, open } = await getVacancy(params);
  return {
    title: `${c.title} | DORVANTECH Careers`,
    description: c.summary,
    alternates: { canonical: `/careers/${slug}` },
    openGraph: {
      title: `${c.title} | DORVANTECH`,
      description: c.summary,
      url: `/careers/${slug}`,
    },
    ...(!open ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function VacancyDetails({ params }: Props) {
  const { slug, content: c, open } = await getVacancy(params);
  const readiness = recruitmentReadiness();
  const owner = open && !readiness.enabled ? await session() : null;
  const mode = vacancyApplicationMode(open, readiness.enabled, Boolean(owner));
  const sections = [
    ["About the opportunity", c.overview],
    ["What you’ll do", c.responsibilities],
    ["Minimum qualification", c.qualifications],
    ["Required skills", c.requiredSkills],
    ["Preferred skills", c.preferredSkills],
    ["Who can apply", c.eligibility],
    ["Learning outcomes & benefits", c.benefits],
    ["Selection process", c.selectionProcess],
  ];
  return (
    <main id="main" className="section-wrap careers-page vacancy-detail">
      <Link href="/careers" className="text-link">
        All vacancies
      </Link>
      <header className="careers-heading">
        <p className="eyebrow">
          {c.type === "INTERNSHIP" ? "Internship" : "Job"}
          {c.department ? ` · ${c.department}` : ""}
        </p>
        <h1>{c.title}</h1>
        <p>{c.summary}</p>
      </header>
      {!open && (
        <div className="careers-notice" role="status">
          Applications for this position are closed.{" "}
          <Link href="/careers">Explore available vacancies</Link>.
        </div>
      )}
      <dl className="vacancy-facts vacancy-detail-facts">
        {[
          ["Work mode", workMode(c.mode)],
          [
            "Location",
            c.location || (c.mode === "REMOTE" ? "Remote" : "Not specified"),
          ],
          ["Duration", c.duration],
          ["Commitment", c.hours],
          ["Start", c.startDate],
          ["Compensation", c.compensation === "UNPAID" ? "Unpaid" : c.stipend],
          ["Openings", String(c.openings)],
          [
            "Application deadline",
            `${deadlineLabel(c.deadline)} · 11:59 PM IST`,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <article className="vacancy-description">
        {sections
          .filter(([, body]) => body)
          .map(([heading, body]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
      </article>
      <section className="careers-apply" aria-labelledby="apply-heading">
        <h2 id="apply-heading">
          {mode === "closed"
            ? "This opportunity is closed."
            : mode === "unavailable"
              ? "Applications open soon."
              : mode === "preview"
                ? "Test the application experience."
                : "Ready for your next chapter?"}
        </h2>
        <p>
          {mode === "live"
            ? "Continue to a short, guided application. Have your PDF résumé ready."
            : mode === "preview"
              ? "You’re signed in as the administrator. You can test the questionnaire before enabling student submissions."
              : mode === "unavailable"
                ? "Online applications for this role have not opened yet. Please check back soon."
                : "Browse our available vacancies for other opportunities."}
        </p>
        {mode === "live" ? (
          <Link
            className="action action-primary"
            href={`/careers/${slug}/apply`}
          >
            Proceed
          </Link>
        ) : mode === "preview" ? (
          <Link
            className="action action-primary"
            href={`/careers/${slug}/apply?preview=1`}
          >
            Preview application
          </Link>
        ) : mode === "closed" ? (
          <Link className="action action-secondary" href="/careers">
            View vacancies
          </Link>
        ) : null}
        {mode === "preview" && (
          <div className="careers-notice careers-owner-setup">
            <p>
              <strong>Live submission is not enabled.</strong> Publishing a
              vacancy puts its description online; application setup is
              separate. Preview answers and files will not be submitted.
            </p>
            {!readiness.flagEnabled && (
              <p>APPLICATIONS_ENABLED is not set to true.</p>
            )}
            {readiness.missing.length > 0 && (
              <>
                <p>Missing recruitment configuration:</p>
                <ul>
                  {readiness.missing.map((key) => (
                    <li key={key}>
                      <code>{key}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Link className="text-link" href="/aditya/internships/settings">
              Complete recruitment setup
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
