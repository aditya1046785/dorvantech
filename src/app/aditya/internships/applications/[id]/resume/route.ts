import { session } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertResumeStorage, readResume } from "@/lib/resume-storage";
import { pdfContentValid } from "@/lib/application-submission";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
};
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await session()))
    return Response.json(
      { error: "Sign in to view this résumé." },
      { status: 401, headers: privateHeaders },
    );
  const { id } = await params;
  const applicant = await db.application.findUnique({
    where: { id },
    select: { resume: true, registration: true },
  });
  if (!applicant)
    return Response.json(
      { error: "Applicant not found." },
      { status: 404, headers: privateHeaders },
    );
  try {
    await assertResumeStorage();
    const bytes = await readResume(applicant.resume.objectKey);
    if (bytes.length !== applicant.resume.size || !pdfContentValid(bytes))
      throw Error("Résumé validation failed.");
    const download = new URL(request.url).searchParams.get("download") === "1";
    return new Response(bytes, {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.length),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="resume-${applicant.registration.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80)}.pdf"`,
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "The résumé could not be loaded. Please retry or check your storage configuration.",
      },
      { status: 503, headers: privateHeaders },
    );
  }
}
