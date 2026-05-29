import { z } from "zod";

export const postFrontmatter = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(), // ISO yyyy-mm-dd
  cover: z.string(), // /images/blog/<file>
  tags: z.array(z.string()).default([]),
  vertical: z.string().optional(),
  author: z.string().default("Geodot"),
});

export type PostFrontmatter = z.infer<typeof postFrontmatter>;
