import { adminDate } from "@/lib/applicant-schema";
import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { Shell } from "@/components/admin/Shell";
import {
  RecruitmentSettingsForm,
  StorageCheckForm,
} from "@/components/admin/RecruitmentSettingsForm";
import {
  applicationsEnabled,
  recruitmentReadiness,
  recruitmentRequirements,
} from "@/lib/recruitment-config";
import { retentionCutoff } from "@/lib/recruitment-lifecycle-schema";
export const dynamic = "force-dynamic";
export default async function RecruitmentSettings() {
  await requireOwner();
  const readiness = recruitmentReadiness();
  const policy = await db.recruitmentSettings.findUnique({
    where: { id: "recruitment" },
  });
  const days = policy?.retentionDays ?? 180;
  const due = await db.application.count({
    where: {
      status: { in: ["SELECTED", "REJECTED", "WITHDRAWN"] },
      finalizedAt: { lte: retentionCutoff(days) },
    },
  });
  const [emailProblems, queuedDeletions, lastJob] = await Promise.all([
    db.confirmationEmail.count({
      where: {
        OR: [
          { status: "NEEDS_REVIEW" },
          {
            deliveryStatus: {
              in: ["BOUNCED", "FAILED", "SUPPRESSED", "COMPLAINED"],
            },
          },
        ],
      },
    }),
    db.resumeObject.count({ where: { deleteAfter: { not: null } } }),
    db.auditLog.findFirst({
      where: { action: "RECRUITMENT_JOB_COMPLETED" },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <Shell>
      <Link href="/aditya/internships">Back to internships</Link>
      <h1>Recruitment settings</h1>
      <section className="adm-glass">
        <h2>Launch readiness</h2>
        <p>
          {applicationsEnabled()
            ? "Applications are enabled by configuration. Complete a real end-to-end test before announcing the program."
            : "Live applications are disabled or configuration is incomplete."}
        </p>
        {!readiness.enabled && (
          <div className="careers-notice">
            <h3>Vacancy published, applications not open?</h3>
            <p>
              Publishing makes the description visible. To accept submissions,
              configure private PDF storage and its scanner, set the recruitment
              email credentials, and set APPLICATIONS_ENABLED=true. You can
              preview the questionnaire from a published vacancy while
              completing setup.
            </p>
          </div>
        )}
        <ul>
          {recruitmentRequirements.map((key) => (
            <li key={key}>
              <code>{key}</code>:{" "}
              {readiness.missing.includes(key) ? "Missing" : "Configured"}
            </li>
          ))}
        </ul>
        <p>APPLICATIONS_ENABLED: {readiness.flagEnabled ? "true" : "false"}</p>
        <p>
          These checks show configuration presence; they do not verify email
          delivery, scanner operation or host upload limits.
        </p>
        <StorageCheckForm />
        <p>
          Last completed scheduled run:{" "}
          {lastJob ? adminDate(lastJob.createdAt) : "Not recorded yet"}. Queued
          résumé deletions: {queuedDeletions}. Emails needing attention:{" "}
          {emailProblems}.
        </p>
      </section>
      <section className="adm-glass">
        <h2>Applicant retention</h2>
        <p>
          Automatic deletion is {policy?.autoDelete ? "enabled" : "disabled"}.{" "}
          {due} finalised application(s) are older than the current {days}-day
          period.
        </p>
        <RecruitmentSettingsForm
          days={days}
          enabled={policy?.autoDelete ?? false}
          version={policy?.version ?? 0}
        />
      </section>
      <section className="adm-glass">
        <h2>Deletion and service records</h2>
        <p>
          Deleted applications disappear from your dashboard immediately. Their
          private PDFs are queued for removal on the next scheduled run; failed
          file deletions retry. Provider logs, mailboxes and backups follow
          their own retention policies and may require a separate provider
          request.
        </p>
      </section>
    </Shell>
  );
}
