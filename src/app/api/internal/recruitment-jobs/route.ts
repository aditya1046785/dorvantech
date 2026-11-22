import { timingSafeEqual } from "node:crypto";
import { runRecruitmentJobs } from "@/lib/recruitment-jobs";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  const expected = process.env.RECRUITMENT_JOBS_SECRET;
  const actual = request.headers.get("authorization") ?? "";
  const wanted = `Bearer ${expected}`;
  if (
    !expected ||
    Buffer.byteLength(actual) !== Buffer.byteLength(wanted) ||
    !timingSafeEqual(Buffer.from(actual), Buffer.from(wanted))
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await runRecruitmentJobs();
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
