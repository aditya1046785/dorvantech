"use client";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  applicationQuestions,
  emptyAnswers,
  restoreApplicationDraft,
  resumeMetadataError,
  validateAnswer,
  validateApplicationAnswers,
  type ApplicationAnswers,
} from "@/lib/application-schema";

const subscribe = () => () => {};
export function ApplicationSession({
  slug,
  title,
  preview = true,
  revision = 0,
}: {
  slug: string;
  title: string;
  preview?: boolean;
  revision?: number;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return hydrated ? (
    <Session slug={slug} title={title} preview={preview} revision={revision} />
  ) : (
    <p role="status">Preparing your application…</p>
  );
}
function Session({
  slug,
  title,
  preview,
  revision,
}: {
  slug: string;
  title: string;
  preview: boolean;
  revision: number;
}) {
  const storageKey = `dorvantech:application-${preview ? "preview" : "live"}:v1:${slug}`;
  const [initial] = useState(() => {
    try {
      return {
        draft: restoreApplicationDraft(sessionStorage.getItem(storageKey)),
        available: true,
      };
    } catch {
      return { draft: null, available: false };
    }
  });
  const [answers, setAnswers] = useState<ApplicationAnswers>(
    initial.draft?.answers ?? { ...emptyAnswers },
  );
  const [step, setStep] = useState(initial.draft?.step ?? "name");
  const [requestKey, setRequestKey] = useState(
    initial.draft?.requestKey ?? crypto.randomUUID(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState("");
  const [error, setError] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [checking, setChecking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [storageFailed, setStorageFailed] = useState(!initial.available);
  const [restored, setRestored] = useState(Boolean(initial.draft));
  const heading = useRef<HTMLHeadingElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const checkSequence = useRef(0);
  const questions = applicationQuestions(answers);
  const steps = [...questions.map((q) => q.key), "resume", "review"];
  const index = Math.max(0, steps.indexOf(step));
  const question = questions.find((q) => q.key === step);
  useEffect(() => {
    if (registration) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          answers,
          step,
          requestKey,
        }),
      );
    } catch {
      /* Private browsing may disable session storage. */
    }
  }, [answers, step, storageKey, requestKey, registration]);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!registration && (resume || storageFailed)) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [resume, storageFailed, registration]);
  function go(next: string) {
    setStep(next);
    setError("");
  }
  function continueQuestion(event: FormEvent) {
    event.preventDefault();
    if (step === "review") {
      void submitApplication();
      return;
    }
    if (step === "resume") {
      if (!resume) {
        setError("Please choose your PDF résumé.");
        return;
      }
    } else if (question) {
      const message = validateAnswer(question.key, answers[question.key]);
      if (message) {
        setError(message);
        return;
      }
      setAnswers((previous) => ({
        ...previous,
        [question.key]: previous[question.key].trim(),
      }));
    }
    go(editing ? "review" : (steps[index + 1] ?? "review"));
    setEditing(false);
  }
  function skip() {
    if (!question?.optional) return;
    setAnswers((previous) => ({ ...previous, [question.key]: "" }));
    go(editing ? "review" : steps[index + 1]);
    setEditing(false);
  }
  async function chooseResume(file?: File) {
    const sequence = ++checkSequence.current;
    setError("");
    setResume(null);
    setChecking(false);
    if (!file) return;
    const metadataError = resumeMetadataError(file);
    if (metadataError) {
      setError(metadataError);
      return;
    }
    setChecking(true);
    try {
      const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      if (sequence !== checkSequence.current) return;
      if (String.fromCharCode(...header) !== "%PDF-") {
        setError(
          "This file does not appear to be a PDF. Please choose another file.",
        );
        return;
      }
      setResume(file);
    } catch {
      if (sequence === checkSequence.current)
        setError("We couldn’t read this file. Please select it again.");
    } finally {
      if (sequence === checkSequence.current) setChecking(false);
    }
  }
  function edit(key: string) {
    setEditing(true);
    go(key);
  }
  function clearDraft() {
    setRequestKey(crypto.randomUUID());
    checkSequence.current++;
    try {
      sessionStorage.removeItem(storageKey);
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
    setAnswers({ ...emptyAnswers });
    setResume(null);
    setConsent(false);
    setRestored(false);
    setEditing(false);
    setChecking(false);
    go("name");
  }
  async function submitApplication() {
    if (preview || submitting) return;
    const problems = validateApplicationAnswers(answers);
    if (problems.length) {
      edit(problems[0].key);
      setError(problems[0].error);
      return;
    }
    if (!resume) {
      edit("resume");
      setError("Please select your résumé again.");
      return;
    }
    if (!consent) {
      setError("Please confirm your details and recruitment acknowledgment.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = new FormData();
      body.set(
        "application",
        JSON.stringify({ slug, requestKey, revision, answers, consent }),
      );
      body.set("resume", resume);
      const response = await fetch("/api/applications", {
        method: "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok || typeof result.registration !== "string")
        throw Error(
          result.error ||
            "We couldn’t submit your application. Please try again.",
        );
      setRegistration(result.registration);
      setResume(null);
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        /* Receipt stays visible even if storage is unavailable. */
      }
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Unable to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  const issues = validateApplicationAnswers(answers);
  if (registration)
    return (
      <section className="application-question" role="status">
        <p className="eyebrow">APPLICATION RECEIVED</p>
        <h1>Thank you, {answers.name}.</h1>
        <p>Your application for {title} has been received.</p>
        <p className="application-receipt">
          Registration number: <strong>{registration}</strong>
        </p>
        <button
          type="button"
          className="action action-secondary"
          onClick={() => {
            void navigator.clipboard?.writeText(registration).catch(() => {});
          }}
        >
          Copy registration number
        </button>
        <p className="application-help">
          Your confirmation email is queued for {answers.email}. If you are
          selected for the next round, we will contact you using the details you
          provided.
        </p>
        <Link className="text-link" href="/careers">
          View other vacancies
        </Link>
      </section>
    );
  return (
    <div className="application-session">
      {preview && (
        <div className="application-preview-notice" role="note">
          <strong>Admin preview</strong> — answers stay in this browser tab. No
          application, résumé upload or email will be submitted.
        </div>
      )}
      <header className="application-top">
        <div>
          <p className="eyebrow">
            {preview ? "APPLICATION PREVIEW" : "YOUR APPLICATION"}
          </p>
          <p>{title}</p>
        </div>
        <Link href={`/careers/${slug}`}>Role details</Link>
      </header>
      <div className="application-progress">
        <span>
          {step === "review"
            ? "Review your answers"
            : `Question ${index + 1} of ${steps.length - 1}`}
        </span>
        <progress
          value={step === "review" ? steps.length - 1 : index}
          max={steps.length - 1}
          aria-label="Application progress"
        />
      </div>
      {restored && (
        <p className="application-help">
          Your draft was restored from this tab. Please reselect your résumé
          before completing the review.
        </p>
      )}
      <form onSubmit={continueQuestion} noValidate>
        <fieldset disabled={submitting} className="application-fieldset">
          <div className="application-question" key={step}>
            <h1 ref={heading} tabIndex={-1}>
              {step === "resume"
                ? "One last thing. Your résumé."
                : step === "review"
                  ? "Everything look right?"
                  : question?.title}
            </h1>
            {question && (
              <>
                {question.help && (
                  <p id="question-help" className="application-help">
                    {question.help}
                  </p>
                )}
                <label htmlFor="application-answer">
                  {question.label}
                  {question.optional ? " (optional)" : ""}
                </label>
                {question.type === "select" ? (
                  <select
                    id="application-answer"
                    value={answers[question.key]}
                    onChange={(e) => {
                      setAnswers({
                        ...answers,
                        educationStatus: e.target.value,
                        institution: "",
                        graduationYear: "",
                      });
                      setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    required={!question.optional}
                    aria-describedby={error ? "answer-error" : undefined}
                  >
                    <option value="">Choose your current status</option>
                    <option value="student">Currently studying</option>
                    <option value="graduate">Graduated</option>
                    <option value="other">Other / self-taught / working</option>
                  </select>
                ) : question.multiline ? (
                  <textarea
                    id="application-answer"
                    value={answers[question.key]}
                    onChange={(e) => {
                      setAnswers({
                        ...answers,
                        [question.key]: e.target.value,
                      });
                      setError("");
                    }}
                    rows={5}
                    maxLength={question.maxLength}
                    aria-invalid={Boolean(error)}
                    required={!question.optional}
                    aria-describedby={
                      `${question.help ? "question-help " : ""}${error ? "answer-error" : ""}`.trim() ||
                      undefined
                    }
                  />
                ) : (
                  <input
                    id="application-answer"
                    value={answers[question.key]}
                    onChange={(e) => {
                      setAnswers({
                        ...answers,
                        [question.key]: e.target.value,
                      });
                      setError("");
                    }}
                    type={
                      ["year", "hours"].includes(question.type ?? "")
                        ? "text"
                        : (question.type ?? "text")
                    }
                    inputMode={
                      ["year", "hours"].includes(question.type ?? "")
                        ? "numeric"
                        : undefined
                    }
                    autoComplete={question.autocomplete ?? "off"}
                    maxLength={question.maxLength}
                    aria-invalid={Boolean(error)}
                    required={!question.optional}
                    aria-describedby={
                      `${question.help ? "question-help " : ""}${error ? "answer-error" : ""}`.trim() ||
                      undefined
                    }
                  />
                )}
              </>
            )}
            {step === "resume" && (
              <>
                <p id="resume-help" className="application-help">
                  Choose a PDF, up to 5 MB.{" "}
                  {preview
                    ? "In this preview the file stays on your device."
                    : "Your résumé will be scanned and stored privately when you submit."}{" "}
                  After a refresh you’ll need to select it again.
                </p>
                <label htmlFor="application-resume">Your résumé (PDF)</label>
                <input
                  ref={fileInput}
                  id="application-resume"
                  required
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => void chooseResume(e.target.files?.[0])}
                  aria-describedby={`resume-help${error ? " answer-error" : ""}`}
                  aria-invalid={Boolean(error)}
                />
                {checking && <p role="status">Checking your file…</p>}
                {resume && (
                  <p role="status">
                    Selected: {resume.name} · {(resume.size / 1024).toFixed(0)}{" "}
                    KB
                  </p>
                )}
              </>
            )}
            {step === "review" && (
              <>
                <p className="application-help">
                  Review each answer. You can edit anything before submitting.
                </p>
                <dl className="application-review">
                  {questions.map((q) => (
                    <div key={q.key}>
                      <dt>{q.label}</dt>
                      <dd>
                        {answers[q.key]
                          ? q.key === "educationStatus"
                            ? ({
                                student: "Currently studying",
                                graduate: "Graduated",
                                other: "Other / self-taught / working",
                              }[answers[q.key]] ?? answers[q.key])
                            : answers[q.key]
                          : "Not provided"}
                      </dd>
                      <button
                        type="button"
                        onClick={() => edit(q.key)}
                        aria-label={`Edit ${q.label}`}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                  <div>
                    <dt>Résumé</dt>
                    <dd>{resume?.name ?? "Please select your résumé again"}</dd>
                    <button type="button" onClick={() => edit("resume")}>
                      Choose résumé
                    </button>
                  </div>
                </dl>
                {issues.length > 0 && (
                  <p role="alert">
                    Some answers need attention.{" "}
                    <button type="button" onClick={() => edit(issues[0].key)}>
                      Review the first missing or invalid answer
                    </button>
                  </p>
                )}
                <label className="application-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    I confirm that these details are accurate. I understand that
                    my application information will be used for recruitment.{" "}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read the privacy policy
                    </Link>
                    .
                  </span>
                </label>
                {preview && (
                  <p className="application-preview-notice">
                    Preview complete. Submission will be available after private
                    résumé storage and application saving are connected. No
                    registration number has been issued.
                  </p>
                )}
                <button
                  className="action action-primary"
                  type="submit"
                  disabled={
                    preview ||
                    submitting ||
                    !consent ||
                    !resume ||
                    issues.length > 0
                  }
                >
                  {submitting
                    ? "Submitting application…"
                    : "Submit application"}
                </button>
              </>
            )}
          </div>
          {error && (
            <p id="answer-error" className="application-error" role="alert">
              {error}
            </p>
          )}
          {step !== "review" && (
            <div className="application-controls">
              <button
                className="action action-primary"
                type="submit"
                disabled={checking}
              >
                Continue
              </button>
              {question?.optional && (
                <button
                  type="button"
                  className="application-skip"
                  onClick={skip}
                >
                  {["github", "linkedin", "portfolio"].includes(question.key)
                    ? "I don’t have one"
                    : "Skip for now"}
                </button>
              )}
              {(index > 0 || editing) && (
                <button
                  type="button"
                  className="application-back"
                  disabled={checking}
                  onClick={() => {
                    go(editing ? "review" : steps[index - 1]);
                    setEditing(false);
                  }}
                >
                  Back
                </button>
              )}
            </div>
          )}
        </fieldset>
      </form>
      <footer className="application-footer">
        <p>
          {storageFailed
            ? "Browser storage is unavailable. Answers will be lost on refresh."
            : "Draft answers stay in this tab for up to 24 hours."}{" "}
          Résumés are never stored in the browser draft.
        </p>
        <button type="button" onClick={clearDraft} disabled={submitting}>
          Clear answers and start again
        </button>
        {storageFailed && (
          <p role="status">
            Browser storage is unavailable. Close this tab to clear its session.
          </p>
        )}
      </footer>
    </div>
  );
}
