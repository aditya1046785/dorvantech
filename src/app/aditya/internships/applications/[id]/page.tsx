import { deliveryLabel } from "@/lib/recruitment-lifecycle-schema";
import { deadlineLabel, workMode } from "@/lib/vacancy-public";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { Shell } from "@/components/admin/Shell";
import {
  ApplicantEmailForm,
  ApplicantDeleteForm,
  ApplicantNoteForm,
  ApplicantStatusForm,
} from "@/components/admin/ApplicantForms";
import {
  adminDate,
  emailLabel,
  profileLink,
  statusLabel,
} from "@/lib/applicant-schema";
import {
  applicationQuestions,
  emptyAnswers,
  type ApplicationAnswers,
} from "@/lib/application-schema";
import { vacancySchema } from "@/lib/vacancy-schema";
export const dynamic = "force-dynamic";
export default async function ApplicantDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ history?: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  const application = await db.application.findUnique({
    where: { id },
    include: { resume: true, revision: true, confirmation: true },
  });
  if (!application) notFound();
  const raw =
    application.answers &&
    typeof application.answers === "object" &&
    !Array.isArray(application.answers)
      ? (application.answers as Record<string, unknown>)
      : {};
  const answers = { ...emptyAnswers };
  for (const key of Object.keys(answers) as (keyof ApplicationAnswers)[])
    if (typeof raw[key] === "string") answers[key] = raw[key] as string;
  const vacancy = vacancySchema.safeParse(application.revision.content);
  const activityCount = await db.applicationActivity.count({
    where: { applicationId: id },
  });
  const requested = Number((await searchParams).history ?? 1);
  const historyPage =
    Number.isSafeInteger(requested) && requested > 0
      ? Math.min(requested, Math.max(1, Math.ceil(activityCount / 20)))
      : 1;
  const activity = await db.applicationActivity.findMany({
    where: { applicationId: id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20,
    skip: (historyPage - 1) * 20,
  });
  const email = application.confirmation;
  return (
    <Shell>
      <Link href="/aditya/internships/applications">All applicants</Link>
      <header className="adm-heading">
        <div>
          <p className="adm-eyebrow">{application.registration}</p>
          <h1>{application.name}</h1>
          <p>
            {vacancy.success ? vacancy.data.title : "Vacancy"} · Applied{" "}
            {adminDate(application.createdAt)}
          </p>
        </div>
        <p>{statusLabel(application.status)}</p>
      </header>
      <div className="applicant-detail-grid">
        <div>
          <section className="adm-glass">
            <h2>Application details</h2>
            <dl className="applicant-details">
              {applicationQuestions(answers)
                .filter(
                  (q) => !["github", "linkedin", "portfolio"].includes(q.key),
                )
                .map((q) => (
                  <div key={q.key}>
                    <dt>{q.label}</dt>
                    <dd>
                      {q.key === "email"
                        ? application.email
                        : q.key === "name"
                          ? application.name
                          : q.key === "educationStatus"
                            ? ({
                                student: "Currently studying",
                                graduate: "Graduated",
                                other: "Other / self-taught / working",
                              }[answers[q.key]] ??
                              (answers[q.key] || "Not provided"))
                            : answers[q.key] || "Not provided"}
                    </dd>
                  </div>
                ))}
              {(["github", "linkedin", "portfolio"] as const).map((key) => {
                const link = profileLink(answers[key], key);
                return (
                  <div key={key}>
                    <dt>
                      {
                        {
                          github: "GitHub",
                          linkedin: "LinkedIn",
                          portfolio: "Portfolio",
                        }[key]
                      }
                    </dt>
                    <dd>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                      ) : answers[key] ? (
                        <span>{answers[key]} (link unavailable)</span>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
          <section className="adm-glass">
            <h2>Résumé</h2>
            <p>
              {application.resume.filename} ·{" "}
              {(application.resume.size / 1024).toFixed(0)} KB
            </p>
            <p>
              Security scan completed {adminDate(application.resume.scannedAt)}.
            </p>
            <div className="vacancy-actions">
              <a
                className="adm-primary"
                href={`/aditya/internships/applications/${id}/resume?download=1`}
              >
                Download PDF
              </a>
              <a
                href={`/aditya/internships/applications/${id}/resume`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF in a new tab
              </a>
            </div>
            <iframe
              className="applicant-resume"
              src={`/aditya/internships/applications/${id}/resume`}
              title={`Résumé for ${application.name}`}
              loading="lazy"
            />
            <p>
              If your browser cannot display the PDF, use the download link.
              Your admin session must remain active.
            </p>
          </section>
          <section className="adm-glass">
            <h2>Role at time of application</h2>
            <p>
              Published revision {application.revision.revision}. This is the
              description attached to this application.
            </p>
            {vacancy.success && (
              <details>
                <summary>View original vacancy description</summary>
                <h3>{vacancy.data.title}</h3>
                {[
                  ["Summary", vacancy.data.summary],
                  ["Work mode", workMode(vacancy.data.mode)],
                  ["Location", vacancy.data.location],
                  ["Start", vacancy.data.startDate],
                  ["Openings", String(vacancy.data.openings)],
                  ["Deadline", deadlineLabel(vacancy.data.deadline) + " (IST)"],
                  ["Overview", vacancy.data.overview],
                  ["Responsibilities", vacancy.data.responsibilities],
                  ["Minimum qualification", vacancy.data.qualifications],
                  ["Required skills", vacancy.data.requiredSkills],
                  ["Preferred skills", vacancy.data.preferredSkills],
                  ["Eligibility", vacancy.data.eligibility],
                  ["Benefits", vacancy.data.benefits],
                  ["Selection process", vacancy.data.selectionProcess],
                  [
                    "Commitment",
                    `${vacancy.data.duration} · ${vacancy.data.hours}`,
                  ],
                  [
                    "Compensation",
                    vacancy.data.compensation === "UNPAID"
                      ? "Unpaid"
                      : vacancy.data.stipend,
                  ],
                ]
                  .filter(([, text]) => text)
                  .map(([title, text]) => (
                    <section className="applicant-original-section" key={title}>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </section>
                  ))}
              </details>
            )}
            <p>Recruitment acknowledgment: {application.consentVersion}</p>
          </section>
        </div>
        <aside>
          <section className="adm-glass">
            <h2>Review</h2>
            <ApplicantStatusForm
              key={`${id}-${application.version}`}
              id={id}
              status={application.status}
              version={application.version}
            />
          </section>
          <section className="adm-glass">
            <h2>Confirmation email</h2>
            <p>Queue: {emailLabel(email?.status)}</p>
            <p>Delivery: {deliveryLabel(email?.deliveryStatus)}</p>
            {email?.deliveryUpdatedAt && (
              <p>Delivery update: {adminDate(email.deliveryUpdatedAt)}</p>
            )}
            {email && (
              <>
                <p>Attempts: {email.attempts}</p>
                {email.sentAt && (
                  <p>Accepted by provider: {adminDate(email.sentAt)}</p>
                )}
                {email.providerId && (
                  <p className="applicant-break">
                    Provider message ID: {email.providerId}
                  </p>
                )}
                {email.status === "PENDING" && (
                  <p>Next attempt: {adminDate(email.nextAttempt)}</p>
                )}
                {email.status !== "SENT" && <ApplicantEmailForm id={id} />}
              </>
            )}
            <p>
              Delivery updates come from verified Resend webhooks. If no update
              is reported, check the message in Resend.
            </p>
          </section>
          <section className="adm-glass">
            <h2>Add a note</h2>
            <ApplicantNoteForm id={id} />
          </section>
          <section className="adm-glass recruitment-danger">
            <h2>Delete application</h2>
            <ApplicantDeleteForm
              id={id}
              version={application.version}
              registration={application.registration}
            />
          </section>
        </aside>
      </div>
      <section id="activity" className="adm-glass">
        <h2>Internal notes & activity</h2>
        <ol className="applicant-activity">
          {activity.map((item) => (
            <li key={item.id}>
              <p>
                <strong>
                  {item.kind === "STATUS"
                    ? `${statusLabel(item.fromStatus ?? "")} to ${statusLabel(item.toStatus ?? "")}`
                    : item.kind === "NOTE"
                      ? "Internal note"
                      : "Email retry"}
                </strong>
              </p>
              {item.body && <p>{item.body}</p>}
              <small>{adminDate(item.createdAt)} · Owner</small>
            </li>
          ))}
        </ol>
        {!activity.length && <p>No review activity yet.</p>}
        <nav className="applicant-pagination" aria-label="Activity pages">
          {historyPage > 1 ? (
            <Link href={`?history=${historyPage - 1}#activity`}>
              Newer activity
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {historyPage} of {Math.max(1, Math.ceil(activityCount / 20))}
          </span>
          {historyPage * 20 < activityCount ? (
            <Link href={`?history=${historyPage + 1}#activity`}>
              Older activity
            </Link>
          ) : (
            <span />
          )}
        </nav>
        <p>Application received {adminDate(application.createdAt)}.</p>
      </section>
    </Shell>
  );
}
