import { deliveryLabel } from "@/lib/recruitment-lifecycle-schema";
import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { Shell } from "@/components/admin/Shell";
import {
  adminDate,
  applicantFilters,
  applicationStatuses,
  emailLabel,
  statusLabel,
  type ApplicantQuery,
} from "@/lib/applicant-schema";
import { vacancySchema } from "@/lib/vacancy-schema";
export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;
export default async function Applicants({
  searchParams,
}: {
  searchParams: Promise<ApplicantQuery>;
}) {
  await requireOwner();
  const filters = applicantFilters(await searchParams);
  const { q, vacancy, status, from, to, where, error } = filters;
  const vacancies = await db.vacancy.findMany({
    select: { id: true, slug: true, draft: true },
    orderBy: { createdAt: "desc" },
  });
  const counts = error
    ? [0, 0, 0, 0]
    : await db.$transaction([
        db.application.count({ where }),
        db.application.count({ where: { AND: [where, { status: "NEW" }] } }),
        db.application.count({
          where: { AND: [where, { status: "SHORTLISTED" }] },
        }),
        db.application.count({
          where: {
            AND: [
              where,
              {
                confirmation: {
                  is: {
                    OR: [
                      { status: "NEEDS_REVIEW" },
                      {
                        deliveryStatus: {
                          in: ["FAILED", "BOUNCED", "SUPPRESSED", "COMPLAINED"],
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        }),
      ]);
  const page = Math.min(
    filters.page,
    Math.max(1, Math.ceil(counts[0] / PAGE_SIZE)),
  );
  const applicants = error
    ? []
    : await db.application.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          registration: true,
          status: true,
          createdAt: true,
          revision: { select: { content: true } },
          confirmation: { select: { status: true, deliveryStatus: true } },
        },
      });
  function pageLink(next: number) {
    const query = new URLSearchParams({
      q,
      vacancy,
      status,
      from,
      to,
      page: String(next),
    });
    return `/aditya/internships/applications?${query}`;
  }
  return (
    <Shell>
      <header className="adm-heading">
        <div>
          <p className="adm-eyebrow">INTERNSHIPS / APPLICATIONS</p>
          <h1>Meet your applicants.</h1>
          <p>Review submitted applications and manage the next steps.</p>
        </div>
        <Link href="/aditya/internships">Manage vacancies</Link>
      </header>
      <section className="adm-glass">
        <h2>Find applications</h2>
        <form className="applicant-filters">
          <label>
            Search
            <input
              name="q"
              defaultValue={q}
              maxLength={200}
              placeholder="Name, email or registration number"
            />
          </label>
          <label>
            Vacancy
            <select name="vacancy" defaultValue={vacancy}>
              <option value="">All vacancies</option>
              {vacancies.map((v) => {
                const content = vacancySchema.safeParse(v.draft);
                return (
                  <option value={v.id} key={v.id}>
                    {content.success ? content.data.title : v.slug}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            Review status
            <select name="status" defaultValue={status}>
              <option value="">All statuses</option>
              {applicationStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Submitted from (IST)
            <input type="date" name="from" defaultValue={from} />
          </label>
          <label>
            Submitted through (IST)
            <input type="date" name="to" defaultValue={to} />
          </label>
          <div className="vacancy-actions">
            <button className="adm-primary">Apply filters</button>
            <Link href="/aditya/internships/applications">Clear filters</Link>
          </div>
        </form>
        {error && <p role="alert">{error}</p>}
      </section>
      {!error && (
        <>
          <p>
            Counts below match the current search, vacancy, status and date
            filters.
          </p>
          <div className="adm-stats applicant-stats">
            {[
              ["Submitted applications", counts[0]],
              ["New", counts[1]],
              ["Shortlisted", counts[2]],
              ["Emails needing review", counts[3]],
            ].map(([label, count]) => (
              <div className="adm-glass" key={label}>
                <span>{label}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <section className="adm-glass">
            <h2>Applicants</h2>
            {applicants.length ? (
              <>
                <div className="applicant-table-wrap">
                  <table className="applicant-table">
                    <caption className="sr-only">
                      Submitted applications matching your filters
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Applicant</th>
                        <th scope="col">Registration / vacancy</th>
                        <th scope="col">Submitted</th>
                        <th scope="col">Status</th>
                        <th scope="col">Confirmation email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((a) => {
                        const content = vacancySchema.safeParse(
                          a.revision.content,
                        );
                        return (
                          <tr key={a.id}>
                            <td>
                              <Link
                                href={`/aditya/internships/applications/${a.id}`}
                              >
                                {a.name}
                              </Link>
                              <span>{a.email}</span>
                            </td>
                            <td>
                              {a.registration}
                              <span>
                                {content.success
                                  ? content.data.title
                                  : "Vacancy"}
                              </span>
                            </td>
                            <td>{adminDate(a.createdAt)}</td>
                            <td>{statusLabel(a.status)}</td>
                            <td>
                              {emailLabel(a.confirmation?.status)}
                              <span>
                                {deliveryLabel(a.confirmation?.deliveryStatus)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <nav
                  className="applicant-pagination"
                  aria-label="Applicant pages"
                >
                  {page > 1 ? (
                    <Link href={pageLink(page - 1)}>Previous</Link>
                  ) : (
                    <span />
                  )}
                  <span>
                    Page {page} of{" "}
                    {Math.max(1, Math.ceil(counts[0] / PAGE_SIZE))} ·{" "}
                    {counts[0]} applications
                  </span>
                  {page * PAGE_SIZE < counts[0] ? (
                    <Link href={pageLink(page + 1)}>Next</Link>
                  ) : (
                    <span />
                  )}
                </nav>
              </>
            ) : (
              <p>
                No applications match these filters. Only completed submissions
                appear here.
              </p>
            )}
          </section>
        </>
      )}
    </Shell>
  );
}
