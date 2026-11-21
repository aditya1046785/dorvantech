import type { MetadataRoute } from "next";
import { publicProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dorvantech.in";
  const projects = await publicProjects();
  return [
    { url: base },
    ...(projects ?? []).map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
