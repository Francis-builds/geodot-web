# geodot-web — Design Spec

**Date:** 2026-05-29
**Status:** Approved (pending spec review)
**Scope:** Bilingual (ES/EN) marketing site for Geodot, built on the Geodot Design System, mirroring the proven stack of vigialegal.mx / talen.to-web.

---

## 1. Goal

Build the public Geodot website: a polished, bilingual, conversion-oriented marketing site that lets three visitor types find their path — "tengo un problema", "necesito una herramienta", "soy de X industria" — and routes them to a demo request.

The site consumes the **Geodot Design System** (`../geodot-design-system/`): teal `#00A99D`, magenta `#D4145A`, navy `#0E172D`; Titillium Web (display) + Montserrat (body); full ramps, semantic tokens, light + dark.

## 2. Tech Stack (mirror vigialegal.mx)

- **Next.js** (App Router) + **TypeScript** (strict)
- **Tailwind v4** via `@tailwindcss/postcss`, brand tokens in `@theme` (from design system `theme.css`)
- **next-intl** for i18n (`[locale]` routing, `es` default + `en`)
- **next/font** for Titillium Web + Montserrat, exposed as CSS vars
- **motion** for animations (respecting `prefers-reduced-motion`)
- **resend** + **zod** for the contact/demo form (server action)

## 3. Content Strategy — Approach A (next-intl messages)

All copy lives in `messages/es.json` + `messages/en.json`, organized by page namespace (nested objects). Components read copy via `useTranslations`. Code and copy stay separated; both locales fully polished now.

**Copy sources (Spanish, to be translated to polished EN):**
- `content/*.md` — Home, Soluciones overview, WMS, TMS, Paletizado, Torre de Control, 4 industrias, Casos, Nosotros, Contacto.
- `presentaciones/content/*.md` — Cadena de Frío, Gestor Documental, Plant Sync/Turnos, Residuos Urbanos, Turnero CD (rich problem/stats/solution copy; feeds product pages + Plataforma module catalog).

Slugs: keep Spanish slugs in both locales for v1 (`/en/plataforma/wms`). Path localization can be added later.

## 4. Page Set (Fase 1 — ampliado)

Per locale (`/es` and `/en`):

| Route | Page | Primary source |
|-------|------|----------------|
| `/` | Home | `01-home.md` |
| `/plataforma` | Plataforma overview (module catalog) | `02-soluciones-overview.md` + all module MDs |
| `/plataforma/wms` | WMS | `02a-wms.md` |
| `/plataforma/tms` | TMS | `02b-tms.md` |
| `/plataforma/paletizado` | Paletizado | `02d-paletizado.md` |
| `/plataforma/torre-control` | Torre de Control | `02e-torre-control.md` |
| `/industrias/bebidas` | Bebidas y Embotelladores | `03a-bebidas-embotelladores.md` |
| `/industrias/alimentos` | Alimentos y Lácteos | `03b-alimentos-lacteos.md` |
| `/industrias/gobierno-residuos` | Gobierno y Residuos | `03c-gobierno-residuos.md` |
| `/industrias/3pl` | Operadores Logísticos (3PL) | `03d-logistica-3pl.md` |
| `/casos-exito` | Casos de éxito | `04-casos-exito.md` |
| `/nosotros` | Nosotros | `06-nosotros.md` |
| `/contacto` | Contacto / Demo | `07-contacto-demo.md` |

~13 pages × 2 locales. Product pages share one template; industry pages share another.

## 5. Project Structure

