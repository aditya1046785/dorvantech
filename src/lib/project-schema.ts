import { z } from "zod";
const link = z.union([
  z.literal(""),
  z.url().refine((s) => s.startsWith("https://"), "Use an HTTPS URL"),
]);
export const contentSchema = z.object({
  title: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(80),
  positioning: z.string().trim().max(160),
  summary: z.string().trim().min(1).max(240),
  overview: z.string().trim().min(1).max(12000),
  problem: z.string().max(12000),
  solution: z.string().max(12000),
  features: z.array(z.string().trim().min(1).max(300)).max(20),
  steps: z.array(z.string().trim().min(1).max(300)).max(20),
  outcomes: z.string().max(12000),
  tags: z.array(z.string().trim().min(1).max(40)).max(6),
  url: link,
  repository: link,
  preset: z.enum(["foundation", "beats", "career", "network", "abstract"]),
  accent: z.enum(["#3157D5", "#166534", "#92400E", "#7C3AED"]),
  seed: z.number().int().min(0).max(9999),
  seoTitle: z.string().max(60),
  seoDescription: z.string().max(160),
});
export type ProjectContent = z.infer<typeof contentSchema>;
export const emptyContent: ProjectContent = {
  title: "",
  category: "",
  positioning: "",
  summary: "",
  overview: "",
  problem: "",
  solution: "",
  features: [],
  steps: [],
  outcomes: "",
  tags: [],
  url: "",
  repository: "",
  preset: "abstract",
  accent: "#3157D5",
  seed: 1,
  seoTitle: "",
  seoDescription: "",
};
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
