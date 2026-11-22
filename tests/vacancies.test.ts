import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyVacancy, publicationErrors, vacancyExpired, vacancySchema, vacancySlugSchema } from "../src/lib/vacancy-schema";

test("a minimal draft is valid but cannot be published", () => {
  const draft = {...emptyVacancy,title:"Frontend intern"};
  assert.equal(vacancySchema.safeParse(draft).success,true);
  assert.ok(publicationErrors(draft).length > 0);
});
test("paid roles require explicit compensation and on-site roles require a location", () => {
  const complete = {...emptyVacancy,title:"Frontend intern",summary:"Build useful things",duration:"3 months",hours:"20 hours/week",startDate:"Flexible",overview:"Program",responsibilities:"Build",qualifications:"Undergraduate",requiredSkills:"JavaScript",eligibility:"Final year",selectionProcess:"Interview",deadline:"2099-01-01",stipend:"INR 10,000 / month"};
  assert.deepEqual(publicationErrors(complete),[]);
  assert.ok(publicationErrors({...complete,stipend:""}).length);
  assert.ok(publicationErrors({...complete,mode:"ON_SITE"}).length);
  assert.deepEqual(publicationErrors({...complete,compensation:"UNPAID",stipend:""}),[]);
});
test("deadline includes the entire stated day in IST", () => {
  assert.equal(vacancyExpired({deadline:"2026-12-01"},new Date("2026-12-01T18:29:59.999Z")),false);
  assert.equal(vacancyExpired({deadline:"2026-12-01"},new Date("2026-12-01T18:30:00Z")),true);
});
test("rejects malformed dates, counts, oversized descriptions and unsafe slugs", () => {
  for (const patch of [{deadline:"2026-02-30"},{openings:0},{position:-1},{overview:"x".repeat(10001)}]) {
    assert.equal(vacancySchema.safeParse({...emptyVacancy,title:"Intern",...patch}).success,false);
  }
  assert.equal(vacancySlugSchema.safeParse("../admin").success,false);
  assert.equal(vacancySlugSchema.safeParse("frontend-intern").success,true);
});

test("public vacancies hide drafts and archives and use published snapshots only", async () => {
  const { publishedVacancies } = await import("../src/lib/vacancy-public");
  const content = {...emptyVacancy,title:"Published title",deadline:"2099-01-01"};
  const rows = [
    {slug:"draft",status:"DRAFT",published:content},
    {slug:"archived",status:"ARCHIVED",published:content},
    {slug:"unpublished",status:"PUBLISHED",published:null},
    {slug:"invalid",status:"PUBLISHED",published:{title:"Broken"}},
    {slug:"live",status:"PUBLISHED",published:content,draft:{...content,title:"Private title"}},
    {slug:"closed",status:"CLOSED",published:content},
    {slug:"expired",status:"PUBLISHED",published:{...content,deadline:"2020-01-01"}},
  ];
  const publicRows = publishedVacancies(rows);
  assert.deepEqual(publicRows.map((v)=>v.slug).sort(),["closed","expired","live"]);
  assert.deepEqual(publicRows.filter((v)=>v.open).map((v)=>v.slug),["live"]);
  assert.equal(publicRows.find((v)=>v.slug === "live")?.content.title,"Published title");
  assert.equal(JSON.stringify(publicRows).includes("Private title"),false);
});
test("public ordering uses published position and date labels are timezone-stable", async () => {
  const { publishedVacancies, deadlineLabel, workMode } = await import("../src/lib/vacancy-public");
  const rows = publishedVacancies([
    {slug:"later",status:"PUBLISHED",published:{...emptyVacancy,title:"Later",position:2}},
    {slug:"first",status:"PUBLISHED",published:{...emptyVacancy,title:"First",position:1}},
  ]);
  assert.deepEqual(rows.map((v)=>v.slug),["first","later"]);
  assert.equal(deadlineLabel("2026-12-01"),"1 December 2026");
  assert.equal(workMode("ON_SITE"),"On-site");
});
