import { applicationsEnabled } from "@/lib/recruitment-config";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { session } from "@/lib/auth";
import { publicVacancies } from "@/lib/vacancies";
import { ApplicationSession } from "@/components/ApplicationSession";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Application | DORVANTECH",
  robots: { index: false, follow: false },
};
export default async function Apply({
  params,
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vacancy = (await publicVacancies())?.find((v) => v.slug === slug);
  if (!vacancy) notFound();
  const live = applicationsEnabled();
  const preview = (await searchParams).preview === "1" || !live;
  const owner = preview ? await session() : null;
  if (!vacancy.open || (preview && !owner))
    return (
      <main id="main" className="section-wrap careers-page vacancy-detail">
        <div className="careers-heading">
          <h1>
            {vacancy.open
              ? "Applications open soon."
              : "Applications are closed."}
          </h1>
          <p>
            {vacancy.open
              ? "Online applications for this opportunity are being prepared. Please check back soon."
              : "This opportunity is no longer accepting applications."}
          </p>
        </div>
        <Link className="action action-secondary" href={`/careers/${slug}`}>
          Back to vacancy
        </Link>
      </main>
    );
  return (
    <main id="main" className="section-wrap application-page">
      <ApplicationSession
        slug={slug}
        title={vacancy.content.title}
        preview={preview}
        revision={vacancy.revision}
      />
    </main>
  );
}
