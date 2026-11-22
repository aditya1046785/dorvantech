import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LegacyWork } from "@/components/LegacyWork";
import { ProjectCard } from "@/components/ManagedProjects";
import { publicProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Our work | DORVANTECH",
  description: "Explore our projects, from connected platforms and developer tools to applied AI.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage({ searchParams }: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const projects = await publicProjects();
  const { page: rawPage } = await searchParams;
  const requested = typeof rawPage === "string" && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const totalPages = Math.max(1, Math.ceil((projects?.length ?? 0) / 9));
  const page = Number.isSafeInteger(requested) ? Math.max(1, Math.min(requested, totalPages)) : 1;
  return (
    <>
      <Header />
      <main id="main" className="section-wrap work-page">
        <Link className="text-link" href="/#work">Back to home</Link>
        <header className="work-page-heading">
          <p className="eyebrow">OUR WORK</p>
          <h1>Explore what we build.</h1>
          <p>Connected platforms, developer tools and applied AI. Discover the ideas, challenges and solutions behind our projects.</p>
        </header>
        {projects === null ? <LegacyWork /> : projects.length ? (
          <>
            <div className="project-grid">
              {projects.slice((page - 1) * 9, page * 9).map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
            {totalPages > 1 && (
              <nav className="work-pagination" aria-label="Project pages">
                {page > 1 && <Link className="action action-secondary" href={page === 2 ? "/work" : `/work?page=${page - 1}`}>Previous</Link>}
                <span aria-live="polite">Page {page} of {totalPages}</span>
                {page < totalPages && <Link className="action action-secondary" href={`/work?page=${page + 1}`}>Next</Link>}
              </nav>
            )}
          </>
        ) : <p>New projects are on the way. Check back soon.</p>}
      </main>
      <Footer />
    </>
  );
}
