# Design System v2 — "Evolución sobria" + fixes del audit

**Fecha:** 2026-07-05 · **Estado:** aprobado en brainstorming, pendiente de plan de implementación
**Alcance:** geodot-web + geodot-design-system. El logo NO se toca. Piezas externas (PDFs, presentaciones) fuera de alcance.

## Objetivo

Modernizar el sistema de diseño a un lane **enterprise restraint** (referencias: Stripe, Linear) manteniendo los colores de marca del logo (teal/navy/magenta), y aplicar los 38 hallazgos del audit impeccable (2026-07-04). Criterio de éxito: re-audit impeccable **≥17/20** (baseline 13/20) y Lighthouse accesibilidad **≥95** en home y contacto.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Alcance de marca | Evolución sobria: mismos colores de logo, uso disciplinado; sin rebrand |
| Lane estético | Enterprise restraint (Stripe/Linear): blanco dominante, foto real como único elemento cálido |
| Tipografía | **Schibsted Grotesk** única familia variable (reemplaza Space Grotesk + Hanken Grotesk) |
| Fixes del audit | Todos: P1 + P2 + P3 |
| Ejecución | **DS v2 paralelo**: tokens nuevos + página de especímenes, migración página por página |
| Hero | Palabra rotativa (camiones → barcos → containers → aviones → vagones) como única animación de firma |

## 1. Color v2

**Valores:** los ramps teal/magenta/navy 50–900 actuales se conservan. Se agrega el rol `accent-text-sm` (teal-700) para acento en texto chico.

**Mecánica (estrategia Restrained):**
- Blanco/navy-50 dominante; navy-900 para texto primario, navy-600 secundario, navy-400 muted. **navy-500 y navy-700 dejan de usarse como texto** (hoy 21 usos mezclados sin criterio).
- Teal = acento quirúrgico **≤10% de la superficie**: palabra del hero, links, un dato destacado por sección. Nunca fondo de sección.
- Magenta = **solo CTA**, un botón primario por viewport. Nada más magenta.
- Navy-900 plano como superficie oscura solo en CTA banner y footer (el CTA banner deja el gradiente midnight).

**Se elimina del sistema:** `--gradient-brand`, `--gradient-magenta`, `--gradient-midnight`, `glow-teal`, `glow-magenta`, `bg-dotgrid`, `bg-dotgrid-fade`, `grain`, `glass-dark`, `animate-float`, `animate-rise`, `--color-periwinkle`, `--color-warning`, `--color-info`, `--shadow-xs`. `--color-error` pasa a alias de `--color-magenta-500` (no valor duplicado).