```
geodot-web/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # next/font, Nav, Footer, <html lang>, NextIntlClientProvider
│   │   ├── globals.css             # @theme Geodot + @layer base
│   │   ├── page.tsx                # Home
│   │   ├── plataforma/page.tsx
│   │   ├── plataforma/[modulo]/page.tsx   # generateStaticParams
│   │   ├── industrias/[industria]/page.tsx
│   │   ├── casos-exito/page.tsx
│   │   ├── nosotros/page.tsx
│   │   ├── contacto/page.tsx
│   │   ├── opengraph-image.tsx
│   │   └── not-found.tsx
│   └── actions/
│       └── contact.ts              # server action: zod validate + resend
├── components/
│   ├── Nav.tsx · Footer.tsx · LocaleSwitch.tsx
│   ├── Hero.tsx · ProblemStats.tsx · ModuleGrid.tsx · SolutionSteps.tsx
│   ├── MetricsBand.tsx · CasesStrip.tsx · CTABanner.tsx · ContactForm.tsx
│   ├── PageHeader.tsx · ui/Section.tsx · ui/AnimatedCounter.tsx
│   └── mockups/                    # product visuals / duotone photos
├── i18n/                           # next-intl request config + routing
├── messages/{es,en}.json
├── lib/                            # helpers (module/industry registries, metadata)
├── public/                         # logos, og images, favicons
├── proxy.ts                        # next-intl middleware
├── next.config.ts · postcss.config.mjs · tsconfig.json · package.json
└── docs/superpowers/specs/
```

## 6. Design System Integration

- `globals.css` imports `tailwindcss` and declares the Geodot `@theme` (teal/magenta/navy ramps, type scale, spacing, radius, shadow) — sourced from `geodot-design-system/theme.css`.
- Fonts via `next/font/google`: Titillium Web (300/600/700), Montserrat (300/400/500/600/700) → CSS vars `--font-display`, `--font-body` wired into `@theme`.
- `@layer base`: antialiasing, `prefers-reduced-motion` reset, `::selection` in teal, smooth scroll, default body `--font-body` / surface tokens.
- **Existing `ui/Section.tsx` is rewritten** to design-system tokens (currently uses non-brand `#0a0f1a` and a teal→cyan gradient). `ui/AnimatedCounter.tsx` is kept as-is (reusable, clean).
- Dark/light: marketing pages lead with light surfaces; hero and selected bands use the navy-forward dark treatment (`--surface-inverse`). No runtime theme toggle in v1.

## 7. Component Contracts (key)

- **Nav** — sticky, `--surface-base`; logo left; menu (Plataforma ▾, Industrias ▾, Casos, Nosotros); pill primary CTA "Agendar Demo"; `LocaleSwitch` (ES/EN). Mobile: drawer.
- **Hero** — props: `eyebrow?`, `title`, `titleAccent?`, `subtitle`, `primaryCta`, `secondaryCta?`, `variant: 'dark' | 'light'`. Dark variant = navy bg + radar/pin motif.
- **ProblemStats** — list of pain points + a stat table/grid (e.g. Home "fugas que no puedes ver").
- **ModuleGrid** — cards of platform modules (icon, name, one-liner), link to module pages. Reads from a `lib` module registry.
- **SolutionSteps** — numbered "Cómo funciona" steps with optional visuals.
- **MetricsBand** — KPI tiles using `AnimatedCounter` (e.g. "5-10% ahorro", "20% menos km").
- **CasesStrip** — client logos + case highlights.
- **CTABanner** — closing demo CTA.
- **ContactForm** — fields (nombre, empresa, email, teléfono, mensaje, industria select); client states loading/success/error; honeypot; calls `contact` server action.
- Product page template + industry page template compose these sections; copy via namespaced `useTranslations`.

## 8. Contact Form (Resend)

- `app/actions/contact.ts`: `"use server"`, validate payload with `zod`, send via `resend` (`RESEND_API_KEY` from `.env.local`), return typed `{ ok, error? }`.
- Honeypot field + basic rate-limit guard.
- Recipient + from address configurable via env (`CONTACT_TO`, `CONTACT_FROM`).
- `.env.example` documents required vars. Real keys never committed.

## 9. Git

The current `.git` is broken (macOS duplication artifacts `config 2` / `index 2`, missing `HEAD`/`refs`/`objects`) — no recoverable history. Re-init clean:
- `git init`, add `.gitignore` (node_modules, `.next`, `.env*`, `.DS_Store`, build artifacts).
- Initial commit includes existing `content/`, `content-engine/`, the design spec, and scaffolding as it lands.

## 10. Verification

- `npm run dev`; drive with Playwright through Home + one product + one industry + contacto in **both** ES and EN.
- Check golden path (nav → page → demo CTA → form submit success), responsive (mobile/desktop), locale switch, and form submission (success + validation error).
- `next build` + `next lint` pass. Report with observed evidence, not assertions.

