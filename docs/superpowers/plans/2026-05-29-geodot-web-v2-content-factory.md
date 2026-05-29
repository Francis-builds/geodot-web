# geodot-web v2 — Content Factory + Deploy + PSI (Plan Extension)

> Continues `2026-05-29-geodot-web.md` (Tasks 1–17, DONE). Same stack/conventions. Each task: implement exactly, verify (`npx tsc --noEmit && npm run build`), commit. Working dir: `/Users/fran/Documents/Geodot/geodot-web`.

**Goal:** Publish the content factory (MDX blog + vertical landing pages), wire real imagery from the asset catalog, make the repo Vercel-ready, and optimize for PageSpeed (mobile ≥90).

**Asset catalog:** `docs/asset-catalog.md`. **Content sources:** `content/*.md`, `presentaciones/content/*.md`, Recintos Fiscales ebook + Grupo Camili case, HIMEX, Megafarmacia. **Reuse images before generating.**

---

## Task 18: MDX blog infrastructure

**Files:** `lib/blog.ts`, `lib/blog-schema.ts`, `content/blog/es/`, `content/blog/en/`, `package.json` (deps)

- [ ] **Step 1: Install deps** — `npm install gray-matter next-mdx-remote`
- [ ] **Step 2: `lib/blog-schema.ts`** — zod frontmatter:

```ts
import { z } from "zod";
export const postFrontmatter = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),            // ISO yyyy-mm-dd
  cover: z.string(),           // /images/blog/<file>
  tags: z.array(z.string()).default([]),
  vertical: z.string().optional(),
  author: z.string().default("Geodot"),
});
export type PostFrontmatter = z.infer<typeof postFrontmatter>;
```

- [ ] **Step 3: `lib/blog.ts`** — read/parse posts per locale with `fs` + `gray-matter`, validate frontmatter, compute reading time, sort by date desc.

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { postFrontmatter, type PostFrontmatter } from "./blog-schema";

const DIR = (locale: string) => path.join(process.cwd(), "content", "blog", locale);

export type Post = PostFrontmatter & { slug: string; body: string; readingMin: number };

