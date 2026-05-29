# geodot-web v3 — Completion (mega-menu, industries index, footer, legal, contact)

> Continues v1/v2. Fixes the flat nav ("only 1 industry"), adds missing pages, completes the site. Same stack/visual language. Each group: implement → verify (`npx tsc --noEmit && npm run build`) → commit → push (per-group, so progress shows on Vercel).

**Gaps being closed:**
1. Nav is flat — "Industrias" hardcodes `/industrias/bebidas`; no dropdowns for the 4 modules or 6 industries.
2. No `/industrias` index page.
3. Footer links are minimal (not a full sitemap); no legal links.
4. No privacy/terms pages.
5. Contact page is a plain form (no cinematic hero / proof).

**Registries:** `lib/modules.ts` (4: wms, tms, paletizado, torre-control), `lib/industries.ts` (6: bebidas, alimentos, gobierno-residuos, 3pl, healthcare, recintos-fiscales). Each has `icon` + `messageKey` (+ `hero`). Menu labels: add a short `.name` to each `industries.<key>` namespace (mirroring `modules.<key>.name`).

---

## Group 1 — Mega-menu Nav (desktop dropdowns + mobile accordion)
**Files:** `components/Nav.tsx`, `components/NavMenu.tsx` (new), `messages/{es,en}.json` (nav submenu labels + industry `.name`s)

- Desktop: "Plataforma" and "Industrias" become hover/focus dropdown triggers opening a panel (glass, rounded-xl, shadow-lg) listing items from the MODULES/INDUSTRIES registries — each row: lucide `Icon`, name, one-line tagline, link to `/plataforma/<slug>` or `/industrias/<slug>`; a footer row "Ver todo / View all" → `/plataforma` and `/industrias`. Keep "Casos", "Recursos", "Nosotros" as plain links + the demo pill + LocaleSwitch.
- Accessible: keyboard (focus-within / Esc to close), `aria-expanded`, hover + focus open, click-outside close. Respect the existing scroll-aware glass/transparent behavior (dropdown panel is always light glass).
- Mobile drawer: "Plataforma" and "Industrias" become collapsible accordions listing all items; everything else as today.
- Add `nav.platformAll` ("Ver toda la plataforma"/"Explore the platform"), `nav.industriesAll` ("Ver todas las industrias"/"All industries"), and `industries.<key>.name` (short labels: Bebidas/Beverages, Alimentos y Lácteos/Food & Dairy, Gobierno y Residuos/Government & Waste, Logística 3PL/3PL Logistics, Salud y Farma/Healthcare & Pharma, Recintos Fiscales/Bonded Warehouses) + `.tagline` (one line each) in both locales.
- Verify: dropdowns list all 4 modules + 6 industries, links resolve, mobile accordions work, both locales.

## Group 2 — `/industrias` index page
**Files:** `app/[locale]/industrias/page.tsx` (new), `messages/{es,en}.json` (`industriesIndex` namespace), `app/sitemap.ts`

- Cinematic `Hero` (bgImage from catalog, e.g. `warehouse/almacen.jpg`) + intro.
- Reveal-stagger grid of all 6 industries: card per industry with `Icon`, name, tagline, a catalog image thumbnail (use each `INDUSTRIES[slug].hero`), `card-lift`, link to `/industrias/<slug>`. + `CTABanner`.
- `generateMetadata`. Add the index URL to `sitemap.ts` (both locales). Add `industriesIndex` namespace (eyebrow/title/titleAccent/subtitle + cta) in ES+EN.
- Verify: `/industrias` and `/en/industrias` render all 6 cards; links work.

## Group 3 — Footer full sitemap
**Files:** `components/Footer.tsx`, `messages/{es,en}.json` (footer columns)

- Expand to columns: **Plataforma** (4 modules + "Ver todo"), **Industrias** (6 + "Ver todas"), **Recursos** (blog, casos), **Empresa** (nosotros, contacto), + legal row (privacidad, términos) in the bottom bar. Pull module/industry names from registries + messages. Keep the navy dotgrid/glow treatment.
- Add the needed `footer.*` keys in both locales.
- Verify build + render both locales.

## Group 4 — Legal pages (privacy + terms)
**Files:** `app/[locale]/privacidad/page.tsx`, `app/[locale]/terminos/page.tsx` (new), `messages/{es,en}.json` (`legal` namespace), `app/sitemap.ts`, footer links

- Two simple, well-typeset legal pages (PageHeader + prose sections) with placeholder-but-real boilerplate (privacy: data collected via contact form + analytics, Resend processor, contact email; terms: standard SaaS marketing-site terms). Bilingual. Clearly generic/boilerplate — note in a comment they need legal review.
- Link from footer; add to sitemap.
- Verify both routes render in both locales.

## Group 5 — Contact page elevation
**Files:** `app/[locale]/contacto/page.tsx`, `messages/{es,en}.json` (contact extras)

- Replace the plain Section with a cinematic `Hero` (bgImage) + a two-column layout: left = value recap / "what happens next" (3 bullets) + a few proof metrics (generic, no client names); right = the existing `ContactForm` in an elevated card (`card-lift`, surface-raised). Keep the Resend action + zod + honeypot intact.
- Add the needed `contact.*` keys (sideTitle, steps[3], proof) in both locales.
- Verify form renders + validates in both locales.

## Group 6 — Verify + polish
- `npm run build && npm run lint`. Headless-Chrome screenshots: home with a dropdown open, `/industrias`, `/contacto`, footer — READ them to confirm quality. Fix defects. Confirm sitemap includes `/industrias`, `/privacidad`, `/terminos`. Commit + push.
