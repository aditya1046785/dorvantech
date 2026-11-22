import { publicVacancies } from "@/lib/vacancies";
import type { MetadataRoute } from "next";
import { publicProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dorvantech.in";
  const [projects, vacancies] = await Promise.all([publicProjects(), publicVacancies()]);
  return [
    { url: base },
    { url: `${base}/careers` },
    ...(vacancies ?? []).filter((v) => v.open).map((v) => ({url: `${base}/careers/${v.slug}`})),
    ...(projects ?? []).map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
