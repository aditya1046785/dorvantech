import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductVisual } from "@/components/ProductVisual";
import { siteContent } from "@/content/site";

const projects = {
  "nirashray-foundation": {
    data: siteContent.work.nirashray,
    kind: "foundation" as const,
  },
  beats: { data: siteContent.work.beats, kind: "beats" as const },
  "ai-career-agent": {
    data: siteContent.work.careerAgent,
    kind: "career" as const,
  },
};
type Props = { params: Promise<{ slug: string }> };
function projectFor(slug: string) {
  if (!Object.hasOwn(projects, slug)) notFound();
  return projects[slug as keyof typeof projects];
}
export async function legacyMetadata({ params }: Props): Promise<Metadata> {
  const { data } = projectFor((await params).slug);
  return { title: `${data.name} | DORVANTECH`, description: data.description };
}
export default async function LegacyCase({ params }: Props) {
  const { data, kind } = projectFor((await params).slug);
  return (
    <>
      <Header />
      <main id="main">
        <section className="section-wrap case-hero">
          <Link href="/#work" className="text-link">
            Back to selected work
          </Link>
          <p className="eyebrow mt-10">DORVANTECH / SELECTED WORK</p>
          <h1 className="t-display">{data.name}</h1>
          <h2 className="t-h3">{data.positioning}</h2>
          <p className="t-lead mt-6">{data.description}</p>
          {data.url && (
            <a
              className="action action-secondary mt-7"
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit live project{" "}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          <ProductVisual kind={kind} />
        </section>
        <section className="section-wrap section-space !pt-8">
          <p className="eyebrow">THE SYSTEM BEHIND THE EXPERIENCE</p>
          <h2 className="mt-4">
            {kind === "foundation"
              ? "Connected from end to end."
              : "A clear path to a useful outcome."}
          </h2>
          {kind === "foundation" ? (
            <>
              <div className="case-feature-grid">
                {siteContent.work.nirashray.tabs.map((tab) => (
                  <div key={tab.id}>
                    <h3>{tab.label}</h3>
                    <p>{tab.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <h3 className="t-h3">
                  {siteContent.work.nirashray.strip.title}
                </h3>
                <p className="t-body mt-4">
                  {siteContent.work.nirashray.strip.caption}
                </p>
              </div>
            </>
          ) : (
            <ol className="case-flow">
              {("flowNodes" in data ? data.flowNodes : []).map((node, i) => (
                <li key={node}>
                  <span>STEP {i + 1}</span>
                  {node}
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="section-band">
          <div className="section-wrap section-space">
            <p className="eyebrow">YOUR BUSINESS, NEXT</p>
            <h2 className="mt-4">
              Have something in mind?
              <br />
              <span>Let’s build it together.</span>
            </h2>
            <Link href="/#contact" className="action action-primary mt-8">
              Discuss your project
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
