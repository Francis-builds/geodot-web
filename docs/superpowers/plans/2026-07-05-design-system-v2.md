# Design System v2 ("Evolución sobria") — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar geodot-web al DS v2 (enterprise restraint: Schibsted Grotesk única, teal ≤10%, magenta solo CTA, sin gradientes/glows/texturas) e integrar los 38 fixes del audit impeccable.

**Architecture:** DS v2 paralelo: primero limpieza independiente, luego tokens/tipografía v2 + página de especímenes, después primitivos y componentes compartidos, migración página por página, y barrido final que elimina las utilities legacy. El sitio compila y funciona al final de CADA task.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 (`@theme` en `app/[locale]/globals.css`), next-intl, GSAP+Lenis, motion/react, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-07-05-design-system-v2-design.md`

## Global Constraints

- Cero hex/rgba inline en TSX (excepciones sancionadas: `app/[locale]/opengraph-image.tsx`, `app/icon.svg`).
- Teal en texto: `text-accent-strong` (teal-600) solo ≥18px o ≥14px bold; texto chico acentuado → `.text-accent-sm` (teal-700). `text-teal-500` como texto: PROHIBIDO.
- Texto secundario: solo `text-navy-600` (light) / `text-navy-300` (dark). `text-navy-500`/`text-navy-700` como texto: prohibidos post-migración.
- Magenta solo en CTA (Button primary). Un CTA primario por viewport.
- Sin em dashes (—) en copy nuevo. Sin `transition-all` nuevo (solo transform/opacity/box-shadow/border-color explícitos).
- Toda animación con rama `prefers-reduced-motion`.
- Touch targets ≥44×44px en interactivos.
- Al final de cada task: `npm run build && npm run lint` verdes. Commit por task.
- El servidor dev corre con `npm run dev` (puerto 3000); locale ES sin prefijo, EN en `/en`.

---

## FASE 0 — Limpieza previa (independiente del rediseño)

### Task 1: Borrar código muerto ConnectThePoints

**Files:**
- Delete: `components/ConnectThePoints.tsx`

**Interfaces:** N/A (0 imports — verificado en audit).

- [ ] **Step 1: Verificar que sigue sin usarse**

Run: `grep -rn "ConnectThePoints" --include="*.tsx" --include="*.ts" app components lib | grep -v "components/ConnectThePoints.tsx"`
Expected: sin output.

- [ ] **Step 2: Borrar**

```bash
rm components/ConnectThePoints.tsx
```

- [ ] **Step 3: Build verde**

Run: `npm run build`
Expected: "Compiled successfully".

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: eliminar ConnectThePoints (codigo muerto, 3 fugas de color, SVG ilegible movil)"
```

### Task 2: Optimizar imágenes de public/

**Files:**
- Modify: `public/images/**` (28 archivos >300KB; 4 PNG fotográficos → JPG)
- Modify: referencias a los PNG renombrados en `app/` y `content/`

**Interfaces:** Produce: mismas rutas de imagen salvo 4 PNG→`.jpg` (torre-control, industries/recintos-fiscales/hero, blog/recintos-fiscales, blog/etiqueta-zero).

- [ ] **Step 1: Listar los pesados (baseline)**

Run: `find public -type f -size +300k | sort`
Expected: ~28 archivos, incluye `public/images/hero/fleet-tracking.jpg` (964K).

- [ ] **Step 2: Recomprimir JPG in place con sips (macOS)**

```bash
find public -type f -name "*.jpg" -size +300k -exec sips -Z 1800 -s formatOptions 72 {} \;
```

- [ ] **Step 3: Convertir los 4 PNG fotográficos a JPG**

```bash
for f in public/images/recintos/torre-control public/images/industries/recintos-fiscales/hero public/images/blog/recintos-fiscales public/images/blog/etiqueta-zero; do
  sips -Z 1800 -s format jpeg -s formatOptions 72 "$f.png" --out "$f.jpg" && rm "$f.png"
done
```

- [ ] **Step 4: Actualizar referencias PNG→JPG**

Run: `grep -rln "torre-control.png\|recintos-fiscales/hero.png\|blog/recintos-fiscales.png\|blog/etiqueta-zero.png" app components content messages`
Para cada archivo listado, reemplazar la extensión `.png` → `.jpg` de esas 4 rutas (Edit exacto por archivo).

- [ ] **Step 5: Verificar resultado**

