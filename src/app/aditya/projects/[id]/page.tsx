import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentSchema } from "@/lib/project-schema";
import { Shell } from "@/components/admin/Shell";
import { ProjectForm } from "@/components/admin/Forms";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  const p = await db.project.findUnique({ where: { id } });
  if (!p) notFound();
  return (
    <Shell>
      <h1>Edit project</h1>
      <Link href={`/aditya/projects/${id}/preview`}>Preview saved draft ↗</Link>
      <ProjectForm
        project={{
          id: p.id,
          slug: p.slug,
          version: p.version,
          homepage: p.homepage,
          content: contentSchema.parse(p.draft),
          published: p.published !== null,
        }}
      />
    </Shell>
  );
}
