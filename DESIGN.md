# Design

> DS v2 "Evolución sobria": enterprise restraint (referencias: Stripe, Linear). Blanco dominante, texto navy con confianza, foto real de operación como único elemento cálido (al lado del copy, nunca detrás). Teal es acento quirúrgico, magenta marca la acción, navy ancla. La sensación: una empresa de logística seria que muestra su operación en vez de describirla.

**Source of truth:** `../geodot-design-system/v2/` (tokens.json, theme.css, DESIGN.md). Los tokens viven en el bloque Tailwind v4 `@theme` de `app/[locale]/globals.css`, idéntico a `v2/theme.css`. Nunca hex inline; si falta un token, se agrega al `@theme`. Reglas completas en `docs/STYLE-TOKENS.md`.

**Theme:** light-first (superficies white / navy-50). Navy-900 plano solo como puntuación deliberada: CTA banner y footer. Sin heros dark full-bleed, sin gradientes, sin glows, sin texturas.

## Color

Ramps de marca (50–900) para teal, magenta y navy. Los grises secundarios oficiales SON pasos del ramp navy. Feedback reducido a `success` y `error` (alias de magenta-500).

| Rol | Token | Valor |
|------|-------|-------|
| Marca primaria (teal) | `teal-500` | `#00A99D` |
| Teal como texto sobre claro (≥18px o ≥14px bold) | `teal-600` | `#008C82` |
| Teal como texto chico sobre claro | `teal-700` | `#006F67` |
| Acento teal sobre oscuro | `teal-400` | `#1AB7A8` |
| Acción de marca (magenta, solo CTA) | `magenta-500` | `#D4145A` |
| Navy corporativo / superficie oscura | `navy-900` | `#0E172D` |
| Superficie clara sutil | `navy-50` | `#F2F4F9` |
| Texto sobre claro | `navy-900` primario / `navy-600` secundario | |
| Texto secundario sobre oscuro | `navy-300` | |
| Bordes | `navy-100` (subtle) / `navy-200` (default) | |

**Reglas:**
- **Teal ≤10% de la superficie**: palabra del hero, links, un dato destacado por sección. Nunca fondo de sección.
- **Acento de marca en texto = SÓLIDO, nunca gradiente** (teal↔magenta interpola por gris sucio). `.text-accent` (teal-400, oscuro) / `.text-accent-strong` (teal-600, claro, solo large text) / `.text-accent-sm` (teal-700, texto chico). `text-teal-500` como texto sobre claro: prohibido.
- **Magenta solo en CTA** (Button primary). Un CTA primario por viewport.
- `text-navy-500` y `text-navy-700` como texto: prohibidos. Secundario = navy-600 (claro) / navy-300 (oscuro).
- Fotos limpias, sin overlay que las oscurezca.
- Cero hex inline en TSX (excepciones: `opengraph-image.tsx`, `icon.svg`).

## Typography

- **Schibsted Grotesk** única familia variable (eje 400–900) vía `next/font/google`, subset latin, `display: swap`. Un solo archivo de font.
- `--font-display` y `--font-body` apuntan ambas a Schibsted (consolidación transparente para los tokens).
- Jerarquía por peso: display/headings **700–800**, body **400**, labels/UI **500**. Tracking -0.02em en display.
- Escala: `display-2xl` → `display-xl` → `display-lg` (los tres fluidos con `clamp()`) → `heading-xl/lg/md/sm` → `body-lg/md/sm` → `caption` → `overline`.
- `text-balance` en headings, `text-pretty` en prosa.

## Components

- **Hero (split light):** titular navy con **palabra rotativa en teal-600 sólido** (camiones → barcos → containers → aviones → vagones), rotación ~2.2s con translateY+fade; ancho reservado al término más largo (sin layout shift); `prefers-reduced-motion` fija la palabra. Foto real al costado en container `ring-1` sin overlay. CTA primario magenta + ghost. Es la única animación de firma del sitio.
- **Nav:** glass auto-sólido, sombra scroll-aware (`shadow-nav`); mega-menú con focus visible real (anillo); drawer móvil con `overflow-y-auto`, cierre con Escape, `inert` cerrado, `aria-controls`; hamburguesa ≥44px; skip link antes del nav.
- **Section / SectionHeader:** tonos base/subtle/dark; align left por default; sin eyebrow por default (opt-in, máximo 1 por página, en el hero).
- **Cards (estilo único v2):** `border navy-100, rounded-xl`, sin sombra en reposo, `shadow-sm` en hover. Sin `card-lift`.
- **ModuleGrid:** bento (tiles de tamaño variado), lucide icons, server component con `Reveal` cliente.
- **Integraciones:** grid bento de tiles variados (mismo patrón que ModuleGrid). **Partners:** lista editorial (filas tipográficas, no cards).
- **MetricsBand:** línea editorial: un dato grande + frase de contexto; el dato rota según la página.
- **JourneyScroll:** pinned scroll (GSAP ScrollTrigger + Lenis) solo en `md+`; en móvil, stack vertical estático con fotos visibles. Reduced-motion → stack estático.
- **ContactForm:** labels visibles asociados, `aria-live` en error/éxito, `aria-invalid` + `aria-describedby`, required indicado; honeypot.
- **CTABanner / Footer:** navy-900 plano (la puntuación oscura del sitio); acento sobre oscuro unificado en teal-400.
- Touch targets ≥44×44px en todos los interactivos (LocaleSwitch, píldoras de FAQ incluidos).

## Motion

Lenis (smooth scroll inercial) + GSAP ScrollTrigger, montados vía `components/SmoothScroll.tsx`. Reveals vía `components/ui/Reveal.tsx` (motion/react), ease-out-expo. La palabra rotativa del hero es la única animación de firma; el resto son reveals suaves. **Toda animación tiene rama `prefers-reduced-motion`** (Lenis/GSAP off, reveals estáticos, counter en valor final). Solo transform/opacity (+ box-shadow/border-color en hovers); sin `transition-all`, sin animar props de layout.

## Layout

Container centrado de 1200px. Bandas claras (`white`) y sutiles (`navy-50`) alternadas; gap de sección de 96px. Nav glass sticky. Cards con moderación (estilo único v2); bento para módulos e integraciones, no grids idénticos. Sombras tokenizadas: `shadow-sm/md/lg` + `shadow-nav/pop/ring-magenta`.
