# Internships implementation

## Stage 1: vacancy management

The owner workspace now has an Internships entry at `/aditya/internships`.
New vacancies start at `/aditya/internships/new`. Each vacancy has an editor and
an authenticated preview of its saved draft. Descriptions are plain text.

Run `npm run db:generate` and apply the additive migration with
`npm run db:deploy` against the intended database before opening these pages.
No database reset or project seed is needed. Back up a production database before
applying migrations. This stage does not change existing project records.

Drafts require a title and URL slug. Publishing also requires the description,
responsibilities, eligibility, minimum qualification, required skills, commitment,
start date, selection process, summary and deadline. Paid vacancies require an
explicit amount/range, currency and frequency in the compensation field. Hybrid
and on-site positions require a location. Optional benefits should describe only
what is actually offered.

Saving a draft preserves the published snapshot. Every publication creates an
immutable `VacancyRevision` for future applications to reference. Published URLs
are locked. Edits include optimistic version checks to prevent stale-tab writes.
Vacancies can be closed, republished to reopen, archived, and restored as drafts.
Date-only deadlines expire at the end of that date in India Standard Time.
The overview labels published vacancies with past deadlines as expired; future
public listing and submission code must use the same deadline check.

Stage 2 adds the homepage section, header/footer navigation, `/careers` listing,
and `/careers/[slug]` detail pages. Public pages use only published snapshots;
drafts and archived records are inaccessible. Closed/expired detail pages remain
available with a closed notice and are excluded from listings and the sitemap.
The public section shows a setup message when the database or vacancy table is
not yet configured. Other database errors are not disguised as empty listings.
Proceed is enabled only after the live-application configuration described below is complete.

Stage 3 adds the guided session at `/careers/[slug]/apply`. An authenticated owner
can open it using **Preview application session** on a published, unexpired
vacancy editor. The public route shows an applications-not-yet-open notice to
other visitors. The preview has conditional education questions, separate profile
links, validation, optional skips, back navigation, PDF selection and a review
screen with edit links. No files or answers are uploaded to the server. The final
Submit button is disabled; no confirmation or registration number is fabricated.
Draft answers use per-vacancy session storage with a 24-hour expiry. Files are
never persisted in browser storage and must be reselected after refreshing.
The preview uses `private, no-store` and is excluded from search indexing.
No confirmation emails are sent and no application counts are fabricated.

## Remaining deployment work

The implementation stages are complete. Apply the migrations to your intended
database, configure the private bucket/scanner/Resend/webhook/scheduler, verify a
real test application and email, and then enable live applications. The production
database and real service configuration have not been changed automatically.

These require private storage credentials and a verified Resend sender. No PDFs
should be placed in `public/` or persisted on ephemeral deployment disks.

## Stage 4: private storage and live submission

Live submission is now implemented but is disabled by default. It checks the
vacancy deadline and publication again while holding a database row lock. If a
vacancy was revised since the application page loaded, the student must review
the updated description. Each application references that immutable revision.
One normalized email is allowed per vacancy. A random request key lets a student
retry a lost response and recover the same registration number. Registration
numbers alone never authorize access to applicant data.

Before enabling live applications:

1. Apply the new `202611220002_applications` migration with `npm run db:deploy`.
   Keep the existing migration too. This adds applications, private file metadata
   and persistent confirmation-email jobs; it does not reset project data.
2. Create a **private** Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`
   in `.env` and your deployment environment. `BLOB_STORE_ID` may also be set
   by the Vercel integration. Never prefix the token with `NEXT_PUBLIC_`.
   Uploads use `access: "private"`, retain the database's random pathname,
   and prohibit overwrites. Admin downloads use authenticated server reads;
   retention jobs delete blobs by pathname. The settings check verifies the
   connection and rejects public URLs when the store contains files; the first
   upload enforces private access for an empty store too. Existing Supabase
   files must be copied to the private Blob store at their existing object keys
   before switching credentials; this change does not migrate stored files.
3. Set `CLOUDMERSIVE_API_KEY` to your Cloudmersive Virus Scan API key in
   `.env` and your deployment environment. The server posts the PDF as multipart
   `inputFile` to `https://api.cloudmersive.com/virus/scan/file` with the `Apikey`
   header, before Blob upload. Only a successful response with `CleanResult: true`
   is accepted. Failed requests, exhausted quota, timeouts, and malformed results
   block submission. `RESUME_SCAN_URL` and `RESUME_SCAN_TOKEN` are no longer used.
   The bundled ClamAV script is an alternative adapter and is not used by this flow.
