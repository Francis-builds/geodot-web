import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { postFrontmatter, type PostFrontmatter } from "./blog-schema";

const DIR = (locale: string) =>
  path.join(process.cwd(), "content", "blog", locale);

export type Post = PostFrontmatter & {
  slug: string;
  body: string;
  readingMin: number;
};

export function getPostSlugs(locale: string): string[] {
  const dir = DIR(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPost(locale: string, slug: string): Post | null {
  const file = path.join(DIR(locale), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const fm = postFrontmatter.parse(data);
  const words = content.split(/\s+/).length;
  return {
    ...fm,
    slug,
    body: content,
    readingMin: Math.max(1, Math.round(words / 200)),
  };
}

export function getAllPosts(locale: string): Post[] {
  return getPostSlugs(locale)
    .map((s) => getPost(locale, s)!)
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
