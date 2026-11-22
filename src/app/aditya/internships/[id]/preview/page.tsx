import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { vacancySchema } from "@/lib/vacancy-schema";
import { Shell } from "@/components/admin/Shell";
export default async function Preview({params}: {params: Promise<{id:string}>}) {
  await requireOwner();
  const {id} = await params;
  const vacancy = await db.vacancy.findUnique({where:{id}});
  if (!vacancy) notFound();
  const c = vacancySchema.parse(vacancy.draft);
  return <Shell><p>Private preview · Saved draft</p><Link href={`/aditya/internships/${id}`}>Back to editor</Link><article className="adm-glass vacancy-preview"><h1>{c.title}</h1><p>{c.summary}</p><p>{c.type} · {c.mode.replaceAll("_"," ")} {c.location && `· ${c.location}`}</p><p>{c.openings} opening(s) · {c.duration} · {c.hours}</p><p>{c.compensation === "UNPAID" ? "Unpaid" : c.stipend || "Compensation not entered"} · Start: {c.startDate || "Not entered"}</p><p>Deadline: {c.deadline || "Not entered"} (IST)</p>{([["Overview",c.overview],["Responsibilities",c.responsibilities],["Minimum qualification",c.qualifications],["Required skills",c.requiredSkills],["Preferred skills",c.preferredSkills],["Eligibility",c.eligibility],["Learning outcomes and benefits",c.benefits],["Selection process",c.selectionProcess]]).filter(([,v]) => v).map(([label,value]) => <section key={label}><h2>{label}</h2><p style={{whiteSpace:"pre-wrap"}}>{value}</p></section>)}<p>Application flow will be connected in the next implementation stage.</p></article></Shell>;
}
