import { PrismaClient } from "@prisma/client";
import { siteContent } from "../src/content/site";
import { contentSchema, emptyContent } from "../src/lib/project-schema";
async function main() {
  const db = new PrismaClient();
  try {
    const entries = [
      [
        "nirashray-foundation",
        siteContent.work.nirashray,
        "foundation",
        "WEBSITE + OPERATIONS PLATFORM",
      ],
      ["beats", siteContent.work.beats, "beats", "DEVELOPER TOOLS"],
      ["ai-career-agent", siteContent.work.careerAgent, "career", "APPLIED AI"],
    ] as const;
    for (let i = 0; i < entries.length; i++) {
      const [slug, c, preset, category] = entries[i];
      const content = {
        ...emptyContent,
        title: c.name,
        positioning: c.positioning,
        summary:
          c.description.length > 240
            ? c.description.slice(0, 236) + "…"
            : c.description,
        overview: c.description,
        url: c.url || "",
        category,
        preset,
        features:
          "tabs" in c ? c.tabs.map((t) => `${t.label}: ${t.description}`) : [],
        steps: "flowNodes" in c ? [...c.flowNodes] : [],
      };
      contentSchema.parse(content);
      const p = await db.project.upsert({
        where: { slug },
        create: {
          slug,
          draft: content,
          published: content,
          status: "PUBLISHED",
          position: i,
        },
        update: {},
      });
      if (i === 0)
        await db.siteSettings.upsert({
          where: { id: "site" },
          create: { featuredId: p.id },
          update: {},
        });
    }
    console.log("Existing projects seeded without overwriting edits.");
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