Run: `find public -type f -size +300k | wc -l && du -sh public/`
Expected: ≤5 archivos >300KB (ninguno >500KB) y total <8M. Luego `npm run build` verde y spot-check visual de `/` y `/recursos` en dev.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "perf: recomprimir imagenes public/ (15M->~7M), PNG fotograficos a JPG"
```

### Task 3: Em dashes fuera del copy del blog

**Files:**
- Modify: `content/blog/*.mdx` (~40 ocurrencias), `content/briefs/*.md` (~6)

- [ ] **Step 1: Listar ocurrencias**

Run: `grep -rn "—" content/ | head -60`

- [ ] **Step 2: Reemplazar según regla**

Regla mecánica por ocurrencia (leer la frase): ` — ` que une dos cláusulas → `. ` (nueva oración) o `, ` si la segunda es corta; ` — ` que introduce lista/ejemplo → `: `. Nunca `--`.

- [ ] **Step 3: Verificar cero**

Run: `grep -rn "—" content/ | wc -l`
Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add content && git commit -m "copy: eliminar em dashes del blog y briefs (regla DS)"
```

### Task 4: Cache headers + fix HTML inválido en casos-exito

**Files:**
- Modify: `next.config.ts`
- Modify: `app/[locale]/casos-exito/page.tsx:28-41`

- [ ] **Step 1: next.config.ts — TTL de imágenes y headers de estáticos**

Dentro del objeto de config existente, agregar (manteniendo `images.formats` actual):

```ts
images: {
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 2678400, // 31 días
},
async headers() {
  return [
    {
      source: "/images/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
  ];
},
```

- [ ] **Step 2: casos-exito — mover el bloque "resultado" dentro del `<dl>`**

Reemplazar las líneas 28-41 por (el `<dl>` pasa a envolver también el resultado; `flex-1` mantiene el borde abajo):

```tsx
<dl className="mt-5 flex flex-1 flex-col space-y-4">
  <div>
    <dt className="text-overline font-semibold uppercase tracking-wide text-navy-500">{t("studies.labels.challenge")}</dt>
    <dd className="mt-1 text-body-md text-navy-700">{s.challenge}</dd>
  </div>
  <div>
    <dt className="text-overline font-semibold uppercase tracking-wide text-navy-500">{t("studies.labels.solution")}</dt>
    <dd className="mt-1 text-body-md text-navy-700">{s.solution}</dd>
  </div>
  <div className="mt-auto border-t border-navy-100 pt-4">
    <dt className="text-overline font-semibold uppercase tracking-wide text-navy-500">{t("studies.labels.result")}</dt>
    <dd className="mt-1 text-body-md font-semibold text-navy-900">{s.result}</dd>
  </div>
</dl>
```

(Los colores navy-500/700 de este bloque se corrigen en Task 17; acá solo el HTML.)

- [ ] **Step 3: Build + commit**

Run: `npm run build` → verde.

```bash
git add next.config.ts "app/[locale]/casos-exito/page.tsx" && git commit -m "fix: cache headers/minimumCacheTTL + dt fuera de dl en casos-exito"
```

---

## FASE 1 — DS v2 base

### Task 5: geodot-design-system/v2 canónico

**Files:**
- Create: `../geodot-design-system/v2/tokens.json`
- Create: `../geodot-design-system/v2/theme.css`
- Create: `../geodot-design-system/v2/DESIGN.md`

**Interfaces:** Produce la fuente de verdad v2. `theme.css` = el bloque `@theme` objetivo final (post Task 19). Tasks 6-7 llevan el subset aplicable a `globals.css`.

- [ ] **Step 1: tokens.json** — copiar los ramps teal/magenta/navy actuales de `app/[locale]/globals.css` @theme (valores idénticos), + `"accent-text-sm": "#006F67"` (teal-700), + feedback solo `success` y `error` (`error` = referencia `"{magenta.500}"`). SIN: periwinkle, warning, info, gradientes, shadow-xs.
- [ ] **Step 2: theme.css** — el `@theme` v2 completo: ramps, fonts (`--font-display`/`--font-body` → `var(--font-schibsted)`), type scale actual con `display-*` en `clamp()`:

```css
--text-display-2xl: clamp(44px, 6vw, 72px);
--text-display-xl:  clamp(36px, 5vw, 56px);
--text-display-lg:  clamp(30px, 4vw, 44px);
```

(line-heights/tracking actuales se conservan), font-weights sin `--font-weight-light`, spacing/radius actuales, shadows sm/md/lg/nav/pop/ring-magenta.
- [ ] **Step 3: DESIGN.md v2** — resumen de reglas del spec §1-§4 (mecánica Restrained, reglas de contraste, tipografía única, cards, eyebrow máx 1/página).
- [ ] **Step 4: Commit** (en geodot-design-system):

```bash
cd ../geodot-design-system && git add v2 && git commit -m "feat: design system v2 (evolucion sobria)" && cd -
```

### Task 6: Tipografía Schibsted Grotesk única

**Files:**
- Modify: `app/[locale]/layout.tsx:1-25,71`
- Modify: `app/[locale]/globals.css` (@theme fonts + weights)

**Interfaces:** Produce CSS var `--font-schibsted`; `--font-display`/`--font-body` siguen existiendo (componentes no se tocan).

- [ ] **Step 1: Verificar que no hay font-light en uso**

Run: `grep -rn "font-light" app components`
Expected: sin output. (Si aparece algo: cambiar a `font-normal` en ese sitio.)

- [ ] **Step 2: layout.tsx — una sola familia variable**

Reemplazar las líneas 2 y 13-25 por:

```tsx
import { Schibsted_Grotesk } from "next/font/google";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});
```

Y en el `<html>` (línea 71): `className={schibsted.variable}`.

- [ ] **Step 3: globals.css — apuntar fonts y quitar light**

```css
--font-display: var(--font-schibsted), system-ui, sans-serif;
--font-body:    var(--font-schibsted), system-ui, sans-serif;
```

Borrar `--font-weight-light: 300;`.

- [ ] **Step 4: Verificar en dev**

Run: `curl -s http://localhost:3000/ | grep -c "schibsted"` → ≥1 (font CSS inyectada). Visual: headings y body en Schibsted.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/layout.tsx" "app/[locale]/globals.css" && git commit -m "feat(ds2): Schibsted Grotesk unica familia variable (11 archivos de font -> 1)"
```

### Task 7: Tokens v2 en globals.css (sin romper usos vigentes)

**Files:**
- Modify: `app/[locale]/globals.css` (@theme + @layer base)

**Interfaces:** Produce `.text-accent-sm`. NO borra todavía: gradientes, dotgrid, glows, grain, glass-dark, card-lift, animate-* (siguen en uso hasta Fase 3/4; se eliminan en Task 19).

- [ ] **Step 1: @theme — borrar tokens muertos y alias de error**

Borrar: `--color-periwinkle`, `--color-warning`, `--color-info`, `--shadow-xs`. Cambiar: `--color-error: var(--color-magenta-500);`. Type scale `display-*` → los `clamp()` de Task 5.

- [ ] **Step 2: ::selection accesible**

```css
::selection { background: var(--color-teal-100); color: var(--color-navy-900); }
```

- [ ] **Step 3: Nueva utility de acento chico** (junto a `.text-accent-strong`):

```css
.text-accent-sm { color: var(--color-teal-700); }
```

- [ ] **Step 4: Gates**

Run: `grep -rn "periwinkle\|color-warning\|color-info\|shadow-xs" app components lib` → sin output. `npm run build` verde.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/globals.css" && git commit -m "feat(ds2): tokens v2 - muertos fuera, display clamp, selection AA, text-accent-sm"
```

### Task 8: Página de especímenes /dev/especimen

**Files:**
- Create: `app/[locale]/dev/especimen/page.tsx`

**Interfaces:** Consume tokens v2 y (a medida que existan) los componentes v2. `robots: { index: false }`; no entra al sitemap (verificar que `app/sitemap.ts` no la incluya — genera desde una lista explícita de rutas).

- [ ] **Step 1: Crear la página** (Server Component, sin traducciones — solo referencia interna):

```tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Especimen DS v2", robots: { index: false, follow: false } };

const RAMP = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;

export default async function EspecimenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Container className="space-y-16 py-20">
      <section>
        <h2 className="text-heading-lg font-bold">Type scale — Schibsted Grotesk</h2>
        <p className="text-display-2xl font-extrabold">display-2xl 800</p>
        <p className="text-display-xl font-bold">display-xl 700</p>
        <p className="text-display-lg font-bold">display-lg 700</p>
        <p className="text-heading-xl font-bold">heading-xl 700</p>
        <p className="text-heading-md font-medium">heading-md 500</p>
        <p className="max-w-[65ch] text-body-md">body-md 400 — Geodot rutea y paletiza en simultáneo. Texto de prueba para medir line-height, ritmo y color de texto secundario.</p>
        <p className="text-caption text-navy-600">caption navy-600</p>
        <p className="text-overline font-medium uppercase text-accent-sm">overline text-accent-sm (teal-700)</p>
      </section>
      <section>
        <h2 className="text-heading-lg font-bold">Color ramps</h2>
        {(["teal", "magenta", "navy"] as const).map((ramp) => (
          <div key={ramp} className="mt-3 flex gap-1">
            {RAMP.map((step) => (
              <div key={step} className={`h-12 flex-1 rounded-sm bg-${ramp}-${step}`} title={`${ramp}-${step}`} />
            ))}
          </div>
        ))}
      </section>
      <section className="space-y-4">
        <h2 className="text-heading-lg font-bold">Botones y card v2</h2>
        <div className="flex gap-4"><Button href="#" variant="primary">CTA primario</Button><Button href="#" variant="ghost">Ghost</Button></div>
        <div className="max-w-sm rounded-xl border border-navy-100 bg-white p-7 transition-shadow hover:shadow-sm">
          <h3 className="text-heading-sm font-semibold text-navy-900">Card v2</h3>
          <p className="mt-2 text-body-md text-navy-600">Sin sombra en reposo, shadow-sm en hover, border navy-100.</p>
        </div>
      </section>
    </Container>
  );
}
```

Nota: safelist de clases dinámicas `bg-teal-50…bg-navy-900`: si el build purga las ramps, reemplazar el map por las 30 clases literales (mecánico).

- [ ] **Step 2: Verificar**

Run: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/dev/especimen` → `200`. `grep -n "especimen" app/sitemap.ts` → sin output.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/dev" && git commit -m "feat(ds2): pagina de especimenes /dev/especimen (noindex)"
```

---

## FASE 2 — Primitivos

### Task 9: Section/SectionHeader v2 (eyebrow opt-out, text-balance) + barrido de call sites

**Files:**
- Modify: `components/ui/Section.tsx` (completo)
- Modify: todos los call sites con `eyebrow=`/`texture=` en `SectionHeader`/`Section` (grep-driven)

**Interfaces:** Produce `Section({ children, id, tone, className })` y `SectionHeader({ title, titleAccent, description, align, tone })`. Los props `eyebrow`, `texture` y `accentGradient` DEJAN de existir (TS rompe los call sites → el barrido de este mismo task los arregla). `Hero` conserva su eyebrow (regla: máx 1 por página).

- [ ] **Step 1: Reescribir Section.tsx**

```tsx
import { ReactNode } from "react";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

type Tone = "base" | "subtle" | "dark";

const TONE: Record<Tone, string> = {
  base: "bg-white text-navy-900",
  subtle: "bg-navy-50 text-navy-900",
  dark: "bg-navy-900 text-white",
};

export function Section({
  children, id, tone = "base", className = "",
}: {
  children: ReactNode; id?: string; tone?: Tone; className?: string;
}) {
  return (
    <section id={id} className={`relative py-20 md:py-24 ${TONE[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  title, titleAccent, description, align = "left", tone = "base",
}: {
  title: string; titleAccent?: string; description?: string;
  align?: "left" | "center"; tone?: Tone;
}) {
  const dark = tone === "dark";
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <Reveal direction="up" className={`mb-12 max-w-3xl ${alignment}`}>
      <h2 className="text-balance text-heading-xl md:text-display-lg font-bold text-[color:inherit]">
        {title} {titleAccent && <span className={dark ? "text-accent" : "text-accent-strong"}>{titleAccent}</span>}
      </h2>
      {description && (
        <p className={`mt-4 text-pretty text-body-lg ${dark ? "text-navy-300" : "text-navy-600"}`}>{description}</p>
      )}
    </Reveal>
  );
}
```

(Default de `align` pasa a `left` — lane enterprise: menos centered-stack. Call sites que hoy se ven centrados y deban seguir así pasan `align="center"` explícito; criterio: dejar `center` solo en CTA banner.)

- [ ] **Step 2: Barrido de call sites**

Run: `grep -rln "eyebrow=\|texture=\|accentGradient" app components | grep -v "components/Hero"`
En cada archivo: borrar los props `eyebrow={...}`, `texture=...` y `accentGradient` de `SectionHeader`/`Section`. NO tocar el `eyebrow` de `<Hero .../>`.

- [ ] **Step 3: Gates y visual**

Run: `npm run build` verde; `grep -rn "eyebrow=" app components | grep -v Hero | grep -v "components/Hero"` → sin output. Visual en dev: home y 2 páginas internas sin eyebrows de sección.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(ds2): Section v2 - eyebrow/texture fuera, text-balance, align left default"
```

### Task 10: Card v2 — reemplazo de card-lift y réplicas manuales

**Files:**
- Modify: call sites de `card-lift` (8: contacto, partners, ProblemStats, integraciones, IndustryGrid, ModuleGrid, Multimodal, CasesStrip) + `components/blog/PostCard.tsx:15`

**Interfaces:** Patrón único de card (string de clases, sin utility nueva): reposo `rounded-xl border border-navy-100 bg-white` + hover `transition-shadow hover:shadow-sm`. En superficies dark: `rounded-xl border border-white/10 bg-white/5`.

- [ ] **Step 1: Barrido card-lift**

Run: `grep -rn "card-lift" app components`
En cada sitio reemplazar `card-lift` y su combo actual (`rounded-2xl ... shadow-sm`) por: `rounded-xl border border-navy-100 bg-white transition-shadow hover:shadow-sm` (conservar paddings existentes). Donde había `shadow-sm` en reposo: quitarlo.

- [ ] **Step 2: PostCard.tsx:15** — alinear al patrón: `hover:shadow-lg` → `hover:shadow-sm`, `rounded-2xl` → `rounded-xl` (si aplica).

- [ ] **Step 3: Gates**

Run: `grep -rn "card-lift" app components` → sin output. Build verde. Visual: hover de cards en home/integraciones.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(ds2): card v2 unica - fuera card-lift y sombras en reposo"
```

### Task 11: Grillas a Server Components (Reveal como única isla)

**Files:**
- Modify: `components/ModuleGrid.tsx`, `components/IndustryGrid.tsx`, `components/CasesStrip.tsx`

**Interfaces:** Los tres dejan `"use client"`; la animación de entrada pasa al wrapper existente `components/ui/Reveal.tsx` (ya es client y acepta `direction`/`delay`). Sus props públicos no cambian.

- [ ] **Step 1:** En cada uno: quitar `"use client"` y los imports/uso de `motion` (`whileInView` etc.); envolver cada tile/item en `<Reveal direction="up" delay={i * 0.06}>` (patrón ya usado en partners/page.tsx:46). Reemplazar `transition-all` → `transition-[transform,box-shadow]` o el par explícito que corresponda.
- [ ] **Step 2:** Run: `grep -n "use client\|transition-all" components/ModuleGrid.tsx components/IndustryGrid.tsx components/CasesStrip.tsx` → sin output. Build verde; visual: reveals siguen funcionando, hover ok.
- [ ] **Step 3: Commit**

```bash
git add components && git commit -m "perf(ds2): ModuleGrid/IndustryGrid/CasesStrip a server components via Reveal"
```

---

## FASE 3 — Componentes compartidos

### Task 12: RotatingWord + Hero v2 (split light)

**Files:**
- Create: `components/ui/RotatingWord.tsx`
- Modify: `components/Hero.tsx` (reescritura), `app/[locale]/globals.css` (keyframes word)
- Modify: `messages/es.json` + `messages/en.json` (array `home.hero.rotatingWords`)
- Modify: `app/[locale]/page.tsx` (pasar rotatingWords; migrar de HeroCinematic a Hero — ver Step 5)

**Interfaces:**
- Produce `RotatingWord({ words: string[]; className?: string })` — client, reserva el ancho de la palabra más larga (sin layout shift), `aria-hidden` en el rotador + palabra estática `sr-only`, quieto bajo reduced-motion.
- Produce `Hero({ eyebrow?, title, titleAccent?, rotatingWords?, subtitle, primaryCta?, secondaryCta?, bgImage?, bgAlt? })`. `rotatingWords` tiene prioridad sobre `titleAccent`. Props eliminados: `variant`, `visual`, `eyebrowIcon`.

- [ ] **Step 1: Keyframes en globals.css** (junto a los @keyframes existentes):

```css
@keyframes word-out { to { opacity: 0; transform: translateY(-0.35em); } }
@keyframes word-in { from { opacity: 0; transform: translateY(0.4em); } to { opacity: 1; transform: translateY(0); } }
.animate-word-out { animation: word-out 0.3s cubic-bezier(0.5, 0, 0.7, 0.4) forwards; }
.animate-word-in { animation: word-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both; }
```

- [ ] **Step 2: RotatingWord.tsx**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const HOLD_MS = 2200;
const OUT_MS = 300;

export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const hold = setInterval(() => setLeaving(true), HOLD_MS);
    return () => clearInterval(hold);
  }, [reduced, words.length]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      setLeaving(false);
    }, OUT_MS);
    return () => clearTimeout(t);
  }, [leaving, words.length]);

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
        <span className="invisible col-start-1 row-start-1">{longest}</span>
        <span key={index} className={`col-start-1 row-start-1 ${leaving ? "animate-word-out" : "animate-word-in"}`}>
          {words[index]}
        </span>
      </span>
    </>
  );
}
```

- [ ] **Step 3: Hero.tsx v2** (reescritura completa):

```tsx
import Image from "next/image";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { RotatingWord } from "./ui/RotatingWord";

export function Hero({
  eyebrow, title, titleAccent, rotatingWords, subtitle, primaryCta, secondaryCta, bgImage, bgAlt,
}: {
  eyebrow?: string; title: string; titleAccent?: string; rotatingWords?: string[];
  subtitle: string; primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string }; bgImage?: string; bgAlt?: string;
}) {
  const accent = rotatingWords?.length ? (
    <RotatingWord words={rotatingWords} className="text-accent-strong" />
  ) : titleAccent ? (
    <span className="text-accent-strong">{titleAccent}</span>
  ) : null;

  return (
    <section className="bg-white">
      <Container className={`grid items-center gap-12 py-16 md:py-24 ${bgImage ? "md:grid-cols-2" : "max-w-3xl"}`}>
        <div>
          {eyebrow && (
            <span className="mb-5 inline-block text-overline font-medium uppercase tracking-wide text-accent-sm">{eyebrow}</span>
          )}
          <h1 className="text-balance text-display-xl font-extrabold text-navy-900">
            {title} {accent}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-body-lg text-navy-600">{subtitle}</p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-9 flex flex-wrap gap-4">
              {primaryCta && <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>}
              {secondaryCta && <Button href={secondaryCta.href} variant="ghost">{secondaryCta.label}</Button>}
            </div>
          )}
        </div>
        {bgImage && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-navy-100">
            <Image src={bgImage} alt={bgAlt ?? ""} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
      </Container>
    </section>
  );
}
```

Nota alt: los call sites que hoy pasan `bgAlt={título}` (duplica h1) pasan a alt descriptivo de la FOTO o se quita el prop (queda `alt=""` decorativo).

- [ ] **Step 4: Messages** — en `messages/es.json`, dentro de `home.hero`: `"rotatingWords": ["camiones", "barcos", "containers", "aviones", "vagones"]`; en `en.json`: `["trucks", "ships", "containers", "planes", "railcars"]`.

- [ ] **Step 5: Home** — en `app/[locale]/page.tsx`: reemplazar `<HeroCinematic ...>` por `<Hero>` v2 con `rotatingWords={t.raw("hero.rotatingWords") as string[]}` (mapear props: `imageAlt`→`bgAlt` descriptivo de la foto). Run: `grep -rln "HeroCinematic" app components` — si queda otro call site (p.ej. industrias/[industria]), migrarlo igual; luego `rm components/HeroCinematic.tsx`.

- [ ] **Step 6: Gates** — Build verde. Visual: palabra rota en `/`, quieta con reduced-motion (emular en DevTools), sin layout shift (el ancho no salta). `grep -rn "HeroCinematic" app components` → sin output.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(ds2): hero split light con palabra rotativa (5 modos), fuera HeroCinematic"
```

### Task 13: Nav accesible (skip link, drawer, focus, touch targets)

**Files:**
- Modify: `app/[locale]/layout.tsx:76`, `components/Nav.tsx`, `components/NavMenu.tsx`, `components/LocaleSwitch.tsx`
- Modify: `messages/es.json`/`en.json` (key `nav.skip`)

**Interfaces:** Consume mensajes nuevos `nav.skip` ("Saltar al contenido" / "Skip to content").

- [ ] **Step 1: Skip link + id en main** (layout.tsx, primer hijo del body, es Server Component con next-intl disponible vía `getTranslations`):

```tsx
<a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-body-sm focus:font-semibold focus:text-navy-900 focus:shadow-md">
  {tNav("skip")}
</a>
```

y `<main id="contenido" className="pt-16 md:pt-[72px]">`.

- [ ] **Step 2: Drawer móvil (Nav.tsx:110-155)** — botón hamburguesa: `h-11 w-11` + `aria-controls="nav-drawer"`; contenedor drawer: `id="nav-drawer"`, agregar `overflow-y-auto` junto al `max-h-[80vh]`, y `inert={!open}` (React 19 soporta el prop booleano). Cierre con Escape:

```tsx
useEffect(() => {
  if (!open) return;
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [open]);
```

- [ ] **Step 3: NavMenu.tsx** — paneles colapsados: agregar `inert={!open}` al panel del acordeón móvil (línea ~243) y al panel desktop cerrado (línea ~153). Focus visible: reemplazar `focus-visible:outline-none` + `focus-visible:bg-teal-50` (líneas 56, 175) por `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1` (patrón de Button.tsx).
- [ ] **Step 4: LocaleSwitch.tsx** — el botón pasa a `inline-flex h-11 min-w-11 items-center justify-center px-2` (≥44px).
- [ ] **Step 5: Gates** — Teclado en dev: Tab desde el top muestra skip link; Escape cierra drawer; con drawer cerrado Tab NO entra a sus links. Build verde.
- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "a11y(ds2): skip link, drawer inert+escape+scroll, focus ring mega-menu, targets 44px"
```

### Task 14: ContactForm accesible

**Files:**
- Modify: `components/ContactForm.tsx` (reescritura), `messages/es.json`/`en.json` (labels ya existen como placeholders; agregar `contact.form.required`)

**Interfaces:** Mantiene `submitContact` y el honeypot tal cual. Produce el patrón label-visible: `<label>` + input con `aria-invalid`/`aria-describedby`, mensajes con `aria-live`.

- [ ] **Step 1: Reescribir el form** (patrón para los 5 campos; se muestra uno — replicar con name/type/required de cada campo actual de ContactForm.tsx:15-19):

```tsx
"use client";
import { useActionState, useId } from "react";
import { useTranslations } from "next-intl";
import { submitContact, type ContactResult } from "@/app/actions/contact";

const FIELD_CLS = "rounded-md border border-navy-200 px-4 py-3 text-body-md aria-[invalid=true]:border-magenta-500";
const LABEL_CLS = "mb-1.5 block text-body-sm font-medium text-navy-900";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const uid = useId();
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);
  const failed = state !== null && !state.ok;

  if (state?.ok) {
    return (
      <p role="status" className="rounded-lg bg-success/10 p-6 text-body-md text-success">{t("success")}</p>
    );
  }

  return (
    <form action={action} noValidate={false} className="grid gap-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label htmlFor={`${uid}-nombre`} className={LABEL_CLS}>
          {t("name")} <span aria-hidden className="text-magenta-500">*</span>
        </label>
        <input id={`${uid}-nombre`} name="nombre" required aria-invalid={failed || undefined}
          aria-describedby={failed ? `${uid}-error` : undefined} className={`w-full ${FIELD_CLS}`} />
      </div>
      {/* repetir el mismo patrón para: empresa (required), email (type="email" required), telefono (opcional, sin *), mensaje (textarea rows={4} required) */}
      <p className="text-caption text-navy-600">{t("required")}</p>
      <div aria-live="polite">
        {failed && <p id={`${uid}-error`} className="text-body-sm font-medium text-error">{t("error")}</p>}
      </div>
      <button type="submit" disabled={pending}
        className="rounded-full bg-magenta-500 px-7 py-3.5 text-body-sm font-semibold text-white transition-colors hover:bg-magenta-600 disabled:opacity-60">
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Messages** — `contact.form.required`: ES `"* Campos obligatorios"` / EN `"* Required fields"`. (Las keys name/company/email/phone/message ya existen — pasan de placeholder a label.)
- [ ] **Step 3: Gates** — En dev `/contacto`: labels visibles, submit vacío marca campos, VoiceOver (o inspección de árbol de a11y) anuncia el error. Build verde. Nota: usa `bg-success/10 text-success text-error` — verifica que Tailwind genere las utilities desde los tokens (`--color-success`/`--color-error`); si no, `text-[color:var(--color-success)]` NO es aceptable: agregar los tokens al @theme correctamente.
- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "a11y(ds2): ContactForm con labels visibles, aria-live y aria-invalid"
```

### Task 15: AnimatedCounter respeta reduced-motion

**Files:**
- Modify: `components/ui/AnimatedCounter.tsx`

- [ ] **Step 1:** Importar `useReducedMotion` de `motion/react`; al inicio del efecto de animación (línea ~24): si `reduced`, setear el valor final directo (`setValue(target)`) y no arrancar rAF.
- [ ] **Step 2:** Verificar con emulación reduced-motion en dev: los números aparecen fijos. Commit:

```bash
git add components/ui/AnimatedCounter.tsx && git commit -m "a11y(ds2): AnimatedCounter estatico bajo prefers-reduced-motion"
```

### Task 16: MetricsBand editorial + CTABanner/Footer navy plano

**Files:**
- Modify: `components/MetricsBand.tsx` (reescritura), `components/CTABanner.tsx`, `components/Footer.tsx`

**Interfaces:** `MetricsBand({ metrics, dark })` conserva su firma (`metrics: { value: string; label: string }[]`), cambia el render: primera métrica dominante + resto en línea secundaria.

- [ ] **Step 1: MetricsBand render v2** (dentro del componente, mismo props):

```tsx
const [hero, ...rest] = metrics;
return (
  <div className="flex flex-col gap-6 border-y border-navy-100 py-10 md:flex-row md:items-end md:justify-between">
    <p>
      <span className={`block text-display-lg font-extrabold ${dark ? "text-accent" : "text-accent-strong"}`}>{hero.value}</span>
      <span className={`mt-1 block max-w-md text-body-lg ${dark ? "text-navy-300" : "text-navy-600"}`}>{hero.label}</span>
    </p>
    {rest.length > 0 && (
      <ul className="flex flex-wrap gap-x-10 gap-y-3">
        {rest.map((m) => (
          <li key={m.label} className="text-body-sm">
            <span className={`font-bold ${dark ? "text-white" : "text-navy-900"}`}>{m.value}</span>{" "}
            <span className={dark ? "text-navy-300" : "text-navy-600"}>{m.label}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

(borde `border-navy-100` solo en tone claro; en dark usar `border-white/10`.)

- [ ] **Step 2: CTABanner** — quitar `bg-[image:var(--gradient-midnight)]`, `grain`, dotgrid y glows → `bg-navy-900` plano; `text-display-lg` crudo → `text-heading-xl md:text-display-lg`; acentos `teal-300` → `teal-400`.
- [ ] **Step 3: Footer** — `text-navy-400` (headers de columna :17 y copyright :103) → `text-navy-300`; links/acentos `teal-300`/`hover:teal-300` (líneas 15,54,73,106,107) → `teal-400`/`hover:text-teal-300` (hover puede aclarar); seam con gradiente si existe → borde `border-white/10`.
- [ ] **Step 4: Gates** — `grep -n "gradient-midnight\|grain\|text-navy-400" components/CTABanner.tsx components/Footer.tsx` → sin output. Visual + build. Commit:

```bash
git add components && git commit -m "feat(ds2): MetricsBand editorial, CTABanner/Footer navy plano AA"
```

### Task 17: JourneyScroll móvil (pin solo md+, fotos visibles)

**Files:**
- Modify: `components/JourneyScroll.tsx`

**Interfaces:** Sin cambios de props. Comportamiento: `md+` = pin actual; móvil = stack estático con foto por etapa.

- [ ] **Step 1: Gate del pin** — en el `useEffect` que monta GSAP (línea ~44), sumar al early-return de reduced-motion:

```tsx
const desktop = window.matchMedia("(min-width: 768px)").matches;
if (reduced || !desktop) return;
```

- [ ] **Step 2: Layout móvil** — el contenedor pinned actual (línea ~127 `h-screen`) pasa a `hidden md:grid` (era `grid h-screen ... md:grid-cols-2`). AGREGAR antes un bloque `md:hidden` que mapea las etapas:

```tsx
<div className="space-y-12 md:hidden">
  {stages.map((s) => (
    <div key={s.key}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-navy-100">
        <Image src={s.image} alt={s.imageAlt} fill sizes="100vw" className="object-cover" />
      </div>
      <p className="mt-4 text-overline font-medium uppercase text-accent-sm">{s.metric}</p>
      <h3 className="mt-1 text-heading-lg font-bold text-navy-900">{s.title}</h3>
      <p className="mt-2 text-body-md text-navy-600">{s.body}</p>
    </div>
  ))}
</div>
```

(usar los nombres reales de los campos del array de etapas del componente; están definidos en el mismo archivo).

- [ ] **Step 3: Panel desktop** — reemplazar `h-40` (línea ~136) por `min-h-44` y verificar que el texto EN más largo no recorta.
- [ ] **Step 4: Gates** — dev a 375px: la sección scrollea normal con fotos visibles, sin pin. Desktop: pin intacto. Reduced-motion: estático en ambos. Commit:

```bash
git add components/JourneyScroll.tsx && git commit -m "fix(ds2): JourneyScroll movil sin pin y con fotos, panel sin altura fija"
```

---

## FASE 4 — Migración por página

Patrón común por página (además de lo específico): `text-display-lg` crudo → `text-heading-xl md:text-display-lg` (si no viene de token clamp); `text-navy-700`/`text-navy-500` como texto → `text-navy-600` (o `text-navy-900` si es contenido primario); chips/labels chicos con `text-accent-strong` → `text-accent-sm`; sin `bg-dotgrid`/`glow-*`/`grain` residual.

### Task 18: Home + plataforma (+ módulos)

**Files:**
- Modify: `app/[locale]/page.tsx`, `app/[locale]/plataforma/page.tsx`, `app/[locale]/plataforma/[modulo]/page.tsx` (si existe), `components/Multimodal.tsx`, `components/ProblemStats.tsx`, `components/SolutionSteps.tsx`, `components/Faq.tsx`

- [ ] **Step 1: SolutionSteps.tsx:12** — `text-teal-500` → `text-accent-strong` (display-lg = texto grande, AA ok).
- [ ] **Step 2: Multimodal.tsx** — `text-display-lg` → token (ya clamp por Task 7; quitar override si hay); `backdrop-blur` de chips → quitar (fondo sólido `bg-white/10`); h2 con `text-balance` (viene de SectionHeader v2 si lo usa).
- [ ] **Step 3: ProblemStats.tsx:15** — `text-navy-700` → `text-navy-600`.
- [ ] **Step 4: Faq.tsx** — píldoras de categoría (líneas 38-49): `px-3 py-2` → `px-4 py-2.5 min-h-11` (≥44px); caption navy-500 (línea 17) → `text-navy-600`.
- [ ] **Step 5: Páginas** — barrido patrón común + verificar que home usa Hero v2 (Task 12) y que no queda `texture=`/eyebrow residual.
- [ ] **Step 6: Gates + commit**

Run: `grep -rn "text-navy-700\|text-navy-500\|text-teal-500\|backdrop-blur" app/[locale]/page.tsx app/[locale]/plataforma components/Multimodal.tsx components/ProblemStats.tsx components/SolutionSteps.tsx components/Faq.tsx` → sin output (salvo `backdrop-blur` del Nav glass, permitido).

```bash
git add -A && git commit -m "feat(ds2): migrar home y plataforma"
```

### Task 19: Industrias + contacto + casos-exito

**Files:**
- Modify: `app/[locale]/industrias/page.tsx`, `app/[locale]/industrias/[industria]/page.tsx`, `app/[locale]/contacto/page.tsx`, `app/[locale]/casos-exito/page.tsx`, `components/LegalBody.tsx`

- [ ] **Step 1: contacto/page.tsx:48** — `grid grid-cols-3 gap-4` → `grid grid-cols-1 gap-4 sm:grid-cols-3`; línea 52 `text-navy-500` → `text-navy-600`.
- [ ] **Step 2: casos-exito** — chip industria (línea 27): `text-accent-strong` → `text-accent-sm`; labels `text-navy-500` (del `<dl>` de Task 4) → `text-navy-600`; `text-navy-700` en dd → `text-navy-600`. Alt del hero: descriptivo de la foto (geocerca en puerto), no el título.
- [ ] **Step 3: industrias/[industria]** — alt del hero descriptivo o `bgAlt` omitido; patrón común.
- [ ] **Step 4: LegalBody.tsx:15** — `text-navy-700` → `text-navy-600`.
- [ ] **Step 5: Gates + commit** — grep patrón común en los 5 archivos → sin output; build verde; visual `/contacto` a 360px (3 stats apilados).

```bash
git add -A && git commit -m "feat(ds2): migrar industrias, contacto y casos-exito"
```

### Task 20: Partners (lista editorial) + integraciones (bento) + FAQ page

**Files:**
- Modify: `app/[locale]/partners/page.tsx` (reescritura de secciones), `app/[locale]/integraciones/page.tsx`, `app/[locale]/preguntas-frecuentes/page.tsx`

- [ ] **Step 1: Partners — categorías y servicios como lista editorial** (reemplaza los dos grids de cards clónicas; mismos datos `categories`/`services`):

```tsx
<div className="divide-y divide-navy-100 border-y border-navy-100">
  {categories.map((c, i) => (
    <Reveal key={i} direction="up" delay={i * 0.05}>
      <div className="grid gap-2 py-8 md:grid-cols-[16rem_1fr] md:gap-10">
        <h3 className="text-heading-md font-bold text-navy-900">{c.name}</h3>
        <p className="max-w-2xl text-body-lg text-navy-600">{c.body}</p>
      </div>
    </Reveal>
  ))}
</div>
```

(igual para `services`; los `tiers` conservan las 3 cards — es una comparativa genuina — con el patrón card v2 de Task 10 y `tier.range` → `text-accent-sm`).

- [ ] **Step 2: Partners — CTA de contacto** (líneas 105-119): quitar `grain`, dotgrid y `glow-teal` → `bg-navy-900` plano; `text-teal-300` → `text-teal-400`; el `<span>` overline eyebrow se elimina (regla 1 eyebrow/página); `text-display-lg` queda (token ya clamp).
- [ ] **Step 3: Integraciones — bento** — en el grid de sistemas (líneas ~66-75): `sm:grid-cols-2 lg:grid-cols-3` → `sm:grid-cols-2 lg:grid-cols-6` con los dos primeros items `lg:col-span-3` y el resto `lg:col-span-2` (tiles de tamaño variado, patrón ModuleGrid); cards al patrón v2.
- [ ] **Step 4: FAQ page** — patrón común (los touch targets del componente Faq ya salieron en Task 18).
- [ ] **Step 5: Gates + commit** — `grep -n "card-lift\|glow-teal\|grain\|text-teal-300" app/[locale]/partners/page.tsx` → sin output; visual de las 3 páginas; build verde.

```bash
git add -A && git commit -m "feat(ds2): partners lista editorial, integraciones bento, faq"
```

### Task 21: Recursos + legales + MDX

**Files:**
- Modify: `app/[locale]/recursos/page.tsx`, `app/[locale]/recursos/[slug]/page.tsx`, `app/[locale]/privacidad/page.tsx`, `app/[locale]/terminos/page.tsx`, `app/[locale]/nosotros/page.tsx`, `components/blog/MdxContent.tsx`, `components/blog/PostCard.tsx`

- [ ] **Step 1: MdxContent.tsx** — agregar a los componentes MDX:

```tsx
pre: (props) => <pre className="overflow-x-auto rounded-lg bg-navy-900 p-4 text-body-sm text-navy-100" {...props} />,
table: (props) => (
  <div className="overflow-x-auto"><table className="w-full text-body-sm" {...props} /></div>
),
```

y `text-navy-700` (línea 56) → `text-navy-600`; blockquote `border-l-4 border-teal-500` → `border-l-2 border-navy-200` (editorial neutro).
- [ ] **Step 2: recursos/[slug]** — `text-display-lg` crudo (línea 55) ya clamp por token; patrón común; PostCard.tsx:38 `text-navy-500` → `text-navy-600`.
- [ ] **Step 3: nosotros/page.tsx** — líneas 24 (`text-navy-700`) y 32 (`text-navy-500`) → `text-navy-600`.
- [ ] **Step 4: Gates + commit** — grep patrón común en los 7 archivos → sin output; visual de un post con code block a 375px (scrollea interno); build verde.

```bash
git add -A && git commit -m "feat(ds2): migrar recursos, legales, nosotros y estilos MDX"
```

---

## FASE 5 — Cierre

### Task 22: Barrido final de utilities legacy + docs

**Files:**
- Modify: `app/[locale]/globals.css`, `docs/STYLE-TOKENS.md`, `DESIGN.md` (root)

- [ ] **Step 1: Verificar cero usos** (si alguno da output, arreglar ese sitio primero):

```bash
grep -rn "bg-dotgrid\|glow-teal\|glow-magenta\|grain\|glass-dark\|card-lift\|animate-float\|animate-rise\|gradient-brand\|gradient-magenta\|gradient-midnight" app components content
```

Expected: sin output.

- [ ] **Step 2: Borrar de globals.css** — utilities `.bg-dotgrid`, `.bg-dotgrid-fade`, `.glow-teal`, `.glow-magenta`, `.grain::after`, `.glass-dark`, `.card-lift` (+:hover), `@keyframes float-soft`, `@keyframes rise-in`, `.animate-rise`, `.animate-float`; tokens `--gradient-brand`, `--gradient-magenta`, `--gradient-midnight`. (Quedan: `.glass` del nav, `.text-accent*`, `@keyframes radar-pulse` si CTABanner aún lo usa — si no: borrarlo también, verificar con grep.)
- [ ] **Step 3: Sincronizar** `../geodot-design-system/v2/theme.css` con el @theme final (deben ser idénticos).
- [ ] **Step 4: Actualizar docs** — `docs/STYLE-TOKENS.md`: reglas v2 (roles de texto navy-900/600/300, teal por tamaño con `.text-accent-sm`, magenta solo CTA, card v2, eyebrow máx 1/página en hero); `DESIGN.md` root: reescribir secciones Color/Typography/Components según spec.
- [ ] **Step 5: Build + commit**

```bash
git add -A && git commit -m "chore(ds2): barrido final - utilities legacy fuera, docs sincronizados"
```

### Task 23: Verificación final

- [ ] **Step 1: Suite completa**

Run: `npm run build && npm run lint && npm test`
Expected: todo verde.

- [ ] **Step 2: Grep-gates del spec**

```bash
grep -rn "bg-clip-text\|text-transparent" app components            # → 0
grep -rn "text-teal-500\b" app components                            # → 0
grep -rnE '#[0-9a-fA-F]{3,8}' app components --include="*.tsx" | grep -v "opengraph-image"  # → 0
grep -rn "text-navy-500\b\|text-navy-700\b" app components           # → 0
grep -rn "—" content/                                                # → 0
```

- [ ] **Step 3: Lighthouse a11y** — con dev corriendo: `npx lighthouse http://localhost:3000/ --only-categories=accessibility --chrome-flags="--headless" --quiet` y lo mismo para `/contacto`. Expected: ≥95 ambas. (Mejor aún sobre `npm run build && npm run start`.)
- [ ] **Step 4: Re-audit impeccable** — correr `/impeccable audit` (5 dimensiones). Expected: **≥17/20**, veredicto slop PASS. Si alguna dimensión <3: crear tasks de follow-up con los hallazgos.
- [ ] **Step 5: Commit final + resumen** — commit de cualquier ajuste, y reporte comparando baseline 13/20 → resultado.

---

## Self-review (hecho al escribir)

- **Cobertura spec:** §1 color → Tasks 5/7/16/18-21/22 · §2 tipografía → Task 6 · §3 hero → Task 12 · §4 componentes → Tasks 9-11/13-17/20 · §5 estructura/migración → Tasks 5/8, orden Fase 4 · §6 fixes → Fase 0 + integrados · §7 verificación → Task 23. Sin gaps detectados.
- **Consistencia de tipos:** `RotatingWord({ words, className })` igual en Task 12 Steps 2-3; `Section`/`SectionHeader` v2 (Task 9) coinciden con los usos de Tasks 18-21; `MetricsBand` conserva firma.
- **Orden anti-rotura:** utilities legacy se borran recién en Task 22, después de que Tasks 9-21 eliminan todos los usos.
