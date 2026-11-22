import { applicationsEnabled } from "@/lib/recruitment-config";
import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { vacancyExpired, vacancySchema } from "@/lib/vacancy-schema";
import { Shell } from "@/components/admin/Shell";
export const dynamic = "force-dynamic";
export default async function Internships({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireOwner();
  const { q = "", status = "" } = await searchParams;
  const [all, applicationGroups, emailProblems] = await Promise.all([
    db.vacancy.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { applications: true } } },
    }),
    db.application.groupBy({ by: ["status"], _count: { _all: true } }),
    db.confirmationEmail.count({
      where: {
        OR: [
          { status: "NEEDS_REVIEW" },
          {
            deliveryStatus: {
              in: ["FAILED", "BOUNCED", "SUPPRESSED", "COMPLAINED"],
            },
          },
        ],
      },
    }),
  ]);
  const submitted = applicationGroups.reduce(
    (sum, group) => sum + group._count._all,
    0,
  );
  const newApplications =
    applicationGroups.find((group) => group.status === "NEW")?._count._all ?? 0;
  const shortlisted =
    applicationGroups.find((group) => group.status === "SHORTLISTED")?._count
      ._all ?? 0;
  const records = all.map((v) => ({
    ...v,
    content: vacancySchema.parse(v.draft),
    live: v.published ? vacancySchema.parse(v.published) : null,
  }));
  const rows = records.filter(
    (v) =>
      (!status || v.status === status) &&
      `${v.content.title} ${v.slug}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Shell>
      <header className="adm-heading">
        <div>
          <p className="adm-eyebrow">INTERNSHIPS & VACANCIES</p>
          <h1>Build your next team.</h1>
          <p>Create opportunities and review the people applying.</p>
        </div>
        <div className="vacancy-actions">
          <Link href="/aditya/internships/applications">View applicants</Link>
          <Link href="/aditya/internships/settings">Recruitment settings</Link>
          <Link className="adm-primary" href="/aditya/internships/new">
            Add vacancy
          </Link>
        </div>
      </header>
      {!applicationsEnabled() && (
        <section className="adm-glass">
          <h2>Live applications are not enabled</h2>
          <p>
            Published vacancies are visible on the website. You can preview
            their questionnaires while completing résumé storage, scanning and
            email setup.
          </p>
          <Link href="/aditya/internships/settings">
            Complete recruitment setup
          </Link>
        </section>
      )}
      <p>Recruitment totals cover all vacancies.</p>
      <div className="adm-stats">
        {[
          ["Submitted applications", submitted],
          ["New applications", newApplications],
          ["Shortlisted", shortlisted],
          ["Emails needing review", emailProblems],
          [
            "Open vacancies",
            records.filter(
              (v) =>
                v.status === "PUBLISHED" && v.live && !vacancyExpired(v.live),
            ).length,
          ],
          ["Drafts", records.filter((v) => v.status === "DRAFT").length],
          [
            "Closed / expired",
            records.filter(
              (v) =>
                v.status === "CLOSED" ||
                (v.status === "PUBLISHED" && v.live && vacancyExpired(v.live)),
            ).length,
          ],
        ].map(([label, count]) => (
          <div className="adm-glass" key={label}>
            <span>{label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
      <section className="adm-glass">
        <h2>Vacancies</h2>
        <form className="adm-filter">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search vacancies"
            aria-label="Search vacancies"
          />
          <select
            name="status"
            defaultValue={status}
            aria-label="Vacancy status"
          >
            <option value="">All statuses</option>
            {["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button>Filter</button>
        </form>
        <div className="adm-projects">
          {rows.map((v) => (
            <article key={v.id}>
              <div>
                <Link href={`/aditya/internships/${v.id}`}>
                  <h3>{v.content.title}</h3>
                </Link>
                <p>
                  {v.status.toLowerCase()}
                  {v.status === "PUBLISHED" && v.live && vacancyExpired(v.live)
                    ? " · Deadline passed"
                    : ""}{" "}
                  · {v.content.type.toLowerCase()}
                </p>
                <small>
                  /{v.slug} · {v.content.openings} opening(s)
                </small>
                <p>
                  <Link
                    href={`/aditya/internships/applications?vacancy=${v.id}`}
                  >
                    {v._count.applications} submitted application(s)
                  </Link>
                </p>
              </div>
              <div className="adm-row-actions">
                <Link href={`/aditya/internships/${v.id}/preview`}>
                  Preview draft
                </Link>
                <Link href={`/aditya/internships/${v.id}`}>Manage</Link>
              </div>
            </article>
          ))}
          {!rows.length && (
            <p>
              No vacancies found. Add your first opportunity to get started.
            </p>
          )}
        </div>
      </section>
      <p>
        <Link href="/aditya/internships/applications">
          Review all submitted applications
        </Link>
      </p>
    </Shell>
  );
}
