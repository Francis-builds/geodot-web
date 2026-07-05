# geodot-web · Reglas de estilo / tokens (DS v2 "Evolución sobria")

Fuente de verdad: **`../geodot-design-system/v2/`** (tokens.json, theme.css, DESIGN.md).
Los tokens viven en el `@theme` de `app/[locale]/globals.css` (idéntico a `v2/theme.css`) y Tailwind genera las utilities. **Nunca** hex ni rgba sueltos en componentes: siempre desde el token.

## Color

- Ramps de marca como utilities: `teal-{50..900}`, `magenta-{50..900}`, `navy-{50..950}`, feedback (`success` y `error`; `error` es alias de `magenta-500`). Sin periwinkle, sin warning/info, **sin gradientes**.
- **Roles de texto:**
  - Primario sobre claro: `text-navy-900`.
  - Secundario sobre claro: `text-navy-600` (único permitido; `text-navy-500` y `text-navy-700` como texto quedan **prohibidos**).
  - Muted sobre claro: `text-navy-400` (uso mínimo, cuidar contraste).
  - Sobre oscuro (navy-900): `text-white` primario, `text-navy-300` secundario (navy-400 no alcanza AA).
- **Teal = acento quirúrgico, ≤10% de la superficie** (palabra del hero, links, un dato por sección). Nunca fondo de sección. Por tamaño:
  - `.text-accent-strong` (teal-600, 4.14:1 sobre blanco): solo texto ≥18px o ≥14px bold.
  - `.text-accent-sm` (teal-700): acento en texto chico (<18px regular).
  - `.text-accent` (teal-400): acento sobre superficies oscuras.
  - `text-teal-500` como texto sobre claro: **prohibido** (2.93:1).
- **Magenta = solo CTA** (Button `primary`). Un CTA primario por viewport. Nada más lleva magenta.
- Superficies: `bg-white` · `bg-navy-50` (subtle) · `bg-navy-900` plano solo como puntuación (CTA banner, footer).
- Bordes: `border-navy-100` (subtle) · `border-navy-200` (default).
- `::selection`: navy-900 sobre teal-100.

## Tipografía

**Schibsted Grotesk** única familia variable vía `next/font/google` (`--font-display` y `--font-body` apuntan ambas a `--font-schibsted`).
Jerarquía por peso: display/headings **700–800** · body **400** · labels/UI **500**. Tracking -0.02em en display.
Escala: `text-display-2xl|xl|lg` (fluidos con `clamp()`) · `text-heading-xl|lg|md|sm` · `text-body-lg|md|sm` · `text-caption` · `text-overline`.

## Componentes

- **Card v2 (estilo único):** `border border-navy-100 rounded-xl`, sin sombra en reposo, `shadow-sm` en hover. `card-lift` fue eliminado.
- **Eyebrow:** opt-in, **máximo 1 por página y solo en el hero**. Las secciones no llevan eyebrow por default.
- **Botones:** `primary` = magenta (el único CTA), `secondary` = teal, `ghost` = teal-600 sobre claro.
- Touch targets interactivos ≥44×44px.

## Sombras (tokens, no rgba arbitrario)

`shadow-sm|md|lg` (elevación; sin xs) · `shadow-nav` (header) · `shadow-pop` (dropdown) · `shadow-ring-magenta` (ring de foco/pin).

## Utilities de marca (globals.css)

Vigentes: `.text-accent` / `.text-accent-strong` / `.text-accent-sm` · `.glass` (nav) · `.eyebrow-dot` (solo hero) · `radar-pulse` (CTABanner) · `word-in` / `word-out` (palabra rotativa del hero).
Eliminadas en v2 (no reintroducir): `bg-dotgrid(-fade)`, `glow-teal/magenta`, `grain`, `glass-dark`, `card-lift`, `animate-rise/float`, `--gradient-*`.

## Motion

Única animación de firma: la palabra rotativa del hero. El resto son reveals suaves. **Toda animación tiene rama `prefers-reduced-motion`.** Sin `transition-all`: transicionar transform/opacity/box-shadow/border-color explícitos.

## Excepciones legítimas a "no hex"

`opengraph-image.tsx` (ImageResponse no soporta Tailwind) e `icon.svg` (SVG): usan los hex canónicos de marca `#0E172D` / `#00A99D`. Si cambian los tokens, actualizar estos dos a mano.

## Regla práctica

Si vas a escribir un color/sombra en un componente: parar y usar el token. Si el token no existe, agregarlo al `@theme` de globals.css (sincronizado con `../geodot-design-system/v2/theme.css`), no inline.
