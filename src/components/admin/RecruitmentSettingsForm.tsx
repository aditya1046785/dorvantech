"use client";
import { useActionState, useState } from "react";
import {
  checkPrivateStorage,
  saveRetention,
} from "@/app/aditya/internships/settings/actions";
import type { ReviewResult } from "@/app/aditya/internships/applications/actions";
export function RecruitmentSettingsForm({
  days,
  enabled,
  version,
}: {
  days: number;
  enabled: boolean;
  version: number;
}) {
  const [auto, setAuto] = useState(enabled);
  const [state, action, pending] = useActionState(
    async (previous: ReviewResult, form: FormData) => {
      const result = await saveRetention(previous, form);
      return { ...result, version: result.version ?? previous.version };
    },
    { version },
  );
  return (
    <form action={action}>
      <input type="hidden" name="version" value={state.version ?? version} />
      <label>
        Retention period in days
        <input
          name="retentionDays"
          type="number"
          min={30}
          max={730}
          defaultValue={days}
          required
        />
      </label>
      <label className="recruitment-checkbox">
        <input
          type="checkbox"
          name="autoDelete"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
        />
        <span>
          Automatically delete finalised applications after this period.
        </span>
      </label>
      <p>
        Applies to Selected, Rejected and Withdrawn applications, measured from
        their most recent final status change. Changing the period affects all
        finalised applications. Applications still being reviewed are preserved.
      </p>
      {auto && (
        <label className="recruitment-checkbox">
          <input type="checkbox" name="acknowledged" required />
          <span>
            I understand that the next scheduled run will permanently remove
            finalised applications older than this period, including notes,
            confirmation records and résumés.
          </span>
        </label>
      )}
      <button className="adm-primary" disabled={pending}>
        {pending ? "Saving…" : "Save retention settings"}
      </button>
      <div aria-live="polite">
        {state.error && <p role="alert">{state.error}</p>}
        {state.success && <p>{state.success}</p>}
      </div>
    </form>
  );
}
export function StorageCheckForm() {
  const [state, action, pending] = useActionState(checkPrivateStorage, {});
  return (
    <form action={action}>
      <button disabled={pending}>
        {pending ? "Checking…" : "Verify private storage"}
      </button>
      <div aria-live="polite">
        {state.error && <p role="alert">{state.error}</p>}
        {state.success && <p>{state.success}</p>}
      </div>
    </form>
  );
}
