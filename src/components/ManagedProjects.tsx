import Link from "next/link";
import { LegacyWork } from "./LegacyWork";
import { ProductVisual } from "./ProductVisual";
import { publicProjects } from "@/lib/projects";
import { selectHomepageProjects } from "@/lib/project-selection";
import { db } from "@/lib/db";
import type { ProjectContent } from "@/lib/project-schema";
export function CodeVisual({ content: c }: { content: ProjectContent }) {
  if (c.preset === "abstract" || c.preset === "network") {
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      x: 180 + Math.cos((i * Math.PI) / 4 + c.seed * 0.01) * 110,
      y: 135 + Math.sin((i * Math.PI) / 4 + c.seed * 0.01) * 85,
    }));
    return (
      <svg
        viewBox="0 0 360 270"
        role="img"
        aria-label={
          c.preset === "network"
            ? "Connected system illustration"
            : "Abstract geometric illustration"
        }
        style={{ width: "100%", minHeight: 260, background: "#EEF2FF" }}
      >
        <defs>
          <linearGradient id={`g-${c.seed}-${c.preset}`}>
            <stop stopColor={c.accent} />
            <stop offset="1" stopColor="#C4B5FD" />
          </linearGradient>
        </defs>
        {c.preset === "network"
          ? nodes.map((n, i) => (
              <g key={i}>
                <line
                  x1="180"
                  y1="135"
                  x2={n.x}
                  y2={n.y}
                  stroke={c.accent}
                  strokeWidth="2"
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={10 + (i % 3) * 3}
                  fill="#FFFFFF"
                  stroke={c.accent}
                  strokeWidth="2"
                />
              </g>
            ))
          : nodes
              .slice(0, 5)
              .map((n, i) => (
                <rect
                  key={i}
                  x={n.x - 35}
                  y={n.y - 35}
                  width="70"
                  height="70"
                  rx="15"
                  fill={`url(#g-${c.seed}-${c.preset})`}
                  opacity={0.35 + i * 0.12}
                  transform={`rotate(${i * 12} ${n.x} ${n.y})`}
                />
              ))}
        <circle cx="180" cy="135" r="25" fill={c.accent} />
      </svg>
    );
  }
  return (
    <div
      style={{
        borderTop: `3px solid ${c.accent}`,
        filter: `hue-rotate(${c.seed % 20}deg)`,
      }}
    >
      <ProductVisual
        kind={
          c.preset === "foundation" || c.preset === "beats"
            ? c.preset
            : "career"
        }
      />
    </div>
  );
}
export function CaseContent({ content: c }: { content: ProjectContent }) {
  return (
    <>
      <section className="section-wrap case-hero">
        <Link href="/#work" className="text-link">
          Back to selected work
        </Link>
        <p className="eyebrow mt-10">{c.category}</p>
        <h1 className="t-display">{c.title}</h1>
        <h2 className="t-h3">{c.positioning}</h2>
        <p className="t-lead mt-6">{c.summary}</p>
        <CodeVisual content={c} />
      </section>
      <section className="section-wrap section-space !pt-8">
        {[
          ["Overview", c.overview],
          ["The problem", c.problem],
          ["The solution", c.solution],
          ["Outcomes", c.outcomes],
        ].map(
          ([title, body]) =>
            body && (
              <div key={title} className="mt-8">
                <h2 className="t-h3">{title}</h2>
                <p className="t-body mt-4" style={{ whiteSpace: "pre-wrap" }}>
                  {body}
                </p>
              </div>
            ),
        )}
        {c.features.length > 0 && (
          <div className="mt-8">
            <h2 className="t-h3">Features</h2>
            <ul>
              {c.features.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {c.steps.length > 0 && (
          <ol className="case-flow mt-8">
            {c.steps.map((s, i) => (
              <li key={i}>
                <span>STEP {i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        )}
        <div className="hero-actions mt-8">
          {c.url && (
            <a
              className="action action-primary"
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit live project ↗
            </a>
          )}
          {c.repository && (
            <a
              className="action action-secondary"
              href={c.repository}
              target="_blank"
              rel="noopener noreferrer"
            >
              Repository ↗
            </a>
          )}
        </div>
      </section>
    </>
  );
}
export function ProjectCard({ project: p, large = false }: {
  project: NonNullable<Awaited<ReturnType<typeof publicProjects>>>[number];
  large?: boolean;
}) {
  return (
    <article key={p.id} className={large ? "featured-project" : "project-card"}>
      <Link href={`/work/${p.slug}`} aria-label={`Explore ${p.content.title}`}>
        <CodeVisual content={p.content} />
      </Link>
      <div className="project-copy">
        <span className="eyebrow">{p.content.category}</span>
        <h3>{p.content.title}</h3>
        <p>{p.content.summary}</p>
        <div className="tags">
          {p.content.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <Link className="text-link" href={`/work/${p.slug}`}>
          Explore the project
        </Link>
      </div>
    </article>
  );
}

export async function ManagedProjects() {
  const projects = await publicProjects();
  if (projects === null) return <LegacyWork />;
  const settings = await db.siteSettings.findUnique({ where: { id: "site" } });
  const { visible, featured } = selectHomepageProjects(projects, settings?.featuredId);
  if (!visible.length) return null;
  return (
    <section id="work" className="section-wrap section-space">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SELECTED WORK</p>
          <h2>
            Real problems.
            <br />
            <span>Working solutions.</span>
          </h2>
        </div>
        <p>
          Connected platforms, developer tools and applied AI. A closer look at
          what we build.
        </p>
      </div>
      {featured && <ProjectCard project={featured} large />}
      <div className="project-grid">
        {visible.filter((p) => p.id !== featured?.id).map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
      {projects.length > visible.length && (
        <div className="work-actions">
          <Link className="action" href="/work">View all projects</Link>
        </div>
      )}
    </section>
  );
}
