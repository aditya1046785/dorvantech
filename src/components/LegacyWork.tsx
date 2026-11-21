import Link from "next/link";
import { ProductVisual } from "./ProductVisual";
import { siteContent } from "@/content/site";
export function LegacyWork() {
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
      <article className="featured-project">
        <Link
          className="project-illustration-link"
          href="/work/nirashray-foundation"
          aria-label="Explore the Nirashray Foundation project"
        >
          <ProductVisual />
        </Link>
        <div className="project-copy">
          <span className="eyebrow">WEBSITE + OPERATIONS PLATFORM</span>
          <h3>Nirashray Foundation</h3>
          <p>
            A public website and the platform behind it. Content, members,
            payments and administration, working as one.
          </p>
          <div className="tags">
            <span>Custom CMS</span>
            <span>Member portal</span>
            <span>Payments</span>
          </div>
          <Link href="/work/nirashray-foundation" className="text-link">
            Explore the project
          </Link>
        </div>
      </article>
      <div className="project-grid">
        {[
          {
            ...siteContent.work.beats,
            slug: "beats",
            kind: "beats" as const,
            label: "DEVELOPER TOOLS",
          },
          {
            ...siteContent.work.careerAgent,
            slug: "ai-career-agent",
            kind: "career" as const,
            label: "APPLIED AI",
          },
        ].map((project) => (
          <article className="project-card" key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              aria-label={`Explore ${project.name}`}
            >
              <ProductVisual kind={project.kind} />
            </Link>
            <div className="project-copy">
              <span className="eyebrow">{project.label}</span>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <Link className="text-link" href={`/work/${project.slug}`}>
                Explore the project
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
