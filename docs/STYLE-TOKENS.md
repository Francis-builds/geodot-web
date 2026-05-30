# geodot-web — Reglas de estilo / tokens

Fuente de verdad: **`../geodot-design-system/`** (theme.css, variables.css, DESIGN.md).
Los tokens viven en el `@theme` de `app/[locale]/globals.css` y Tailwind genera las utilities. **Nunca** hex ni rgba sueltos en componentes — siempre desde el token.

## Color
- Ramps de marca como utilities: `teal-{50..900}`, `magenta-{50..900}`, `navy-{50..950}`, `periwinkle`, feedback (`success`/`warning`/`error`/`info`).
- Texto: `text-navy-900` (primary light) · `text-navy-600` (secondary) · `text-navy-400` (muted) · `text-white` (sobre oscuro) · `text-navy-200/300` (secondary sobre oscuro).
- Superficies: `bg-white` · `bg-navy-50` (subtle light) · `bg-navy-900/950` (dark) · `bg-navy-800` (raised dark).
- Bordes: `border-navy-100` (subtle) · `border-navy-200` (default).
- **Acento de marca en texto = SÓLIDO** (regla del DS: "accent word may use teal"). NO gradient text (teal↔magenta interpola por gris).
  - Sobre oscuro: `.text-accent` (teal-400).
  - Sobre claro: `.text-accent-strong` (teal-600, cumple contraste AA en large text).
- Gradientes (`--gradient-brand/magenta/midnight`) son SOLO para **superficies/fondos**, nunca para texto.

## Sombras (tokens, no rgba arbitrario)
`shadow-xs|sm|md|lg` (elevación) · `shadow-nav` (header) · `shadow-pop` (dropdown) · `shadow-ring-magenta` (glow de pin).

## Tipografía
`font-display` (Space Grotesk) para headings · `font-body` (Hanken Grotesk) para texto.
Escala: `text-display-2xl|xl|lg`, `text-heading-xl|lg|md|sm`, `text-body-lg|md|sm`, `text-caption`, `text-overline`.

## Utilities de marca (globals.css)
`bg-dotgrid` + `bg-dotgrid-fade` (textura) · `glow-teal` / `glow-magenta` (con `--gx/--gy`) · `glass` / `glass-dark` · `card-lift` · `eyebrow-dot` · `grain` · `animate-rise` / `animate-float`.

## Excepciones legítimas a "no hex"
`opengraph-image.tsx` (ImageResponse: no soporta Tailwind) e `icon.svg` (SVG): usan los hex canónicos de marca `#0E172D` / `#00A99D`. Si cambian los tokens, actualizar estos dos a mano.

## Regla práctica
Si vas a escribir un color/sombra en un componente: parar y usar el token. Si el token no existe, agregarlo al `@theme` de globals.css (sincronizado con el design system), no inline.
