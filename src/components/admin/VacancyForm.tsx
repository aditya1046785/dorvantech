"use client";
import { useActionState, useEffect, useRef } from "react";
import { saveVacancy, type VacancyResult } from "@/app/aditya/internships/actions";
import { emptyVacancy, type VacancyContent } from "@/lib/vacancy-schema";

type Record = { id: string; slug: string; version: number; status: string; published: boolean; content: VacancyContent };
const fields: { key: keyof VacancyContent; label: string; multiline?: boolean; hint?: string }[] = [
  {key:"title",label:"Position title"}, {key:"department",label:"Department"}, {key:"summary",label:"Short summary",multiline:true},
  {key:"location",label:"Location",hint:"Required for hybrid and on-site positions."}, {key:"openings",label:"Number of openings"},
  {key:"duration",label:"Duration",hint:"For example, 3 months."}, {key:"hours",label:"Expected commitment",hint:"For example, 20 hours per week."},
  {key:"startDate",label:"Start date",hint:"A date or Flexible start."}, {key:"stipend",label:"Stipend / salary",hint:"Include currency, amount or range, and payment frequency."},
  {key:"overview",label:"Program overview",multiline:true}, {key:"responsibilities",label:"Responsibilities",multiline:true},
  {key:"qualifications",label:"Minimum qualification",multiline:true}, {key:"requiredSkills",label:"Required skills",multiline:true},
  {key:"preferredSkills",label:"Preferred skills (optional)",multiline:true}, {key:"eligibility",label:"Eligible courses, years and other requirements",multiline:true},
  {key:"benefits",label:"Learning outcomes and benefits (optional)",multiline:true}, {key:"selectionProcess",label:"Selection process",multiline:true},
  {key:"deadline",label:"Application deadline",hint:"Applications close at the end of this day in India Standard Time."}, {key:"position",label:"Display order",hint:"Lower numbers appear first."},
];
export function VacancyForm({ vacancy }: { vacancy?: Record }) {
  const [state, action, pending] = useActionState(async (previous: VacancyResult, form: FormData) => {
    const result = await saveVacancy(previous, form);
    return { ...result, version: result.version ?? previous.version };
  }, { version: vacancy?.version ?? 1 });
  const dirty = useRef(false);
  useEffect(() => { if (state.success) dirty.current = false; }, [state]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const content = vacancy?.content ?? emptyVacancy;
  return <form action={action} className="adm-glass" onChange={() => { dirty.current = true; }}>
    <input type="hidden" name="id" value={vacancy?.id ?? ""}/>
    <input type="hidden" name="version" value={state.version ?? vacancy?.version ?? 1}/>
    <p>Save a draft with just a title and URL. Complete the description and deadline before publishing. Descriptions use plain text; line breaks are preserved.</p>
    <label>URL slug<input name="slug" defaultValue={vacancy?.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} readOnly={vacancy?.published} placeholder="frontend-development-intern"/></label>
    <label>Opportunity type<select name="type" defaultValue={content.type}><option value="INTERNSHIP">Internship</option><option value="JOB">Job</option></select></label>
    <label>Work mode<select name="mode" defaultValue={content.mode}><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ON_SITE">On-site</option></select></label>
    <label>Compensation<select name="compensation" defaultValue={content.compensation}><option value="PAID">Paid</option><option value="UNPAID">Unpaid</option></select></label>
    {fields.map(({key,label,multiline,hint}) => <label key={key}>{label}{multiline ? <textarea name={key} rows={5} defaultValue={String(content[key])} maxLength={key === "summary" ? 400 : 10000}/> : <input name={key} defaultValue={String(content[key])} required={key === "title"} type={key === "deadline" ? "date" : ["openings","position"].includes(key) ? "number" : "text"} min={key === "openings" ? 1 : 0} max={10000}/ >}{hint && <small>{hint}</small>}</label>)}
    <div aria-live="polite">{state.error && <p role="alert">{state.error}</p>}{state.success && <p>{state.success}</p>}</div>
    <div className="vacancy-actions">
      {vacancy?.status === "ARCHIVED" ? <button name="intent" value="restore" disabled={pending}>Restore as draft</button> : <>
      <button name="intent" value="save" disabled={pending}>Save draft</button>
      <button className="adm-primary" name="intent" value="publish" disabled={pending}>{vacancy?.status === "CLOSED" ? "Publish and reopen" : "Publish saved changes"}</button>
      {vacancy?.status === "PUBLISHED" && <button name="intent" value="close" disabled={pending}>Close applications</button>}
      {vacancy && <button name="intent" value="archive" disabled={pending}>Archive</button>}
      </>}
      {pending && <span role="status">Saving…</span>}
    </div>
  </form>;
}
