"use client";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { login, saveProject, changePassword } from "@/app/aditya/actions";
import { emptyContent, type ProjectContent } from "@/lib/project-schema";
function Submit({
  children,
  name,
  value,
}: {
  children: React.ReactNode;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className="adm-primary"
      disabled={pending}
      name={name}
      value={value}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
export function LoginForm() {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action}>
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
      </label>
      <label>
        Authenticator or recovery code
        <input
          name="code"
          autoComplete="one-time-code"
          required
          maxLength={20}
        />
      </label>
      <p role="alert">{state.error}</p>
      <Submit>Sign in securely</Submit>
    </form>
  );
}
export function PasswordForm() {
  const [state, action] = useActionState(changePassword, {});
  return (
    <form action={action}>
      <label>
        Current password
        <input
          type="password"
          name="current"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        New password
        <input
          type="password"
          name="password"
          minLength={16}
          maxLength={256}
          autoComplete="new-password"
          required
        />
      </label>
      <p role="alert">{state.error}</p>
      <Submit>Change password and sign out</Submit>
    </form>
  );
}
export function ProjectForm({
  project,
}: {
  project?: {
    id: string;
    slug: string;
    version: number;
    homepage: boolean;
    content: ProjectContent;
    published: boolean;
  };
}) {
  const [state, action] = useActionState(saveProject, {});
  const dirty = useRef(false);
  const router = useRouter();
  useEffect(() => {
    if (state.success) {
      dirty.current = false;
      if (state.id && !project?.id)
        router.replace(`/aditya/projects/${state.id}`);
      else router.refresh();
    }
  }, [state, router, project?.id]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
  const c = project?.content ?? emptyContent;
  const text = (
    key: keyof ProjectContent,
    label: string,
    multi = false,
    required = false,
    max = 12000,
  ) => (
    <label key={key}>
      {label}
      {multi ? (
        <textarea
          name={key}
          defaultValue={
            Array.isArray(c[key])
              ? (c[key] as string[]).join("\n")
              : String(c[key])
          }
          rows={4}
          maxLength={max}
          required={required}
        />
      ) : (
        <input
          name={key}
          defaultValue={String(c[key])}
          maxLength={max}
          required={required}
        />
      )}
    </label>
  );
  return (
    <form
      action={action}
      onChange={() => {
        dirty.current = true;
      }}
      className="adm-editor"
    >
      <input type="hidden" name="id" value={project?.id ?? ""} />
      <input type="hidden" name="version" value={project?.version ?? 0} />
      <div className="adm-glass">
        <h2>Project identity</h2>
        {text("title", "Title", false, true, 80)}
        <label>
          URL slug
          <input
            name="slug"
            defaultValue={project?.slug}
            readOnly={project?.published}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={100}
          />
          <small>
            Lowercase words separated by hyphens. Locked after first
            publication.
          </small>
        </label>
        {text("category", "Category", false, true, 80)}
        {text("positioning", "Positioning line", false, false, 160)}
        {text("summary", "Homepage summary", true, true, 240)}
        {text("tags", "Tags — one per line, up to six", true)}
        <label className="adm-check">
          <input
            name="homepage"
            type="checkbox"
            defaultChecked={project?.homepage ?? true}
          />
          Show on homepage
        </label>
        <small>Eligible for one of 3 homepage spots. The featured project appears first, followed by project order. All published projects appear on the full portfolio page.</small>
      </div>
      <div className="adm-glass">
        <h2>Case study</h2>
        {text("overview", "Overview", true, true)}
        {text("problem", "The problem", true)}
        {text("solution", "The solution", true)}
        {text("features", "Features — one per line", true)}
        {text("steps", "Process steps — one per line", true)}
        {text("outcomes", "Outcomes", true)}
      </div>
      <div className="adm-glass">
        <h2>Links and search</h2>
        {text("url", "Live website — HTTPS")}
        {text("repository", "Repository — HTTPS")}
        {text("seoTitle", "SEO title", false, false, 60)}
        {text("seoDescription", "SEO description", true, false, 160)}
      </div>
      <div className="adm-glass">
        <h2>Procedural illustration</h2>
        <label>
          Visual preset
          <select name="preset" defaultValue={c.preset}>
            {["foundation", "beats", "career", "network", "abstract"].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Accent
          <select name="accent" defaultValue={c.accent}>
            {["#3157D5", "#166534", "#92400E", "#7C3AED"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Visual seed
          <input
            type="number"
            name="seed"
            defaultValue={c.seed}
            min={0}
            max={9999}
            required
          />
        </label>
        <p>Visuals are generated entirely from code.</p>
      </div>
      <div className="adm-save">
        <span>Changes remain private until published</span>
        <p role="alert">{state.error}</p>
        <p role="status">{state.success}</p>
        <Submit name="intent" value="save">
          Save draft
        </Submit>
        <Submit name="intent" value="publish">
          Publish changes
        </Submit>
      </div>
    </form>
  );
}