4. Verify your sending domain in Resend. Set `RESEND_API_KEY`,
   `APPLICATION_FROM_EMAIL` (verified sender), and `APPLICATION_REPLY_TO`.
   Confirmation payloads are persisted with each application and sent via
   Resend's API with a stable idempotency key. No résumé is attached.
5. Set `RECRUITMENT_JOBS_SECRET` to a random secret. Configure your scheduler to
   **POST** `/api/internal/recruitment-jobs` every five minutes with
   `Authorization: Bearer <RECRUITMENT_JOBS_SECRET>`. Each run processes up to ten
   due emails and thirty orphan PDFs. Allow up to 300 seconds for this job.
   Immediate sending uses Next.js `after`; scheduled processing recovers if that
   work is interrupted. For a sustained large queue, schedule more frequently.
6. Ensure the hosting/proxy accepts multipart request bodies of at least 6 MB
   and supports a 90-second submission handler. Some serverless hosts impose a
   smaller body limit; choose an appropriate host or reduce the supported file
   size consistently before launch. The app enforces a bounded request stream.
   Deploy behind a proxy that overwrites untrusted `x-forwarded-for` headers.
7. Verify the complete flow using a test vacancy, test storage, a safe PDF and a
   test recipient. Then set `APPLICATIONS_ENABLED=true`. The public Proceed
   button enables only when this flag and all required configuration exist.

Owner previews remain available with `?preview=1` and never submit. Preview and
live drafts use separate session-storage keys. Successful submissions clear
local draft answers and display the saved registration number. The screen says
email is queued rather than claiming delivery. Email failures never remove an
application. The new privacy section describes application data and providers;
review program eligibility and your retention process before launch.

No application data or email has been sent to a real service during local tests.
An isolated PostgreSQL database was used to verify migrations, uniqueness,
confirmation persistence/retry/concurrent claims, private-store enforcement,
scanner rejection and orphan cleanup. External API calls were mocked.

### File and email operations

PDFs are checked for extension, reported MIME type, size, PDF header and EOF,
then scanned before private storage. Keys are randomly generated; original names
are metadata only. File records are created before uploads so interrupted and
failed requests remain discoverable. Unattached files older than 24 hours are
removed by the scheduled job. Attached résumés are preserved; applicant retention
and deletion controls belong to the admin management stage.

Emails have PENDING, SENT (accepted by Resend), or NEEDS_REVIEW states. A lease
prevents concurrent worker sends. Failed sends retry with backoff, up to six
attempts. Older ambiguous attempts stop for operator review before Resend's
24-hour idempotency window expires, rather than risking an automatic duplicate.
SENT is not a delivery receipt. Delivery/bounce webhooks and admin retry controls are implemented in stages 5–6.

Database integration test (use a disposable, migrated database only):

```sh
DATABASE_URL_POOLED="$TEST_DATABASE_URL" node --conditions=react-server --import tsx tests/application-db.test.ts
```

