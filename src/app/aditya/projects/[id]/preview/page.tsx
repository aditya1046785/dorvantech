import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentSchema } from "@/lib/project-schema";
import { CaseContent } from "@/components/ManagedProjects";
import { Shell } from "@/components/admin/Shell";
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const p = await db.project.findUnique({ where: { id: (await params).id } });
  if (!p) notFound();
  return (
    <Shell>
      <p className="adm-eyebrow">PRIVATE PREVIEW · SAVED DRAFT</p>
      <div
        style={
          {
            background: "#080f1c",
            color: "#b0bdd1",
            borderRadius: 20,
            overflow: "hidden",
            "--navy": "#edf3fc",
          } as React.CSSProperties
        }
      >
        <CaseContent content={contentSchema.parse(p.draft)} />
      </div>
    </Shell>
  );
}
