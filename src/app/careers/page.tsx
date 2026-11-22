import { applicationsEnabled } from "@/lib/recruitment-config";
import type { Metadata } from "next";
import Link from "next/link";
import { publicVacancies } from "@/lib/vacancies";
import { deadlineLabel, workMode } from "@/lib/vacancy-public";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Internships & Vacancies | DORVANTECH",
  description:
    "Explore internships and job opportunities at DORVANTECH. Read role details, eligibility, commitment and compensation.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Internships & Vacancies | DORVANTECH",
    description:
      "Explore opportunities and build your next chapter with DORVANTECH.",
    url: "/careers",
  },
};
export default async function Careers() {
  const accepting = applicationsEnabled();
  const vacancies = await publicVacancies();
  const open = vacancies?.filter((v) => v.open) ?? [];
  return (
    <main id="main" className="section-wrap careers-page">
      <Link className="text-link" href="/">
        Back to home
      </Link>
      <header className="careers-heading">
        <p className="eyebrow">GROW WITH DORVANTECH</p>
        <h1>
          Find your next
          <br />
          <span>opportunity.</span>
        </h1>
        <p>
          Explore our internships and vacancies. Read the role, requirements and
          commitment before you apply.
        </p>
      </header>
      <div className="careers-list-heading">
        <h2>Available vacancies</h2>
        <p>
          {open.length} {open.length === 1 ? "position" : "positions"}
        </p>
      </div>
      {open.length ? (
        <div className="vacancy-grid">
          {open.map(({ slug, content: c }) => (
            <article className="vacancy-card" key={slug}>
              <p className="eyebrow">
                {c.type === "INTERNSHIP" ? "Internship" : "Job"}
                {c.department ? ` · ${c.department}` : ""}
              </p>
              <h2>
                <Link href={`/careers/${slug}`}>{c.title}</Link>
              </h2>
              <p>{c.summary}</p>
              <dl className="vacancy-facts">
                <div>
                  <dt>Work mode</dt>
                  <dd>
                    {workMode(c.mode)}
                    {c.location ? ` · ${c.location}` : ""}
                  </dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{c.duration}</dd>
                </div>
                <div>
                  <dt>Compensation</dt>
                  <dd>{c.compensation === "UNPAID" ? "Unpaid" : c.stipend}</dd>
                </div>
                <div>
                  <dt>Deadline</dt>
                  <dd>{deadlineLabel(c.deadline)} · IST</dd>
                </div>
              </dl>
              <Link
                className="action action-secondary"
                href={`/careers/${slug}`}
                aria-label={`${accepting ? "Apply now for" : "View details for"} ${c.title}`}
              >
                {accepting ? "Apply Now" : "View details"}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="careers-empty">
          <h2>
            {vacancies === null
              ? "Opportunities are on their way."
              : "No open positions right now."}
          </h2>
          <p>
            {vacancies === null
              ? "Our vacancy listings are being prepared. Please check back soon."
              : "Please check back here for future internships and vacancies."}
          </p>
          <Link className="text-link" href="/">
            Explore DORVANTECH
          </Link>
        </div>
      )}
    </main>
  );
}
