import LegacyCase, { legacyMetadata } from "@/components/LegacyCase";
import { notFound } from "next/navigation";
import { publicProjects } from "@/lib/projects";
import { CaseContent } from "@/components/ManagedProjects";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export const dynamic = "force-dynamic";
async function find(slug: string) {
  const p = (await publicProjects())?.find((p) => p.slug === slug);
  if (!p) notFound();
  return p;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!process.env.DATABASE_URL) return legacyMetadata({ params });
  const { content: c } = await find((await params).slug);
  return {
    title: `${c.seoTitle || c.title} | DORVANTECH`,
    description: c.seoDescription || c.summary,
  };
}
export default async function Case({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!process.env.DATABASE_URL) return <LegacyCase params={params} />;
  const p = await find((await params).slug);
  return (
    <>
      <Header />
      <main id="main">
        <CaseContent content={p.content} />
      </main>
      <Footer />
    </>
  );
}
