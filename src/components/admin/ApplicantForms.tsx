"use client";
import { useActionState } from "react";
import {
  addApplicantNote,
  deleteApplicant,
  changeApplicantStatus,
  retryApplicantEmail,
  type ReviewResult,
} from "@/app/aditya/internships/applications/actions";
import { applicationStatuses, statusLabel } from "@/lib/applicant-schema";
function Result({ state }: { state: ReviewResult }) {
  return (
    <div aria-live="polite">
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p>{state.success}</p>}
    </div>
  );
}
export function ApplicantStatusForm({
  id,
  status,
  version,
}: {
  id: string;
  status: string;
  version: number;
}) {
  const [state, action, pending] = useActionState(
    async (previous: ReviewResult, form: FormData) => {
      const result = await changeApplicantStatus(previous, form);
      return { ...result, version: result.version ?? previous.version };
    },
    { version },
  );
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={state.version ?? version} />
      <label>
        Review status
        <select name="status" defaultValue={status} disabled={pending}>
          {applicationStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </label>
      <button className="adm-primary" disabled={pending}>
        {pending ? "Updating…" : "Update status"}
      </button>
      <Result state={state} />
    </form>
  );
}
export function ApplicantNoteForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(addApplicantNote, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor="applicant-note">
        Internal note
        <textarea
          id="applicant-note"
          name="body"
          rows={4}
          maxLength={4000}
          required
          disabled={pending}
        />
      </label>
      <p>
        Visible only in your dashboard. Avoid adding unnecessary sensitive
        information.
      </p>
      <button disabled={pending}>{pending ? "Saving…" : "Add note"}</button>
      <Result state={state} />
    </form>
  );
}
export function ApplicantEmailForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(retryApplicantEmail, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button disabled={pending}>
        {pending ? "Queuing…" : "Retry confirmation email"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function ApplicantDeleteForm({
  id,
  version,
  registration,
}: {
  id: string;
  version: number;
  registration: string;
}) {
  const [state, action, pending] = useActionState(deleteApplicant, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={version} />
      <p>
        Permanently remove this application, notes and confirmation records. The
        private résumé will be queued for deletion. This cannot be undone.
      </p>
      <label>
        Type {registration} to confirm
        <input
          name="registration"
          autoComplete="off"
          maxLength={100}
          required
          disabled={pending}
        />
      </label>
      <button disabled={pending}>
        {pending ? "Deleting…" : "Permanently delete application"}
      </button>
      <Result state={state} />
    </form>
  );
}