API references: [Vercel Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk)
[Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys),
and [ClamD protocol](https://docs.clamav.net/manual/Usage/ClamdProtocol.html).

## Stage 5: applicant management

Apply `202611220003_application_review` with `npm run db:deploy` before opening
applicant pages. It adds an application version and append-only activity records.
It preserves applications, résumés, confirmation jobs and existing project data.
This migration has been verified on an isolated PostgreSQL database; it has not
been applied to your configured database automatically.

Use **Applicants** in the private sidebar or **View applicants** under
Internships. The internship overview shows total submitted applications, new
applications, shortlisted applicants, email problems, vacancy state counts and
application totals per vacancy. Counts represent applications, not unique people:
a student may apply to more than one vacancy.

At `/aditya/internships/applications`, search by name, email or registration
number. Filter by vacancy, review status and submission date range. Date filters
include the full day in India Standard Time. Counts on this page match all the
selected filters. Lists contain 25 applications per page and preserve filters
while navigating. Started or abandoned questionnaires never appear as applicants.

Open an applicant to view:

- Answers, separate GitHub/LinkedIn/portfolio links, registration and submission.
- Embedded PDF preview, open-in-tab and download options. These use an
  authenticated server endpoint; storage credentials and public/signed object
  URLs are not sent to the browser. Each access rechecks the owner session and
  storage connectivity. A signed-out PDF request returns 401. PDFs are not cached.
  Native PDF viewing depends on browser support; downloading remains available.
- The immutable vacancy description attached to the original submission.
- Review status, confirmation queue/provider status, internal notes and activity.

Review statuses are New, Reviewing, Shortlisted, Interview, Selected, Rejected
and Withdrawn. The owner can move between any of these stages. Status changes
use optimistic concurrency checks and create history atomically. Internal notes
are append-only, so concurrent notes do not overwrite one another. Neither notes
nor status updates send emails to applicants.

Confirmation retries are available for unsent messages during the existing safe
retry window. A message being processed, already accepted by Resend, or older
than the safe window cannot be manually requeued through this action. Check older
or ambiguous messages in Resend first. The screen labels SENT as "Accepted by
email provider", not "Delivered". Stage 6 adds a separate verified delivery state.

Validation completed: unit tests for filtering, dates, safe profile links and
input validation; database integration checks for atomic history, concurrent
status updates/notes and retry restrictions; mocked private PDF reads and size
limits; local HTTP checks that signed-out details redirect, signed-out PDF access
returns 401, missing files return 404, and authenticated overview/list/detail pages
render. The HTTP server used a temporary source copy and isolated test database,
leaving the existing workspace dev server untouched. Browser PDF rendering has
not been visually tested.

Optional checks with a disposable migrated database only:

```sh
DATABASE_URL_POOLED="$TEST_DATABASE_URL" node --conditions=react-server --import tsx tests/applicant-review-db.test.ts
# Start a separate dev server connected to the same disposable database first.
TEST_APP_URL="http://localhost:3217" node --import tsx tests/applicant-http.test.ts
```

Storage download reference: [Vercel private storage](https://vercel.com/docs/vercel-blob/private-storage).

## Stage 6: delivery tracking, retention and launch verification

Apply `202611220004_recruitment_lifecycle` with `npm run db:deploy`. It adds
verified delivery-event metadata, retention settings, final-status timestamps
and retryable PDF-deletion markers. Existing finalised applications start their
retention clock at migration time. Automatic deletion defaults to **off**.

### Resend webhook setup

Create a Resend webhook targeting `https://YOUR_SITE/api/webhooks/resend` and
subscribe to `email.sent`, `email.delivery_delayed`, `email.delivered`,
`email.failed`, `email.suppressed`, `email.bounced` and `email.complained`.
Set `RESEND_WEBHOOK_SECRET` to the signing secret from that webhook configuration.
It is now required by the live-application configuration check.

The endpoint verifies the raw payload using Resend's SDK and Svix headers before
reading event data. Requests are bounded to 64 KB. Duplicate event IDs are
idempotent; unrelated event types are acknowledged without storage. Database
errors return 503 so Resend can retry. Only provider message ID, event ID/type and
timestamps are stored, never full webhook bodies, recipients or bounce text.
Events arriving before the send response are retained and reconciled by the send
worker and scheduled job. Delivery states are monotonic: late sent/delayed events
cannot overwrite a delivered/bounced/complained state. Event metadata expires
after 30 days; the final delivery state remains on the confirmation record.

The admin list and applicant detail page show queue and delivery state separately.
Bounced, failed, suppressed and complained messages contribute to email-problem
counts. The website does not resend messages automatically because of a bounce
or complaint.

### Retention and deletion

Open **Recruitment settings** at `/aditya/internships/settings` to see required
configuration presence, verify storage connectivity, view the last completed scheduled
run and queued PDF deletions, and manage retention. No secret values are shown.
Configuration presence is not a substitute for a real provider test.

The suggested retention period is 180 days, configurable from 30 to 730 days.
Only Selected, Rejected and Withdrawn applications are eligible. Their clock
starts at the most recent move into a final status; reopening into an active
review status clears it. Changing the retention period affects all finalised
records. Enabling automatic deletion requires an explicit acknowledgment in the
settings form. Existing active applications are preserved.

Individual deletion is available on an applicant's detail page. Enter its exact
registration number to confirm. The action checks the application version and
refuses deletion during an active confirmation-email send. It removes the
application, answers, notes, activity and confirmation payload immediately. The
PDF's identifying filename is scrubbed and its random object key is queued for
private storage deletion. Subsequent PDF access returns 404. Failed object
removal leaves a retryable record until the scheduled job succeeds.

The scheduled job now also reconciles pending delivery events and removes
expired, finalised applications when retention is enabled. Its file/email work
has a time budget to stay within the configured handler duration. Every successful
run records a generic completion event for the settings page. It still needs the
five-minute external scheduler configured in stage 4.

Deleting an application does not remove copies already in the recipient's email
inbox, provider email logs or infrastructure backups. Those follow the relevant
provider's retention/deletion process. No new deletion records retain applicant
names or email addresses.

### Verification completed

- Production webpack build succeeded in an isolated source copy. The project now
  uses Next.js's documented TypeScript compiler-API option with the installed
  TypeScript 5.9 compiler, resolving the prior CLI-output parsing failure. Run
  `npm run build -- --webpack` where Turbopack's worker port is sandbox-restricted.
  Type checking remains enabled.
- The unit suite passes. Optional integration tests are skipped by default and
  were run separately against a disposable migrated PostgreSQL database.
- Integration tests cover signed/invalid/replayed/out-of-order webhooks, early
  events, private data omission, stale or mismatched deletion requests, active
  email leases, file-deletion retry, opt-in retention and preservation of active
  and recent applicants.
- A production HTTP test completed live-mode submission, one-per-vacancy email
  checks, request-key receipt recovery, cross-origin rejection, protected PDF
  retrieval, confirmation queuing, signed delivery tracking and retention/file
  cleanup. All storage, scanner and Resend calls were replaced with test-only
  substitutes. No real emails were sent. These substitutes are outside the
  repository and must never be used in a deployment.

Browser interaction and native PDF rendering have not been visually verified.
Real domain email delivery, the deployed scanner, hosting upload/time limits,
backup restoration and the external schedule need verification in your own
service accounts before launch. Keep `APPLICATIONS_ENABLED=false` until then.

Webhook reference: [Resend signature verification](https://resend.com/docs/webhooks/verify-webhooks-requests).

## Published vacancy versus live applications

Publishing a vacancy makes its description public; it does not provision private
PDF storage, a scanner, or email services. With configuration incomplete, public
cards now say **View details** rather than offering an unusable **Apply Now**.
The public detail page says applications open soon.

If you are signed in to the admin workspace in the same browser/site, that same
detail page offers **Preview application** and shows which configuration is
missing. This opens the questionnaire in explicit preview mode. It does not save
an application, upload a PDF, send email or issue a registration number. Signed-out
visitors cannot use the owner preview. Closed and expired roles remain closed.

The internship overview, vacancy editor and recruitment settings now explain
this distinction. Real submission still requires the services and environment
settings in stage 4, the webhook setting in stage 6, and APPLICATIONS_ENABLED=true.
Readiness checks reject blank/whitespace-only configuration and share the same
rules across the page, dashboard and submission endpoint. Missing settings are
shown only to authenticated admins.

Regression checks include the signed-in normal details-to-preview path, signed-out
privacy and preview restrictions, closed vacancies, disabled submission, and the
publishing warning in the editor. HTTP checks used only a disposable database.
