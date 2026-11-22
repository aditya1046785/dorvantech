import { requireOwner } from "@/lib/auth";
import { Shell } from "@/components/admin/Shell";
import { VacancyForm } from "@/components/admin/VacancyForm";
export default async function NewVacancy() {
  await requireOwner();
  return <Shell><h1>Add a vacancy</h1><VacancyForm/></Shell>;
}