## 11. Out of Scope (v1 core)

- "Soluciones por problema" pages (reducir-costos, etc.) — no copy yet; deferred.
- ROI calculator (Fase 3), per-country pages, competitor comparisons.
- Runtime light/dark theme toggle.
- Headless CMS — copy stays in next-intl JSON / MDX.

## 13. Scope v2 — Publishable goal (added 2026-05-29)

End goal: repo Vercel-ready, Resend-connectable, prod domain, **content factory published**, blog images, PSI-optimized. Adds these workstreams on top of the v1 core (same stack):

**A. Content factory → published (blog + vertical pages)**
- **Verticales:** landing pages por industria del `content-engine` (Tier-1: healthcare/pharma, field services, beverages/DSD; Tier-2: alimentos, 3PL, gobierno/residuos, recintos-fiscales/aduanas). Route: `/[locale]/industrias/[vertical]` (extends the existing industry template) or a dedicated `/verticales/[slug]`.
- **Blog/Recursos:** `/[locale]/recursos/[slug]` rendering **MDX** posts from `content/blog/{es,en}/*.mdx`. Post = frontmatter (title, date, excerpt, cover, tags, vertical) + body. Index page with cards + filtering by vertical.
- **Pipeline:** MDX via `@next/mdx` or `next-mdx-remote`; typed frontmatter (zod); static generation (`generateStaticParams`). Reading time + OG per post.
- **Content sources:** Recintos Fiscales ebook + Grupo Camili case, HIMEX CargoCam (AIFA), Megafarmacia/Mabe (pharma), Gruas Laguna, Makvig, FINSA — see `docs/asset-catalog.md`.

**B. Image library (reuse-first)**
- Reuse existing assets per `docs/asset-catalog.md`; copy chosen files into `public/images/<cat>/`. Generate with `/banana` only when no match.
- Serve all imagery via `next/image` (AVIF/WebP, responsive sizes, lazy) — feeds PSI.

**C. Deploy — Vercel-ready**
- `vercel.json` (if needed), `.nvmrc`/engines, env documented in `.env.example` (`RESEND_API_KEY`, `CONTACT_TO/FROM`, `NEXT_PUBLIC_SITE_URL`).
- Fran does: connect repo to Vercel, set env vars, point geodot.app DNS. Site reads domain from `NEXT_PUBLIC_SITE_URL` (fallback `VERCEL_URL`).

**D. PSI optimization (budget: mobile ≥90)**
- `next/image` everywhere; `next/font` (already, no layout shift); static/ISR rendering; minimal client JS (server components default; `"use client"` only for Nav drawer, LocaleSwitch, ContactForm, AnimatedCounter); preconnect/dns-prefetch as needed; defer non-critical motion; lighthouse/PSI check in verification.

**Build order:** finish v1 core foundation (plan Tasks 1–11, independent of v2) → v1 pages (12–15) → SEO (16) → then v2: MDX blog pipeline → vertical pages → image integration → Vercel/PSI pass. A v2 plan extension will be written before the v2 build tasks.

## 12. Build Sequencing (for the implementation plan)

1. Scaffold (Next.js + Tailwind v4 @theme + next-intl + fonts) → dev server runs, empty localized home.
2. Layout shell: Nav, Footer, LocaleSwitch, globals base.
3. Reusable sections + rewrite `Section` to tokens.
4. Home (full) — proves the molde.
5. Product template + 4 product pages.
6. Industry template + 4 industry pages.
7. Plataforma overview, Casos, Nosotros.
8. Contact form + Resend action.
9. ES + EN copy passes (polished both).
10. SEO/OG/metadata, verify, build.

## Resolved Decisions

- **Resend:** Fran has the `RESEND_API_KEY` and will configure `.env.local` himself. Build the action + `.env.example`; don't block on the key.
- **Client logos:** Do NOT add client logos yet (no Coca-Cola/Celema/Benito Juárez). `CasesStrip` ships without logo row for now — case copy + metrics only, logo slot left for later.
- **Deploy:** Vercel. Configure metadata/OG with a Vercel-friendly base URL (`NEXT_PUBLIC_SITE_URL` env, fallback to `VERCEL_URL`).