export function getPostSlugs(locale: string): string[] {
  const dir = DIR(locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

export function getPost(locale: string, slug: string): Post | null {
  const file = path.join(DIR(locale), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const fm = postFrontmatter.parse(data);
  const words = content.split(/\s+/).length;
  return { ...fm, slug, body: content, readingMin: Math.max(1, Math.round(words / 200)) };
}

export function getAllPosts(locale: string): Post[] {
  return getPostSlugs(locale).map((s) => getPost(locale, s)!).filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
```

- [ ] **Step 4: Create empty `content/blog/es/.gitkeep` and `content/blog/en/.gitkeep`.**
- [ ] **Step 5: Verify** `npx tsc --noEmit`. Commit: `feat: MDX blog infrastructure (gray-matter + frontmatter schema + reader)`.

---

## Task 19: Blog index + post pages

**Files:** `app/[locale]/recursos/page.tsx`, `app/[locale]/recursos/[slug]/page.tsx`, `components/blog/PostCard.tsx`, `components/blog/MdxContent.tsx`

- [ ] **Step 1: `components/blog/MdxContent.tsx`** — render MDX via `next-mdx-remote/rsc` `compileMDX`, with prose styling using design-system tokens (headings Space Grotesk, body Hanken, links teal-600). Map `img` to `next/image` where possible (fallback to plain img with loading="lazy").
- [ ] **Step 2: `components/blog/PostCard.tsx`** — card with cover (`next/image`, sized), title (heading-sm), excerpt, date + readingMin, tag chips. Links to `/recursos/<slug>`.
- [ ] **Step 3: `app/[locale]/recursos/page.tsx`** — Hero + grid of PostCards from `getAllPosts(locale)`; optional vertical filter (client). `generateMetadata`. If no posts, render an empty-state.
- [ ] **Step 4: `app/[locale]/recursos/[slug]/page.tsx`** — `generateStaticParams` over slugs × locales; render cover, title, meta row, MdxContent; per-post `generateMetadata` (title/excerpt/cover OG); CTABanner at end. 404 on missing slug.
- [ ] **Step 5: Add `recursos` to Nav + Footer + sitemap.ts** (and the `nav.recursos` key in both messages files: ES "Recursos", EN "Resources").
- [ ] **Step 6: Verify** build (will be empty until Task 20 posts). Commit: `feat: blog index + post pages (MDX rendering, cards)`.

---

## Task 20: Seed blog posts (ES + EN, with real covers)

**Files:** `content/blog/{es,en}/*.mdx`, covers copied into `public/images/blog/`

Author 4 real posts, each ES + EN, sourced from existing material. Pick covers from `docs/asset-catalog.md` and copy into `public/images/blog/`.

- [ ] **Step 1: Copy covers** from catalog sources into `public/images/blog/` (e.g. cold-chain, recintos, palletizing, routing). Use `cp` from the paths in the catalog (presentaciones/, himex/, ~/Documents/presentation-skills/PdfEbookGenerator/assets/images/geodot/).
- [ ] **Step 2: Write the 4 posts** (ES + EN, valid frontmatter):
  1. `cadena-de-frio-trazabilidad` — cold chain traceability (source: `presentaciones/content/cadena-de-frio.md`). cover: cold-chain image.
  2. `recintos-fiscales-vision-total` — recintos fiscales/aduanas visibility (source: Recintos Fiscales ebook + HIMEX/Camili). cover: recintos image.
  3. `etiqueta-zero-reetiquetado` — re-labeling pain (source: `presentaciones/etiqueta-zero-3pl/`). cover: etiqueta-zero image.
  4. `ruteo-inteligente-co2` — smart routing + CO₂ (source: home/sostenibilidad copy). cover: fleet image.
  Each: 400–700 words, real Geodot framing, internal links to relevant `/plataforma/<m>` and `/industrias/<i>`.
- [ ] **Step 3: Verify** build prerenders all post routes in both locales; `/recursos` lists 4 cards; covers load. Commit: `feat: seed 4 bilingual blog posts with covers`.

---

## Task 21: Vertical landing pages (Healthcare/Pharma, Recintos Fiscales)

**Files:** `lib/industries.ts` (extend), industry messages namespaces, nav/sitemap

The vertical system reuses the existing `/industrias/[industria]` template (Task 14). Add 2 high-value verticals with real content.

- [ ] **Step 1: Extend `INDUSTRY_SLUGS`/`INDUSTRIES`** with `healthcare` (icon "heart-pulse", key "healthcare") and `recintos-fiscales` (icon "container", key "recintosFiscales").
- [ ] **Step 2: Author namespaces** `industries.healthcare` and `industries.recintosFiscales` in `messages/es.json` + `en.json`, following the Task 14 structure (eyebrow/title/titleAccent/subtitle, problem.points+stats, modules.title, cases.items, cta). Sources: Megafarmacia + content-engine `verticals/healthcare/overview.md` for healthcare; Recintos Fiscales ebook + HIMEX + Grupo Camili for recintos-fiscales.
- [ ] **Step 3:** Add both to Nav "Industrias" menu (if listing) and to `sitemap.ts`.
- [ ] **Step 4: Verify** `/industrias/healthcare`, `/industrias/recintos-fiscales` + `/en/...` render with real copy; invalid slug still 404. Commit: `feat: Healthcare and Recintos Fiscales vertical pages (ES+EN)`.

---

## Task 22: Real imagery integration (reuse-first) + next/image

**Files:** `public/images/**`, Hero/CasesStrip/ModuleGrid/product+industry/vertical pages, `components/ui/Media.tsx`

- [ ] **Step 1:** Create `components/ui/Media.tsx` — a thin `next/image` wrapper (fill or sized, AVIF/WebP via Next defaults, `sizes`, `priority` only for above-the-fold hero, otherwise lazy).
- [ ] **Step 2:** Copy chosen assets from the catalog into `public/images/<category>/` (warehouse, cold-chain, fleet, torre, recintos, app-ui). Reference real files from the catalog; generate with `/banana` ONLY if a needed theme has no match (record any generated image in the catalog).
- [ ] **Step 3:** Wire real imagery into: Home hero visual + product/industry/vertical hero `visual` slots, and any card thumbnails. Replace empty visual props with `<Media .../>`. Keep brand duotone/overlay feel (navy/magenta) per DESIGN.md imagery guidance where appropriate.
- [ ] **Step 4: Verify** build; Playwright spot-check Home + 1 product + 1 vertical + 1 blog post in both locales — images render, no layout shift, no 404s. Commit: `feat: integrate real imagery via next/image (reuse-first)`.

---

## Task 23: Vercel-ready + env completeness

**Files:** `.nvmrc`, `package.json` (engines), `README.md`, `.env.example` (confirm), `app/[locale]/layout.tsx` (base URL via VERCEL_URL fallback)

- [ ] **Step 1:** Add `.nvmrc` (`20`) and `"engines": { "node": ">=20" }` to package.json.
- [ ] **Step 2:** Ensure `SITE_URL` resolution: `process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? "https://"+process.env.VERCEL_URL : "https://geodot.app")` in layout + sitemap + robots.
- [ ] **Step 3:** Write `README.md` with: stack, dev commands, env vars (RESEND_API_KEY, CONTACT_TO/FROM, NEXT_PUBLIC_SITE_URL), and a "Deploy to Vercel" section (connect repo, set env, point geodot.app DNS — the human steps).
- [ ] **Step 4:** Confirm `.env.example` complete and `.env*` gitignored. Verify build. Commit: `chore: Vercel-ready (engines, env resolution, README deploy guide)`.

---

## Task 24: PSI optimization + audit

**Files:** various (image priority/sizes, dynamic imports), `app/[locale]/layout.tsx`

- [ ] **Step 1:** Audit client JS: ensure only Nav drawer, LocaleSwitch, ContactForm, AnimatedCounter, blog filter are `"use client"`; everything else server components. Convert any stray client components.
- [ ] **Step 2:** Image hygiene: `priority` on the LCP hero image only; explicit `sizes`; lazy elsewhere; ensure no oversized originals (resize copies if a source is huge).
- [ ] **Step 3:** Fonts: confirm `next/font` with `display: swap` (done) and no render-blocking external font CSS.
- [ ] **Step 4:** Run a local Lighthouse if available: `npx --yes lighthouse http://localhost:3000/ --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/psi-home.json` (start `npm run build && npm start` first). If lighthouse can't run in env, document the manual PSI steps in README and verify structural best-practices instead. Capture scores.
- [ ] **Step 5: Verify** `npm run build` + record any PSI/Lighthouse scores. Commit: `perf: PSI optimization pass (image priority/sizes, client-JS audit)`.

---

## Final Verify (v2)

- [ ] Full Playwright walkthrough including `/recursos`, the 4 posts, and the 2 new verticals in ES + EN. `npm run build && npm run lint` pass. Report scores + evidence. Commit any fixes.
