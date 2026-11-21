import Link from "next/link";
import { session } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentSchema } from "@/lib/project-schema";
import { LoginForm } from "@/components/admin/Forms";
import { GlassScene } from "@/components/admin/GlassScene";
import { Shell } from "@/components/admin/Shell";
import { projectAction } from "./actions";
export const dynamic = "force-dynamic";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  if (!(await session()))
    return (
      <main className="adm-login">
        <section className="adm-glass">
          <p className="adm-eyebrow">ADITYA / PRIVATE WORKSPACE</p>
          <h1>
            Your work.
            <br />
            Beautifully managed.
          </h1>
          <p>Sign in to curate projects and publish your next chapter.</p>
          <LoginForm />
          {!process.env.DATABASE_URL && (
            <p>Connect PostgreSQL and run owner setup to enable sign in.</p>
          )}
        </section>
        <GlassScene />
      </main>
    );
  const { q = "", status = "" } = await searchParams;
  const all = await db.project.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  const settings = await db.siteSettings.findUnique({ where: { id: "site" } });
  const projects = all.filter(
    (p) =>
      (!status || p.status === status) &&
      JSON.stringify(p.draft).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Shell>
      <header className="adm-heading">
        <div>
          <p className="adm-eyebrow">YOUR CREATIVE CONTROL ROOM</p>
          <h1>Good work deserves a spotlight.</h1>
          <p>Shape your portfolio, one project at a time.</p>
        </div>
        <Link className="adm-primary" href="/aditya/projects/new">
          ＋ Add project
        </Link>
      </header>
      <div className="adm-banner adm-glass">
        <div>
          <h2>Everything you build, in one place.</h2>
          <p>Draft privately. Preview confidently. Publish when ready.</p>
        </div>
        <GlassScene />
      </div>
      <div className="adm-stats">
        {["PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
          <div className="adm-glass" key={s}>
            <span>{s.toLowerCase()}</span>
            <strong>{all.filter((p) => p.status === s).length}</strong>
          </div>
        ))}
      </div>
      <section id="projects" className="adm-glass">
        <h2>Projects</h2>
        <form className="adm-filter">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search projects"
            aria-label="Search projects"
          />
          <select
            name="status"
            defaultValue={status}
            aria-label="Project status"
          >
            <option value="">All statuses</option>
            {["PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button>Filter</button>
        </form>
        <div className="adm-projects">
          {projects.map((p) => {
            const c = contentSchema.parse(p.draft);
            return (
              <article key={p.id}>
                <div className="adm-monogram" style={{ color: c.accent }}>
                  {c.title.slice(0, 1)}
                </div>
                <div>
                  <Link href={`/aditya/projects/${p.id}`}>
                    <h3>{c.title}</h3>
                  </Link>
                  <p>
                    {c.category} · {p.status.toLowerCase()}
                    {settings?.featuredId === p.id ? " · Featured" : ""}
                  </p>
                  <small>
                    Updated{" "}
                    {p.updatedAt.toISOString().slice(0, 16).replace("T", " ")}{" "}
                    UTC
                  </small>
                </div>
                <div className="adm-row-actions">
                  <Link href={`/aditya/projects/${p.id}/preview`}>Preview</Link>
                  <Link href={`/aditya/projects/${p.id}`}>Edit</Link>
                  <form action={projectAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <select name="intent" aria-label={`Action for ${c.title}`}>
                      <option value="up">Move up</option>
                      <option value="down">Move down</option>
                      <option value="duplicate">Duplicate as draft</option>
                      {p.status === "PUBLISHED" && (
                        <>
                          <option value="feature">Feature</option>
                          <option value="unpublish">Unpublish</option>
                        </>
                      )}
                      {p.status === "ARCHIVED" ? (
                        <option value="restore">Restore draft</option>
                      ) : (
                        <option value="archive">Archive</option>
                      )}
                    </select>
                    <button>Apply</button>
                  </form>
                </div>
              </article>
            );
          })}
          {!projects.length && (
            <p>No projects yet. Add your first project to get started.</p>
          )}
        </div>
      </section>
    </Shell>
  );
}