**Reglas de contraste (corrige hallazgo del audit):**
- teal-600 (#008C82, 4.14:1 sobre blanco) permitido solo en texto ≥18px o ≥14px bold. Texto chico acentuado → teal-700 o navy.
- teal-500 prohibido como texto sobre claro (2.93:1) — hoy 1 uso en `SolutionSteps.tsx:12`.
- Footer: texto mínimo sobre navy pasa de navy-400 (4.37:1) a navy-300.
- `::selection`: navy-900 sobre teal-100 (reemplaza blanco sobre teal-500).

## 2. Tipografía v2

- **Schibsted Grotesk** variable (400–900 + italic) vía `next/font/google`, subset latin, `display: swap`. Un archivo de font (hoy 11).
- Jerarquía por peso: display/headings **700–800**, body **400**, labels/UI **500**. Tracking -0.02em en display.
- La escala actual conserva nombres (`text-display-2xl` … `text-overline`) — la migración no rompe clases. Todos los pasos `display-*` pasan a `clamp()` fluido (hoy solo el hero).
- `--font-display` y `--font-body` apuntan ambos a Schibsted (los tokens no se rompen; consolidación transparente).

## 3. Hero v2

- Split light: titular navy con **palabra rotativa en teal-600 sólido** ("Cargá tus `{camiones|barcos|containers|aviones|vagones}` al 100% con IA"), rotación ~2.2s, transición corta translateY+fade (mock aprobado: `.superpowers/brainstorm/62078-1783219860/content/hero-word.html`).
- `prefers-reduced-motion`: palabra fija en "camiones", cero movimiento.
- Foto real de operación al costado en container `ring-1` sin overlay; CTA primario magenta + ghost.
- Es la única animación "de firma". El resto del sitio conserva solo reveals suaves.
- La palabra rotativa se implementa reservando el ancho del término más largo (evitar layout shift).

## 4. Componentes v2

- **Section/SectionHeader:** eyebrow **opt-in** (default: sin eyebrow, sin dot). Regla: máximo 1 por página, en el hero. Elimina las ~48 instancias actuales.
- **Cards:** estilo único — `border navy-100, rounded-xl`, sin sombra en reposo, `shadow-sm` en hover. Se elimina `card-lift` (y su sombra hardcodeada). PostCard y demás réplicas manuales usan el estilo único.
- **Partners:** los 3 grids clónicos pasan a **lista editorial** (filas con jerarquía tipográfica, no cards).
- **Integraciones:** grid de tiles de tamaño variado (patrón bento como ModuleGrid).
- **MetricsBand:** de stat-band 4-col a **línea editorial** — un dato grande + frase de contexto; el dato rota según la página.
- **Nav:** focus visible real en mega-menú (anillo, no solo bg-teal-50); drawer móvil con `overflow-y-auto`, cierre con Escape, `inert` cuando cerrado, `aria-controls`; hamburguesa ≥44px; skip link antes del nav.
- **LocaleSwitch:** touch target ≥44px.
- **Faq:** píldoras de categoría ≥44px de alto.
- **JourneyScroll:** pin solo en `md+`. En móvil: stack vertical estático **con fotos visibles** (hoy `hidden md:block` + pin de ~4 viewports solo texto). Panel de texto sin altura fija `h-40`.
- **ContactForm:** labels visibles asociados, `aria-live` en error/éxito, `aria-invalid` + `aria-describedby`, indicación de required. Mantiene honeypot.
- **AnimatedCounter:** respeta `prefers-reduced-motion` (valor final estático).
- **CTABanner/Footer:** navy-900 plano; acento sobre oscuro unificado en **teal-400** (hoy mezcla teal-300/400).

## 5. Estructura DS v2 y migración

```
geodot-design-system/
  v2/
    tokens.json    # fuente de verdad
    theme.css      # variables CSS generadas
    DESIGN.md      # reglas v2 (este spec resumido + ejemplos)
```

- El `@theme` de `app/[locale]/globals.css` se regenera desde v2.
- **Página de especímenes** `/dev/especimen` (noindex, fuera del sitemap): type scale, colores, botones, cards, form, hero con palabra rotativa. Sirve para comparar antes/después y como referencia viva.
- **Orden de migración** (comparando contra prod en cada paso): home → plataforma (+módulos) → industrias → contacto → casos-éxito → partners / integraciones / FAQ → recursos + legales.
- `docs/STYLE-TOKENS.md` se actualiza al final con las reglas v2.

## 6. Fixes del audit

**Commit de limpieza previo (independiente del rediseño):**
- Borrar `components/ConnectThePoints.tsx` (código muerto; resuelve sus 3 fugas de color y su SVG ilegible en móvil).
- Recomprimir las 28 imágenes >300KB de `public/` (objetivo ≤300KB c/u; hero LCP `fleet-tracking.jpg` 964KB → ~250KB); fotos PNG → JPG.
- Reemplazar em dashes en `content/blog/*.mdx` (~40) y briefs.
- `next.config.ts`: `minimumCacheTTL` + headers de cache para estáticos.
- Arreglar `<dt>` fuera de `<dl>` en `casos-exito/page.tsx:38-41`.

**Integrados a la migración de cada archivo:** todos los P1/P2/P3 restantes del reporte de audit (contraste, a11y de form/nav, touch targets, `grid-cols-3` sin base móvil en contacto, `text-display-lg` sin variante móvil, `text-balance` en h2, estilos `pre`/`table` en MDX con `overflow-x-auto`, `transition-all` → transform/opacity, ModuleGrid/CasesStrip/IndustryGrid a Server Components con wrapper Reveal cliente, alt de heros descriptivo o vacío).

## 7. Verificación

- Por página migrada: `npm run build` + `npm run lint` + `npm test` verdes; pasada visual en dev (desktop + 375px).
- Al final: re-audit impeccable **≥17/20**; Lighthouse a11y **≥95** en `/` y `/contacto`; grep-gates: 0 `bg-clip-text`, 0 hex inline fuera de excepciones sancionadas, 0 `text-teal-500` como texto, 0 tokens muertos en `@theme`.

## Fuera de alcance

- Logo y rebrand corporativo; PdfEbookGenerator / PropuestaComercial / presentaciones.
- Dark mode (el sitio es light-first; navy solo como puntuación).
- Cambios de copy/mensajes más allá de em dashes y labels de a11y.
- Animaciones adicionales a la palabra rotativa del hero.
