# geodot-web

Marketing site for [Geodot](https://geodot.app) — bilingual (ES default at `/`, EN at `/en`) marketing and content site for the Geodot logistics platform.

## Stack

- **Next.js 16** (App Router, React 19, RSC)
- **next-intl** — i18n with `localePrefix: "as-needed"` (ES at root, EN under `/en`)
- **Tailwind CSS 4** — design tokens from `geodot-design-system`
- **next/font** — Space Grotesk (display) + Hanken Grotesk (body), `display: swap`
- **MDX blog** via `next-mdx-remote` + `gray-matter` (`content/blog/{es,en}/*.mdx`)
- **Resend** — contact form delivery (server action)
- **zod** — frontmatter + contact form validation
- **TypeScript** (strict)

## Requirements

- **Node.js >= 20** (see `.nvmrc`). Run `nvm use` to match.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the real values
npm run dev                  # http://localhost:3000  (ES)  ·  /en (EN)
```

### Commands

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Start the dev server                             |
| `npm run build` | Production build (verifies every route prerender)|
| `npm start`     | Serve the production build                        |
| `npm run lint`  | ESLint                                            |
| `npm test`      | Unit tests (tsx test runner)                      |
| `npx tsc --noEmit` | Typecheck                                       |

## Environment variables

| Variable                | Required | Purpose                                                                                  |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`        | Yes (prod) | API key for [Resend](https://resend.com); the contact form no-ops without it.          |
| `CONTACT_TO`            | No       | Recipient for contact-form submissions. Default: `hola@geodot.app`.                      |
| `CONTACT_FROM`          | No       | Verified sender. Default: `Geodot Web <web@geodot.app>`.                                  |
| `NEXT_PUBLIC_SITE_URL`  | Yes (prod) | Canonical base URL for metadata, OpenGraph, `sitemap.xml`, and `robots.txt`.            |

**Base-URL resolution** (`lib/site.ts`): `NEXT_PUBLIC_SITE_URL` → `https://$VERCEL_URL` (auto on Vercel previews) → `https://geodot.app`. Set `NEXT_PUBLIC_SITE_URL` explicitly in production so OG/canonical URLs point at the real domain rather than a preview host.

`.env.local` and any `.env*` files are gitignored — never commit secrets. Use `.env.example` as the template.

## Deploy to Vercel

1. **Connect the repo** — In Vercel, "Add New… → Project" and import `geodot-web`. The framework preset (Next.js) and build command (`next build`) are auto-detected. Node 20 is pinned via `.nvmrc` + `engines`.
2. **Set environment variables** — Project → Settings → Environment Variables, for Production (and Preview if desired):
   - `NEXT_PUBLIC_SITE_URL=https://geodot.app`
   - `RESEND_API_KEY=<real key>`
   - `CONTACT_TO`, `CONTACT_FROM` (optional; defaults shown above)
   On Preview deployments you can leave `NEXT_PUBLIC_SITE_URL` unset — `VERCEL_URL` is used automatically.
3. **Deploy** — Push to the production branch (or click Deploy). Vercel builds and hosts the site.
4. **Point `geodot.app` DNS at Vercel** — Project → Settings → Domains, add `geodot.app` (and `www`), then create the DNS records Vercel shows at the domain registrar:
   - Apex `geodot.app` → `A` record `76.76.21.21` (or the value Vercel displays), and
   - `www.geodot.app` → `CNAME` `cname.vercel-dns.com`.
   Wait for DNS propagation; Vercel provisions the TLS certificate automatically.

## Project layout

- `app/[locale]/` — localized routes (home, plataforma, industrias, recursos, casos-exito, nosotros, contacto)
- `app/sitemap.ts`, `app/robots.ts` — SEO endpoints (base URL via `lib/site.ts`)
- `components/` — UI + section components (server by default; `"use client"` only where interactive)
- `content/blog/{es,en}/` — MDX blog posts
- `lib/` — data (`modules.ts`, `industries.ts`), blog reader, schemas, `site.ts`
- `messages/{es,en}.json` — translation namespaces
- `public/images/` — site imagery (served via `next/image`)
