import { requireOwner } from "@/lib/auth";
import { Shell } from "@/components/admin/Shell";
import { ProjectForm } from "@/components/admin/Forms";
export default async function New() {
  await requireOwner();
  return (
    <Shell>
      <h1>Add a project</h1>
      <p>Start with the story. Save privately until you’re ready.</p>
      <ProjectForm />
    </Shell>
  );
}
