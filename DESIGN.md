# Design

> Light-first editorial logistics. Clean white/near-white surfaces, confident navy text, crisp real-operation photography beside the copy (never behind it). Teal carries the brand, magenta marks action, navy grounds. The feeling: a serious, well-funded logistics company that shows its operation instead of describing it.

**Source of truth:** `../geodot-design-system/` (theme.css, variables.css, DESIGN.md) → tokens live in the Tailwind v4 `@theme` block of `app/[locale]/globals.css`. Never hex inline; if a token is missing, add it to `@theme`. Full rule set in `docs/STYLE-TOKENS.md`.

**Theme:** light-first (white / navy-50 surfaces). Navy (#0E172D) used only as deliberate punctuation: CTA banner, footer. No full-bleed dark heroes (deprecated — overlays made photos illegible).

## Color

Brand ramps (50–900) for teal, magenta, navy + periwinkle accent. The official secondary grays ARE steps of the navy ramp.

| Role | Token | Value |
|------|-------|-------|
| Brand primary (teal) | `teal-500` | `#00A99D` |
| Accessible teal text/CTA on light | `teal-600` | `#008C82` |
| Teal accent on dark | `teal-400` | `#1AB7A8` |
| Brand action (magenta) | `magenta-500` | `#D4145A` |
| Corporate navy / dark surface | `navy-900` | `#0E172D` |
| Subtle light surface | `navy-50` | `#F2F4F9` |
| Body text on light | `navy-900` / `navy-600` (secondary) | |
| Borders | `navy-100` (subtle) / `navy-200` (default) | |
| Feedback | success `#1FA971`, warning `#C8851A`, info `#2874FC` | |

**Rules:**
- **Brand accent in text = SOLID, never gradient.** teal↔magenta interpolates through muddy gray. Use `.text-accent` (teal-400, dark surfaces) / `.text-accent-strong` (teal-600, light surfaces, AA).
- Gradients (`--gradient-brand/magenta/midnight`) are for **surfaces/backgrounds only**, never text.
- Photos run clean (no darkening overlay). `Media` overlay defaults off.

## Typography

- **Display:** Space Grotesk (geometric grotesque) — headings, weights 300–700.
- **Body:** Hanken Grotesk (humanist grotesque) — body/UI, weights 300–800.
- Both via `next/font/google`, wired to `--font-display` / `--font-body`.
- Scale: `display-2xl` (72px) → `display-xl` (56) → `display-lg` (44) → `heading-xl/lg/md/sm` → `body-lg/md/sm` → `caption` → `overline`. Display uses negative tracking (-0.02em); floor at 400 body / 600 display (no ultra-light).
- `text-balance` on headings, `text-pretty` on prose.

## Components

- **Hero (light split):** navy headline + teal-strong accent word on white; clean photo beside it in a rounded `ring-1` container, no overlay. CTAs optional (pill primary magenta + ghost). Same `bgImage` prop renders the side photo.
- **Nav:** auto-solid glass, scroll-aware shadow (`shadow-nav`); real geodot logo (color on light / white over dark); mega-menu dropdowns for 4 modules + 6 industries; mobile drawer.
- **ModuleGrid:** bento (varied tile sizes), lucide icons, `card-lift` hover.
- **Section / SectionHeader:** tone base/subtle/dark; eyebrow with leading dot; solid teal accent.
- **JourneyScroll:** flagship pinned scroll section (GSAP ScrollTrigger + Lenis), photo cross-fade per supply-chain stage + "connect the points" progress rail. Reduced-motion → static stack.
- **Multimodal, ProblemStats, MetricsBand, CasesStrip, CTABanner, ContactForm, Footer** — all on light surfaces; CTABanner + Footer are the navy punctuation.

## Motion

Lenis (inertial smooth scroll) + GSAP ScrollTrigger, mounted via `components/SmoothScroll.tsx`. Reveals via `components/ui/Reveal.tsx` (motion/react). Ease-out-expo. **Every animation has a `prefers-reduced-motion` path** (Lenis/GSAP off, reveals static). transform/opacity + blur/mask only; no animating layout props.

## Layout

Centered 1200px container. Light (`white`) and subtle (`navy-50`) bands alternate; 96px section gap. Sticky glass nav. Cards used sparingly with `card-lift`; bento for modules, not identical grids.

## Surface texture (subtle)

Utilities in globals.css (legacy from the dark phase, now used lightly): `bg-dotgrid` + `bg-dotgrid-fade` (faint dot motif at ~4% opacity on light), `glow-teal`/`glow-magenta` (radial, used sparingly), `grain`. Shadows tokenized: `shadow-xs/sm/md/lg` + `shadow-nav/pop/ring-magenta`.
