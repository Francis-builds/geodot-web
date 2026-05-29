# geodot-web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the bilingual (ES/EN) Geodot marketing site — Home, 4 product pages, 4 industry pages, Plataforma overview, Casos, Nosotros, Contacto — on the Geodot Design System, mirroring the vigialegal.mx / talen.to stack.

**Architecture:** Next.js App Router with `[locale]` routing via next-intl (`localePrefix: "as-needed"` → ES at root, EN at `/en`). All copy in `messages/{es,en}.json` namespaced per page; components read via `useTranslations`. Tailwind v4 with the Geodot `@theme` in `globals.css`. Reusable section components composed per page. Contact form via server action + Resend + zod.

**Tech Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind v4 (`@tailwindcss/postcss`), next-intl 4, motion 11, resend 6, zod 4.

**Spec:** `docs/superpowers/specs/2026-05-29-geodot-web-design.md`
**Design system source:** `../geodot-design-system/` (`theme.css`, `variables.css`, `DESIGN.md`)
**Copy sources:** `content/*.md` + `presentaciones/content/*.md` (Spanish → translate polished EN).

**Working directory:** `/Users/fran/Documents/Geodot/geodot-web` (git already re-initialized; commit per task).

> **Fonts (confirmed):** Space Grotesk (display/headings, weights 300–700) + Hanken Grotesk (body/UI, weights 300–800), both via `next/font/google`. Wired in Task 4 (`next/font`) and Task 3 (`@theme` vars).

**Note on testing:** This is a content/marketing site. "Verify" steps use `next build`, `next lint`, dev-server render, and Playwright browser checks rather than unit tests — except the contact form's zod schema, which gets a real unit test (Task 11). Commit after every task.

---

## Task 1: Scaffold project (package.json, configs, tsconfig)

**Files:**
- Create: `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `.env.example`, `next-env.d.ts` (auto)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "geodot-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "motion": "^11.18.0",
    "next": "^16.2.6",
    "next-intl": "^4.11.2",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "resend": "^6.12.3",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4.0.0",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create `.env.example`**

```bash
# Resend (Fran configures .env.local with the real key)
RESEND_API_KEY=
CONTACT_TO=hola@geodot.app
CONTACT_FROM="Geodot Web <web@geodot.app>"

# Site URL for metadata / OG (Vercel)
NEXT_PUBLIC_SITE_URL=https://geodot.app
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: deps install, `package-lock.json` created, no peer-dep errors that block build.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json next.config.ts postcss.config.mjs tsconfig.json .env.example
git commit -m "chore: scaffold Next.js + Tailwind v4 + next-intl config"
```

---

## Task 2: next-intl routing, request config, middleware

**Files:**
- Create: `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `proxy.ts`, `messages/es.json`, `messages/en.json`

- [ ] **Step 1: Create `i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"] as const,
  defaultLocale: "es",
  localePrefix: "as-needed", // ES at root, EN at /en
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: Create `i18n/request.ts`**

```ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create `i18n/navigation.ts`**

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 4: Create `proxy.ts`** (next-intl middleware)

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 5: Create seed `messages/es.json` and `messages/en.json`**

`messages/es.json`:
```json
{
  "meta": {
    "title": "Geodot — Plataforma logística con IA",
    "description": "WMS, TMS, ruteo inteligente y paletizado en una sola plataforma con IA.",
    "ogTitle": "Geodot — Conectamos cada punto de tu cadena logística",
    "ogDescription": "Reduce costos, elimina rechazos y obtén visibilidad total en tiempo real."
  },
  "nav": {
    "plataforma": "Plataforma",
    "industrias": "Industrias",
    "casos": "Casos de éxito",
    "nosotros": "Nosotros",
    "cta": "Agendar Demo"
  }
}
```

`messages/en.json`:
```json
{
  "meta": {
    "title": "Geodot — AI-powered logistics platform",
    "description": "WMS, TMS, smart routing and palletizing in a single AI platform.",
    "ogTitle": "Geodot — Connect every point of your supply chain",
    "ogDescription": "Cut costs, eliminate rejections and get full real-time visibility."
  },
  "nav": {
    "plataforma": "Platform",
    "industrias": "Industries",
    "casos": "Case studies",
    "nosotros": "About",
    "cta": "Book a Demo"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add i18n proxy.ts messages
git commit -m "feat: next-intl routing, request config, middleware, seed messages"
```

---

## Task 3: Design system — globals.css (@theme) + fonts + base layer

**Files:**
- Create: `app/[locale]/globals.css`
- Reference: `../geodot-design-system/theme.css`

- [ ] **Step 1: Create `app/[locale]/globals.css`**

Copy the full `@theme` block from `../geodot-design-system/theme.css` (teal/magenta/navy ramps, periwinkle, feedback, fonts, type scale, weights, spacing, radius, shadows). Wire fonts to the `next/font` CSS vars and add the base layer:

```css
@import "tailwindcss";

@theme {
  /* ===== paste the full @theme block from geodot-design-system/theme.css ===== */
  /* Colors — Teal */
  --color-teal-50: #E6F7F5;  --color-teal-100: #C0ECE8; --color-teal-200: #8DDDD5;
  --color-teal-300: #4DCABE; --color-teal-400: #1AB7A8; --color-teal-500: #00A99D;
  --color-teal-600: #008C82; --color-teal-700: #006F67; --color-teal-800: #00524C;
  --color-teal-900: #003733;
  /* Colors — Magenta */
  --color-magenta-50: #FCE7EE;  --color-magenta-100: #F8C2D4; --color-magenta-200: #F08AAC;
  --color-magenta-300: #E85183; --color-magenta-400: #E02E6C; --color-magenta-500: #D4145A;
  --color-magenta-600: #B30E4B; --color-magenta-700: #8F0B3C; --color-magenta-800: #6B082D;
  --color-magenta-900: #48051E;
  /* Colors — Navy / Neutral */
  --color-navy-50: #F2F4F9;  --color-navy-100: #E2E6F0; --color-navy-200: #C5CCDE;
  --color-navy-300: #9BA6C2; --color-navy-400: #6B789B; --color-navy-500: #4A5778;
  --color-navy-600: #364261; --color-navy-700: #253354; --color-navy-800: #18233F;
  --color-navy-900: #0E172D; --color-navy-950: #080F1F;
  --color-periwinkle: #525F9E;
  --color-success: #1FA971; --color-warning: #C8851A; --color-error: #D4145A; --color-info: #2874FC;
  /* Fonts (vars provided by next/font in layout.tsx) */
  --font-display: var(--font-space-grotesk), system-ui, sans-serif;
  --font-body: var(--font-hanken), system-ui, sans-serif;
  /* Type scale */
  --text-display-2xl: 72px; --text-display-2xl--line-height: 1.05; --text-display-2xl--letter-spacing: -0.02em;
  --text-display-xl: 56px;  --text-display-xl--line-height: 1.08;  --text-display-xl--letter-spacing: -0.02em;
  --text-display-lg: 44px;  --text-display-lg--line-height: 1.10;  --text-display-lg--letter-spacing: -0.01em;
  --text-heading-xl: 32px;  --text-heading-xl--line-height: 1.15;  --text-heading-xl--letter-spacing: -0.01em;
  --text-heading-lg: 28px;  --text-heading-lg--line-height: 1.20;
  --text-heading-md: 22px;  --text-heading-md--line-height: 1.30;
  --text-heading-sm: 18px;  --text-heading-sm--line-height: 1.40;
  --text-body-lg: 18px;     --text-body-lg--line-height: 1.60;
  --text-body-md: 16px;     --text-body-md--line-height: 1.60;
  --text-body-sm: 14px;     --text-body-sm--line-height: 1.50;
  --text-caption: 13px;     --text-caption--line-height: 1.40;
  --text-overline: 12px;    --text-overline--line-height: 1.30; --text-overline--letter-spacing: 0.08em;
  /* Weights */
  --font-weight-light: 300; --font-weight-regular: 400; --font-weight-medium: 500;
  --font-weight-semibold: 600; --font-weight-bold: 700;
  /* Spacing */
  --spacing-0: 0; --spacing-1: 4px; --spacing-2: 8px; --spacing-3: 12px; --spacing-4: 16px;
  --spacing-5: 20px; --spacing-6: 24px; --spacing-8: 32px; --spacing-10: 40px; --spacing-12: 48px;
  --spacing-16: 64px; --spacing-20: 80px; --spacing-24: 96px; --spacing-32: 128px;
  /* Radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 20px; --radius-2xl: 28px; --radius-full: 9999px;
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(14,23,45,0.06);
  --shadow-sm: 0 2px 8px rgba(14,23,45,0.08);
  --shadow-md: 0 8px 24px rgba(14,23,45,0.10);
  --shadow-lg: 0 16px 48px rgba(14,23,45,0.14);
}

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
    overflow-x: clip;
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  body {
    font-family: var(--font-body);
    background: var(--color-white, #ffffff);
    color: var(--color-navy-900);
    min-height: 100dvh;
  }
  h1, h2, h3, h4 { font-family: var(--font-display); }
  ::selection { background: var(--color-teal-500); color: #ffffff; }
}
```

- [ ] **Step 2: Commit**

```bash
git add app
git commit -m "feat: Geodot design-system @theme + base layer in globals.css"
```

---

## Task 4: Locale layout (fonts, providers, metadata)

**Files:**
- Create: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create `app/[locale]/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://geodot.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "en" ? "/en" : "";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: "%s · Geodot" },
    description: t("description"),
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_MX",
      url: `${SITE_URL}${path}`,
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "Geodot",
    },
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: { es: SITE_URL, en: `${SITE_URL}/en` },
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale === "en" ? "en" : "es-MX"} className={`${spaceGrotesk.variable} ${hanken.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create temporary stubs so the build compiles** (`components/Nav.tsx`, `components/Footer.tsx`)

```tsx
// components/Nav.tsx
export function Nav() { return <nav />; }
```
```tsx
// components/Footer.tsx
export function Footer() { return <footer />; }
```

- [ ] **Step 3: Commit**

```bash
git add app components
git commit -m "feat: locale layout with Space Grotesk/Hanken Grotesk fonts, providers, metadata"
```

---

## Task 5: Home placeholder + verify dev server (both locales)

**Files:**
- Create: `app/[locale]/page.tsx`

- [ ] **Step 1: Create minimal `app/[locale]/page.tsx`**

```tsx
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations("nav");
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <h1 className="text-display-xl font-bold text-navy-900">Geodot</h1>
      <p className="mt-4 text-body-lg text-navy-600">{t("cta")}</p>
    </section>
  );
}
```

- [ ] **Step 2: Run dev server and verify both locales render**

Run: `npm run dev` (background), then with Playwright open `http://localhost:3000/` and `http://localhost:3000/en`.
Expected: ES shows "Agendar Demo", EN shows "Book a Demo"; Space Grotesk on the H1, Hanken Grotesk on the paragraph; navy text color applied. No console errors.

- [ ] **Step 3: Commit**

```bash
git add app
git commit -m "feat: home placeholder, verify bilingual rendering + fonts"
```

---

## Task 6: lib registries (modules, industries) + tokens helpers

**Files:**
- Create: `lib/modules.ts`, `lib/industries.ts`

- [ ] **Step 1: Create `lib/modules.ts`** (drives Plataforma overview, ModuleGrid, `[modulo]` routes)

```ts
export const MODULE_SLUGS = ["wms", "tms", "paletizado", "torre-control"] as const;
export type ModuleSlug = (typeof MODULE_SLUGS)[number];

// icon = lucide icon name; messageKey = namespace in messages JSON (modules.<key>)
export const MODULES: Record<ModuleSlug, { icon: string; messageKey: string }> = {
  "wms":           { icon: "warehouse",   messageKey: "wms" },
  "tms":           { icon: "truck",       messageKey: "tms" },
  "paletizado":    { icon: "boxes",       messageKey: "paletizado" },
  "torre-control": { icon: "radar",       messageKey: "torreControl" },
};
```

- [ ] **Step 2: Create `lib/industries.ts`**

```ts
export const INDUSTRY_SLUGS = ["bebidas", "alimentos", "gobierno-residuos", "3pl"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export const INDUSTRIES: Record<IndustrySlug, { icon: string; messageKey: string }> = {
  "bebidas":           { icon: "bottle-wine", messageKey: "bebidas" },
  "alimentos":         { icon: "milk",        messageKey: "alimentos" },
  "gobierno-residuos": { icon: "recycle",     messageKey: "gobiernoResiduos" },
  "3pl":               { icon: "package",     messageKey: "logistica3pl" },
};
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib
git commit -m "feat: module + industry registries"
```

---

## Task 7: Reusable UI primitives — Section (rewrite), Container, AnimatedCounter (keep)

**Files:**
- Create: `components/ui/Container.tsx`
- Modify/replace: `src/components/ui/Section.tsx` → move to `components/ui/Section.tsx` (rewrite to tokens)
- Keep: move `src/components/ui/AnimatedCounter.tsx` → `components/ui/AnimatedCounter.tsx` (unchanged)

- [ ] **Step 1: Move AnimatedCounter** into `components/ui/AnimatedCounter.tsx` (copy file content verbatim from `src/components/ui/AnimatedCounter.tsx`; delete the `src/` copy).

- [ ] **Step 2: Create `components/ui/Container.tsx`**

```tsx
import { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 md:px-8 ${className}`}>{children}</div>;
}
```

- [ ] **Step 3: Create `components/ui/Section.tsx`** (rewritten to design-system tokens — replaces the old `#0a0f1a` + teal→cyan version)

```tsx
import { ReactNode } from "react";
import { Container } from "./Container";

type Tone = "base" | "subtle" | "dark";

const TONE: Record<Tone, string> = {
  base: "bg-white text-navy-900",
  subtle: "bg-navy-50 text-navy-900",
  dark: "bg-navy-900 text-white",
};

export function Section({
  children, id, tone = "base", className = "",
}: { children: ReactNode; id?: string; tone?: Tone; className?: string }) {
  return (
    <section id={id} className={`relative overflow-hidden py-20 md:py-24 ${TONE[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow, title, titleAccent, description, align = "center",
}: {
  eyebrow?: string; title: string; titleAccent?: string; description?: string; align?: "left" | "center";
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`mb-12 max-w-3xl ${alignment}`}>
      {eyebrow && (
        <span className="mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-600">
          {eyebrow}
        </span>
      )}
      <h2 className="text-heading-xl md:text-display-lg font-semibold text-[color:inherit]">
        {title} {titleAccent && <span className="text-teal-500">{titleAccent}</span>}
      </h2>
      {description && <p className="mt-4 text-body-lg text-navy-600">{description}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Verify typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: compiles; no references to the old `src/components` path remain.

- [ ] **Step 5: Commit**

```bash
git add components && git rm -r src
git commit -m "feat: Container + Section rewritten to design-system tokens; keep AnimatedCounter"
```

---

## Task 8: Button + CTA components

**Files:**
- Create: `components/ui/Button.tsx`

- [ ] **Step 1: Create `components/ui/Button.tsx`** (per DESIGN.md button specs: primary magenta pill, secondary teal, outline, ghost)

```tsx
import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "outline" | "ghost";
const BASE = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/45";
const SIZES = "px-7 py-3.5 text-[15px]";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-magenta-500 text-white hover:bg-magenta-600 shadow-sm",
  secondary: "bg-teal-500 text-white hover:bg-teal-600",
  outline: "border-2 border-magenta-500 text-magenta-600 hover:bg-magenta-50",
  ghost: "text-teal-600 hover:bg-navy-50 rounded-[10px]",
};

export function Button({
  children, href, variant = "primary", className = "",
}: { children: ReactNode; href: string; variant?: Variant; className?: string }) {
  return (
    <Link href={href} className={`${BASE} ${SIZES} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat: Button component (primary/secondary/outline/ghost)"
```

---

## Task 9: Nav + LocaleSwitch + Footer

**Files:**
- Replace stubs: `components/Nav.tsx`, `components/Footer.tsx`
- Create: `components/LocaleSwitch.tsx`

- [ ] **Step 1: Create `components/LocaleSwitch.tsx`**

```tsx
"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const toggle = () => router.replace(pathname, { locale: locale === "es" ? "en" : "es" });
  return (
    <button onClick={toggle} className="text-body-sm font-medium text-navy-600 hover:text-teal-600" aria-label="Switch language">
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
```

- [ ] **Step 2: Create `components/Nav.tsx`** (sticky, logo, menu, pill CTA, LocaleSwitch; mobile drawer)

```tsx
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "./LocaleSwitch";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

export function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/plataforma", label: t("plataforma") },
    { href: "/industrias/bebidas", label: t("industrias") },
    { href: "/casos-exito", label: t("casos") },
    { href: "/nosotros", label: t("nosotros") },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-heading-md font-bold text-navy-900">geo<span className="text-teal-500">dot</span></Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-body-sm font-medium text-navy-700 hover:text-teal-600">{l.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <LocaleSwitch />
          <Button href="/contacto">{t("cta")}</Button>
        </div>
        <button className="md:hidden text-navy-900" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      </Container>
      {open && (
        <div className="border-t border-navy-100 bg-white md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-body-md text-navy-700" onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            <div className="flex items-center justify-between"><LocaleSwitch /><Button href="/contacto">{t("cta")}</Button></div>
          </Container>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Create `components/Footer.tsx`** (logo, columns from nav + legal, locale-aware links; copy from `footer` namespace added in Step 4)

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "./ui/Container";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-navy-900 text-navy-200">
      <Container className="grid gap-8 py-16 md:grid-cols-4">
        <div>
          <span className="text-heading-md font-bold text-white">geo<span className="text-teal-400">dot</span></span>
          <p className="mt-3 text-body-sm text-navy-300">{t("tagline")}</p>
        </div>
        <div>
          <h3 className="mb-3 text-overline uppercase tracking-wide text-navy-400">{t("platform")}</h3>
          <Link href="/plataforma" className="block text-body-sm hover:text-teal-300">{t("allModules")}</Link>
        </div>
        <div>
          <h3 className="mb-3 text-overline uppercase tracking-wide text-navy-400">{t("company")}</h3>
          <Link href="/nosotros" className="block text-body-sm hover:text-teal-300">{t("about")}</Link>
          <Link href="/casos-exito" className="block text-body-sm hover:text-teal-300">{t("cases")}</Link>
        </div>
        <div>
          <h3 className="mb-3 text-overline uppercase tracking-wide text-navy-400">{t("contact")}</h3>
          <Link href="/contacto" className="block text-body-sm hover:text-teal-300">{t("demo")}</Link>
        </div>
      </Container>
      <div className="border-t border-navy-800 py-6 text-center text-caption text-navy-400">{t("rights")}</div>
    </footer>
  );
}
```

- [ ] **Step 4: Add `footer` namespace to both messages files**

`messages/es.json` (add key): `"footer": { "tagline": "Conectamos cada punto de tu cadena logística.", "platform": "Plataforma", "allModules": "Todos los módulos", "company": "Empresa", "about": "Nosotros", "cases": "Casos de éxito", "contact": "Contacto", "demo": "Agendar demo", "rights": "© 2026 Geodot. Todos los derechos reservados." }`

`messages/en.json` (add key): `"footer": { "tagline": "We connect every point of your supply chain.", "platform": "Platform", "allModules": "All modules", "company": "Company", "about": "About", "cases": "Case studies", "contact": "Contact", "demo": "Book a demo", "rights": "© 2026 Geodot. All rights reserved." }`

- [ ] **Step 5: Verify in browser (both locales)**

Run: dev server; Playwright check `/` and `/en`.
Expected: sticky nav with logo (teal "dot"), menu labels localized, pill CTA, LocaleSwitch toggles ES↔EN and stays on the same page; footer renders dark with localized columns.

- [ ] **Step 6: Commit**

```bash
git add components messages
git commit -m "feat: Nav, LocaleSwitch, Footer with localized copy"
```

---

## Task 10: Section components — Hero, ProblemStats, ModuleGrid, MetricsBand, SolutionSteps, CasesStrip, CTABanner

**Files:**
- Create: `components/Hero.tsx`, `components/ProblemStats.tsx`, `components/ModuleGrid.tsx`, `components/MetricsBand.tsx`, `components/SolutionSteps.tsx`, `components/CasesStrip.tsx`, `components/CTABanner.tsx`

Each is presentational, props-driven (copy passed in by pages). Build each with design-system tokens and `motion` for entrance animations (respecting reduced-motion via the global CSS reset).

- [ ] **Step 1: Create `components/Hero.tsx`**

```tsx
import { ReactNode } from "react";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

export function Hero({
  eyebrow, title, titleAccent, subtitle, primaryCta, secondaryCta, variant = "dark", visual,
}: {
  eyebrow?: string; title: string; titleAccent?: string; subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "dark" | "light"; visual?: ReactNode;
}) {
  const dark = variant === "dark";
  return (
    <section className={dark ? "bg-navy-900 text-white" : "bg-white text-navy-900"}>
      <Container className="grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div>
          {eyebrow && <span className="mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-400">{eyebrow}</span>}
          <h1 className="text-display-lg md:text-display-2xl font-bold leading-tight">
            {title} {titleAccent && <span className="text-teal-400">{titleAccent}</span>}
          </h1>
          <p className={`mt-6 text-body-lg ${dark ? "text-navy-200" : "text-navy-600"}`}>{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
            {secondaryCta && <Button href={secondaryCta.href} variant={dark ? "outline" : "secondary"}>{secondaryCta.label}</Button>}
          </div>
        </div>
        {visual && <div className="relative">{visual}</div>}
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/MetricsBand.tsx`** (uses AnimatedCounter)

```tsx
import { AnimatedCounter } from "./ui/AnimatedCounter";
import { Container } from "./ui/Container";

export function MetricsBand({ items, tone = "subtle" }: {
  items: { value: number; suffix?: string; prefix?: string; label: string }[];
  tone?: "subtle" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <section className={dark ? "bg-navy-900" : "bg-navy-50"}>
      <Container className="grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m, i) => (
          <div key={i} className="text-center">
            <div className={`text-display-lg font-bold ${dark ? "text-teal-400" : "text-teal-600"}`}>
              <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <p className={`mt-2 text-body-sm ${dark ? "text-navy-200" : "text-navy-600"}`}>{m.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/ProblemStats.tsx`** (pain-point list + stat rows)

```tsx
import { Section, SectionHeader } from "./ui/Section";

export function ProblemStats({ eyebrow, title, titleAccent, points, stats }: {
  eyebrow?: string; title: string; titleAccent?: string;
  points: string[]; stats: { problem: string; impact: string }[];
}) {
  return (
    <Section tone="base">
      <SectionHeader eyebrow={eyebrow} title={title} titleAccent={titleAccent} align="left" />
      <div className="grid gap-12 md:grid-cols-2">
        <ul className="space-y-4">
          {points.map((p, i) => (
            <li key={i} className="flex gap-3 text-body-md text-navy-700">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-magenta-500" />{p}
            </li>
          ))}
        </ul>
        <div className="overflow-hidden rounded-lg border border-navy-100">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-navy-100 px-5 py-4 last:border-0">
              <span className="text-body-sm text-navy-600">{s.problem}</span>
              <span className="text-heading-sm font-semibold text-magenta-600">{s.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Create `components/ModuleGrid.tsx`** (cards linking to module pages; reads MODULES registry, copy via `modules` namespace)

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODULES, MODULE_SLUGS } from "@/lib/modules";
import { Section, SectionHeader } from "./ui/Section";

export function ModuleGrid({ eyebrow, title, titleAccent, description }: {
  eyebrow?: string; title: string; titleAccent?: string; description?: string;
}) {
  const t = useTranslations("modules");
  return (
    <Section tone="subtle">
      <SectionHeader eyebrow={eyebrow} title={title} titleAccent={titleAccent} description={description} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {MODULE_SLUGS.map((slug) => {
          const key = MODULES[slug].messageKey;
          return (
            <Link key={slug} href={`/plataforma/${slug}`}
              className="group rounded-lg border border-navy-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-heading-sm font-semibold text-navy-900 group-hover:text-teal-600">{t(`${key}.name`)}</h3>
              <p className="mt-2 text-body-sm text-navy-600">{t(`${key}.tagline`)}</p>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Create `components/SolutionSteps.tsx`**

```tsx
import { Section, SectionHeader } from "./ui/Section";

export function SolutionSteps({ eyebrow, title, steps }: {
  eyebrow?: string; title: string; steps: { title: string; description: string }[];
}) {
  return (
    <Section tone="base">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <ol className="grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={i} className="rounded-lg border border-navy-100 p-6">
            <span className="text-display-lg font-bold text-teal-500">{i + 1}</span>
            <h3 className="mt-3 text-heading-sm font-semibold text-navy-900">{s.title}</h3>
            <p className="mt-2 text-body-sm text-navy-600">{s.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 6: Create `components/CasesStrip.tsx`** (case copy + metrics; NO client logos per spec)

```tsx
import { Section, SectionHeader } from "./ui/Section";

export function CasesStrip({ eyebrow, title, cases }: {
  eyebrow?: string; title: string; cases: { client: string; result: string; metric: string }[];
}) {
  return (
    <Section tone="subtle">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="grid gap-6 md:grid-cols-3">
        {cases.map((c, i) => (
          <div key={i} className="rounded-lg border border-navy-100 bg-white p-6">
            <p className="text-heading-md font-semibold text-magenta-600">{c.metric}</p>
            <p className="mt-2 text-body-md text-navy-900">{c.result}</p>
            <p className="mt-4 text-caption uppercase tracking-wide text-navy-400">{c.client}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 7: Create `components/CTABanner.tsx`**

```tsx
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

export function CTABanner({ title, subtitle, cta }: { title: string; subtitle: string; cta: { label: string; href: string } }) {
  return (
    <section className="bg-[image:var(--gradient-midnight)] bg-navy-900">
      <Container className="flex flex-col items-center gap-6 py-20 text-center">
        <h2 className="max-w-2xl text-display-lg font-bold text-white">{title}</h2>
        <p className="max-w-xl text-body-lg text-navy-200">{subtitle}</p>
        <Button href={cta.href} variant="primary">{cta.label}</Button>
      </Container>
    </section>
  );
}
```

- [ ] **Step 8: Verify typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: compiles. (Pages referencing these come next.)

- [ ] **Step 9: Commit**

```bash
git add components
git commit -m "feat: section components (Hero, ProblemStats, ModuleGrid, MetricsBand, SolutionSteps, CasesStrip, CTABanner)"
```

---

## Task 11: Contact form + Resend server action + zod (with unit test)

**Files:**
- Create: `lib/contact-schema.ts`, `lib/contact-schema.test.ts`, `app/actions/contact.ts`, `components/ContactForm.tsx`, `app/[locale]/contacto/page.tsx`

- [ ] **Step 1: Write the failing schema test** `lib/contact-schema.test.ts`

```ts
import { contactSchema } from "./contact-schema";

const valid = { nombre: "Ana", empresa: "Acme", email: "ana@acme.com", telefono: "+52 55 1234 5678", industria: "bebidas", mensaje: "Quiero una demo del WMS por favor.", website: "" };

test("accepts a valid payload", () => {
  expect(contactSchema.safeParse(valid).success).toBe(true);
});
test("rejects a bad email", () => {
  expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
});
test("rejects when honeypot 'website' is filled", () => {
  expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
});
test("rejects too-short message", () => {
  expect(contactSchema.safeParse({ ...valid, mensaje: "hi" }).success).toBe(false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx --test lib/contact-schema.test.ts` (or `node --test` after compiling). 
Expected: FAIL — `contact-schema` not found.

- [ ] **Step 3: Implement `lib/contact-schema.ts`**

```ts
import { z } from "zod";

export const contactSchema = z.object({
  nombre: z.string().min(2).max(80),
  empresa: z.string().min(2).max(120),
  email: z.string().email(),
  telefono: z.string().max(40).optional().or(z.literal("")),
  industria: z.string().max(60).optional().or(z.literal("")),
  mensaje: z.string().min(10).max(2000),
  website: z.literal(""), // honeypot: must be empty
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx tsx --test lib/contact-schema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Implement `app/actions/contact.ts`**

```ts
"use server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContact(_prev: ContactResult | null, formData: FormData): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "validation" };

  const { nombre, empresa, email, telefono, industria, mensaje } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "config" };

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.CONTACT_FROM ?? "Geodot Web <web@geodot.app>",
      to: process.env.CONTACT_TO ?? "hola@geodot.app",
      replyTo: email,
      subject: `Demo request — ${empresa}`,
      text: `Nombre: ${nombre}\nEmpresa: ${empresa}\nEmail: ${email}\nTel: ${telefono}\nIndustria: ${industria}\n\n${mensaje}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "send" };
  }
}
```

- [ ] **Step 6: Implement `components/ContactForm.tsx`** (client, `useActionState`, honeypot, localized labels via `contact` namespace)

```tsx
"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContact, type ContactResult } from "@/app/actions/contact";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(submitContact, null);

  if (state?.ok) return <p className="rounded-lg bg-[color:var(--color-success)]/10 p-6 text-body-md text-[color:var(--color-success)]">{t("success")}</p>;

  return (
    <form action={action} className="grid gap-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input name="nombre" required placeholder={t("name")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <input name="empresa" required placeholder={t("company")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <input name="email" type="email" required placeholder={t("email")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <input name="telefono" placeholder={t("phone")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      <textarea name="mensaje" required rows={4} placeholder={t("message")} className="rounded-md border border-navy-200 px-4 py-3 text-body-md" />
      {state && !state.ok && <p className="text-body-sm text-[color:var(--color-error)]">{t("error")}</p>}
      <button type="submit" disabled={pending}
        className="rounded-full bg-magenta-500 px-7 py-3.5 text-[15px] font-semibold text-white hover:bg-magenta-600 disabled:opacity-60">
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
```

- [ ] **Step 7: Create `app/[locale]/contacto/page.tsx`**

```tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { Section, SectionHeader } from "@/components/ui/Section";

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  return (
    <Section tone="subtle">
      <div className="mx-auto max-w-xl">
        <SectionHeader title={t("title")} description={t("subtitle")} />
        <ContactForm />
      </div>
    </Section>
  );
}
```

- [ ] **Step 8: Add `contact` namespace to both messages files**

`messages/es.json`: `"contact": { "title": "Agendá tu demo", "subtitle": "Contanos de tu operación y te mostramos Geodot en acción.", "form": { "name": "Nombre", "company": "Empresa", "email": "Email", "phone": "Teléfono", "message": "Contanos sobre tu operación", "submit": "Solicitar demo", "sending": "Enviando…", "success": "¡Gracias! Te contactamos a la brevedad.", "error": "Revisá los datos e intentá de nuevo." } }`

`messages/en.json`: `"contact": { "title": "Book your demo", "subtitle": "Tell us about your operation and we'll show you Geodot in action.", "form": { "name": "Name", "company": "Company", "email": "Email", "phone": "Phone", "message": "Tell us about your operation", "submit": "Request demo", "sending": "Sending…", "success": "Thanks! We'll be in touch shortly.", "error": "Please check your details and try again." } }`

- [ ] **Step 9: Verify (build + browser, no key needed)**

Run: `npm run build`; dev server; Playwright open `/contacto` and `/en/contacto`. Submit empty → validation error shown. Submit valid without key → "config" path returns the localized error (expected until Fran sets `RESEND_API_KEY`).
Expected: form renders localized; client validation + server validation paths work.

- [ ] **Step 10: Commit**

```bash
git add lib app components messages
git commit -m "feat: contact form with Resend action + zod schema (tested)"
```

---

## Task 12: Home page (full) — the molde

**Files:**
- Replace: `app/[locale]/page.tsx`
- Copy source: `content/01-home.md`

- [ ] **Step 1: Replace `app/[locale]/page.tsx`** composing the sections

```tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { ProblemStats } from "@/components/ProblemStats";
import { ModuleGrid } from "@/components/ModuleGrid";
import { MetricsBand } from "@/components/MetricsBand";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <Hero
        title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.ctaPrimary"), href: "/contacto" }}
        secondaryCta={{ label: t("hero.ctaSecondary"), href: "/plataforma" }}
        variant="dark"
      />
      <ProblemStats
        eyebrow={t("problem.eyebrow")} title={t("problem.title")} titleAccent={t("problem.titleAccent")}
        points={t.raw("problem.points") as string[]}
        stats={t.raw("problem.stats") as { problem: string; impact: string }[]}
      />
      <ModuleGrid eyebrow={t("platform.eyebrow")} title={t("platform.title")} titleAccent={t("platform.titleAccent")} description={t("platform.description")} />
      <MetricsBand items={t.raw("metrics") as { value: number; suffix?: string; label: string }[]} />
      <CasesStrip eyebrow={t("cases.eyebrow")} title={t("cases.title")} cases={t.raw("cases.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
```

- [ ] **Step 2: Add the `home` namespace to `messages/es.json`** — translate copy from `content/01-home.md` into this exact structure:

```json
"home": {
  "hero": { "title": "Conectamos cada punto de tu", "titleAccent": "cadena logística", "subtitle": "La única plataforma que integra WMS, TMS, Ruteo Inteligente y Paletizado con IA. Reduce costos, elimina rechazos y obtén visibilidad total en tiempo real.", "ctaPrimary": "Agendar Demo", "ctaSecondary": "Ver plataforma" },
  "problem": { "eyebrow": "El problema", "title": "Tu logística tiene fugas que", "titleAccent": "no puedes ver",
    "points": ["El 91% de los camiones salen con espacio sin usar.", "Las rutas se planifican manualmente.", "Los rechazos se descubren cuando ya es tarde.", "Cada sistema habla un idioma diferente."],
    "stats": [{ "problem": "Camiones subutilizados", "impact": "+15% costos" }, { "problem": "Rutas no optimizadas", "impact": "+20% km" }, { "problem": "Sin visibilidad", "impact": "+25% rechazos" }, { "problem": "Sistemas desconectados", "impact": "Horas perdidas" }] },
  "platform": { "eyebrow": "La plataforma", "title": "Una plataforma.", "titleAccent": "Toda tu logística.", "description": "Geodot integra almacén, transporte, ruteo y paletizado en una sola plataforma con IA." },
  "metrics": [{ "value": 10, "suffix": "%", "label": "Ahorro en transporte" }, { "value": 20, "suffix": "%", "label": "Menos kilómetros" }, { "value": 30, "suffix": "%", "label": "Menos rechazos" }, { "value": 100, "suffix": "%", "label": "Visibilidad en tiempo real" }],
  "cases": { "eyebrow": "Casos de éxito", "title": "Resultados reales",
    "items": [{ "metric": "−10%", "result": "Reducción de costos de transporte", "client": "Embotelladora" }, { "metric": "−30%", "result": "Menos rechazos en entregas", "client": "Lácteos" }, { "metric": "100%", "result": "Trazabilidad de residuos", "client": "Gobierno municipal" }] },
  "cta": { "title": "¿Listo para conectar tu logística?", "subtitle": "Agendá una demo y te mostramos Geodot con tus propios datos.", "button": "Agendar Demo" }
}
```

- [ ] **Step 3: Add the `home` namespace to `messages/en.json`** — polished English mirror of the same structure (translate every string; keep numeric `value` fields identical):

```json
"home": {
  "hero": { "title": "Connect every point of your", "titleAccent": "supply chain", "subtitle": "The only platform that integrates WMS, TMS, Smart Routing and Palletizing with AI. Cut costs, eliminate rejections and get full real-time visibility.", "ctaPrimary": "Book a Demo", "ctaSecondary": "Explore the platform" },
  "problem": { "eyebrow": "The problem", "title": "Your logistics has leaks you", "titleAccent": "can't see",
    "points": ["91% of trucks leave with unused space.", "Routes are planned manually.", "Rejections surface when it's already too late.", "Every system speaks a different language."],
    "stats": [{ "problem": "Underused trucks", "impact": "+15% cost" }, { "problem": "Unoptimized routes", "impact": "+20% km" }, { "problem": "No visibility", "impact": "+25% rejections" }, { "problem": "Disconnected systems", "impact": "Hours lost" }] },
  "platform": { "eyebrow": "The platform", "title": "One platform.", "titleAccent": "All your logistics.", "description": "Geodot integrates warehouse, transport, routing and palletizing into a single AI platform." },
  "metrics": [{ "value": 10, "suffix": "%", "label": "Transport savings" }, { "value": 20, "suffix": "%", "label": "Fewer kilometers" }, { "value": 30, "suffix": "%", "label": "Fewer rejections" }, { "value": 100, "suffix": "%", "label": "Real-time visibility" }],
  "cases": { "eyebrow": "Case studies", "title": "Real results",
    "items": [{ "metric": "−10%", "result": "Lower transport costs", "client": "Beverage bottler" }, { "metric": "−30%", "result": "Fewer delivery rejections", "client": "Dairy" }, { "metric": "100%", "result": "Waste traceability", "client": "Municipal government" }] },
  "cta": { "title": "Ready to connect your logistics?", "subtitle": "Book a demo and we'll show you Geodot with your own data.", "button": "Book a Demo" }
}
```

- [ ] **Step 4: Verify Home in browser (both locales)**

Run: dev server; Playwright `/` and `/en`. Check hero (dark, teal accent word), problem stats, module grid (4 cards), metrics counting animation, cases (no logos), CTA banner. Mobile + desktop. No console errors.

- [ ] **Step 5: Commit**

```bash
git add app messages
git commit -m "feat: full Home page (ES + EN)"
```

---

## Task 13: Product page template + 4 product pages

**Files:**
- Create: `app/[locale]/plataforma/[modulo]/page.tsx`
- Copy sources: `content/02a-wms.md`, `02b-tms.md`, `02d-paletizado.md`, `02e-torre-control.md` (+ `presentaciones/content/*.md` for enrichment)

- [ ] **Step 1: Create the dynamic product page** `app/[locale]/plataforma/[modulo]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MODULE_SLUGS, MODULES, type ModuleSlug } from "@/lib/modules";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/Hero";
import { ProblemStats } from "@/components/ProblemStats";
import { SolutionSteps } from "@/components/SolutionSteps";
import { MetricsBand } from "@/components/MetricsBand";
import { CTABanner } from "@/components/CTABanner";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => MODULE_SLUGS.map((modulo) => ({ locale, modulo })));
}

export default async function ModuloPage({ params }: { params: Promise<{ locale: string; modulo: string }> }) {
  const { locale, modulo } = await params;
  if (!MODULE_SLUGS.includes(modulo as ModuleSlug)) notFound();
  setRequestLocale(locale);
  const key = MODULES[modulo as ModuleSlug].messageKey;
  const t = await getTranslations(`modules.${key}`);

  return (
    <>
      <Hero variant="dark" eyebrow={t("eyebrow")} title={t("title")} titleAccent={t("titleAccent")} subtitle={t("subtitle")}
        primaryCta={{ label: t("ctaPrimary"), href: "/contacto" }} />
      <ProblemStats title={t("problem.title")} points={t.raw("problem.points") as string[]} stats={t.raw("problem.stats") as { problem: string; impact: string }[]} />
      <SolutionSteps title={t("solution.title")} steps={t.raw("solution.steps") as { title: string; description: string }[]} />
      <MetricsBand items={t.raw("metrics") as { value: number; suffix?: string; label: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
```

- [ ] **Step 2: Add `modules.wms` (+ name/tagline used by ModuleGrid) to both messages files.** Source: `content/02a-wms.md`. Structure (repeat for each module):

```jsonc
// inside "modules": { ... }
"wms": {
  "name": "WMS", "tagline": "Control total de tu inventario",
  "eyebrow": "Plataforma", "title": "Gestión de Almacenes", "titleAccent": "con IA", "subtitle": "...",
  "problem": { "title": "...", "points": ["..."], "stats": [{ "problem": "...", "impact": "..." }] },
  "solution": { "title": "...", "steps": [{ "title": "...", "description": "..." }] },
  "metrics": [{ "value": 80, "suffix": "%", "label": "..." }],
  "cta": { "title": "...", "subtitle": "...", "button": "Agendar Demo" }
}
```
Fill every string from `02a-wms.md` (ES) and translate to EN. Repeat the same block for `tms` (`02b-tms.md`), `paletizado` (`02d-paletizado.md`), `torreControl` (`02e-torre-control.md`) in both `es.json` and `en.json`.

- [ ] **Step 3: Verify all 4 product pages (both locales)**

Run: dev server; Playwright open `/plataforma/wms`, `/tms`, `/paletizado`, `/torre-control` and their `/en/...` counterparts. Check each renders hero/problem/solution/metrics/CTA with module-specific copy. Open an invalid slug `/plataforma/foo` → 404.
Expected: 8 pages render correctly; module grid links resolve.

- [ ] **Step 4: Commit**

```bash
git add app messages
git commit -m "feat: product page template + WMS/TMS/Paletizado/Torre de Control (ES+EN)"
```

---

## Task 14: Industry page template + 4 industry pages

**Files:**
- Create: `app/[locale]/industrias/[industria]/page.tsx`
- Copy sources: `content/03a..03d`

- [ ] **Step 1: Create the dynamic industry page** `app/[locale]/industrias/[industria]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { INDUSTRY_SLUGS, INDUSTRIES, type IndustrySlug } from "@/lib/industries";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/Hero";
import { ProblemStats } from "@/components/ProblemStats";
import { ModuleGrid } from "@/components/ModuleGrid";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => INDUSTRY_SLUGS.map((industria) => ({ locale, industria })));
}

export default async function IndustriaPage({ params }: { params: Promise<{ locale: string; industria: string }> }) {
  const { locale, industria } = await params;
  if (!INDUSTRY_SLUGS.includes(industria as IndustrySlug)) notFound();
  setRequestLocale(locale);
  const key = INDUSTRIES[industria as IndustrySlug].messageKey;
  const t = await getTranslations(`industries.${key}`);

  return (
    <>
      <Hero variant="dark" eyebrow={t("eyebrow")} title={t("title")} titleAccent={t("titleAccent")} subtitle={t("subtitle")}
        primaryCta={{ label: t("ctaPrimary"), href: "/contacto" }} />
      <ProblemStats title={t("problem.title")} points={t.raw("problem.points") as string[]} stats={t.raw("problem.stats") as { problem: string; impact: string }[]} />
      <ModuleGrid title={t("modules.title")} />
      <CasesStrip title={t("cases.title")} cases={t.raw("cases.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
```

- [ ] **Step 2: Add `industries.<key>` namespaces to both messages files.** Keys: `bebidas` (`03a`), `alimentos` (`03b`), `gobiernoResiduos` (`03c`), `logistica3pl` (`03d`). Structure per industry:

```jsonc
"bebidas": {
  "eyebrow": "Industria", "title": "Bebidas y", "titleAccent": "Embotelladores", "subtitle": "...", "ctaPrimary": "Agendar Demo",
  "problem": { "title": "Desafíos específicos", "points": ["..."], "stats": [{ "problem": "...", "impact": "..." }] },
  "modules": { "title": "Módulos más usados en tu industria" },
  "cases": { "title": "Casos en tu sector", "items": [{ "metric": "...", "result": "...", "client": "..." }] },
  "cta": { "title": "...", "subtitle": "...", "button": "Agendar Demo" }
}
```
Fill from each `03x` MD (ES) + polished EN.

- [ ] **Step 3: Verify all 4 industry pages (both locales)**

Run: dev server; Playwright `/industrias/bebidas|alimentos|gobierno-residuos|3pl` + `/en/...`. Invalid slug → 404.
Expected: 8 pages render with industry copy + module grid + cases + CTA.

- [ ] **Step 4: Commit**

```bash
git add app messages
git commit -m "feat: industry page template + 4 industries (ES+EN)"
```

---

## Task 15: Plataforma overview, Casos, Nosotros pages

**Files:**
- Create: `app/[locale]/plataforma/page.tsx`, `app/[locale]/casos-exito/page.tsx`, `app/[locale]/nosotros/page.tsx`
- Copy sources: `02-soluciones-overview.md`, `04-casos-exito.md`, `06-nosotros.md`

- [ ] **Step 1: Create `app/[locale]/plataforma/page.tsx`** (Hero + ModuleGrid + CTABanner)

```tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { ModuleGrid } from "@/components/ModuleGrid";
import { CTABanner } from "@/components/CTABanner";

export default async function PlataformaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("platformPage");
  return (
    <>
      <Hero variant="dark" eyebrow={t("hero.eyebrow")} title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }} />
      <ModuleGrid title={t("modules.title")} description={t("modules.description")} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
```

- [ ] **Step 2: Create `app/[locale]/casos-exito/page.tsx`** (Hero + CasesStrip + CTABanner)

```tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";

export default async function CasosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("casesPage");
  return (
    <>
      <Hero variant="dark" title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }} />
      <CasesStrip title={t("list.title")} cases={t.raw("list.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
```

- [ ] **Step 3: Create `app/[locale]/nosotros/page.tsx`** (Hero + prose content section + CTABanner)

```tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CTABanner } from "@/components/CTABanner";

export default async function NosotrosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const paras = t.raw("body") as string[];
  return (
    <>
      <Hero variant="dark" title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }} />
      <Section tone="base">
        <SectionHeader title={t("mission.title")} align="left" />
        <div className="max-w-3xl space-y-4">{paras.map((p, i) => <p key={i} className="text-body-lg text-navy-700">{p}</p>)}</div>
      </Section>
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
```

- [ ] **Step 4: Add `platformPage`, `casesPage`, `aboutPage` namespaces to both messages files**, sourcing copy from `02-soluciones-overview.md`, `04-casos-exito.md`, `06-nosotros.md` (ES) + polished EN. Each follows the structure consumed above (`hero.{title,titleAccent,subtitle,cta}`, plus `modules`/`list`/`mission`+`body`, and `cta.{title,subtitle,button}`).

- [ ] **Step 5: Verify (both locales)**

Run: dev server; Playwright `/plataforma`, `/casos-exito`, `/nosotros` + `/en/...`.
Expected: all render with localized copy; module grid + cases populate; nosotros prose shows.

- [ ] **Step 6: Commit**

```bash
git add app messages
git commit -m "feat: Plataforma overview, Casos, Nosotros pages (ES+EN)"
```

---

## Task 16: SEO — per-page metadata, OG image, sitemap, robots, not-found

**Files:**
- Create: `app/[locale]/opengraph-image.tsx`, `app/[locale]/not-found.tsx`, `app/sitemap.ts`, `app/robots.ts`
- Modify: each `page.tsx` to export `generateMetadata`

- [ ] **Step 1: Add `generateMetadata` to each page** using its namespace `meta` sub-keys (title/description). Example for the product page:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string; modulo: string }> }): Promise<import("next").Metadata> {
  const { locale, modulo } = await params;
  const key = MODULES[modulo as ModuleSlug]?.messageKey;
  if (!key) return {};
  const t = await getTranslations({ locale, namespace: `modules.${key}` });
  return { title: t("title"), description: t("subtitle") };
}
```
Add the equivalent to Home, industry, plataforma, casos, nosotros, contacto pages (use each namespace's title/subtitle).

- [ ] **Step 2: Create `app/[locale]/not-found.tsx`**

```tsx
import { Link } from "@/i18n/navigation";
export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-32 text-center">
      <h1 className="text-display-xl font-bold text-navy-900">404</h1>
      <Link href="/" className="text-teal-600 hover:text-teal-700">← Geodot</Link>
    </section>
  );
}
```

- [ ] **Step 3: Create `app/[locale]/opengraph-image.tsx`** (navy bg + teal/magenta logotype via `ImageResponse`)

```tsx
import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", background: "#0E172D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 700, color: "#fff" }}>
      geo<span style={{ color: "#00A99D" }}>dot</span>
    </div>),
    size
  );
}
```

- [ ] **Step 4: Create `app/sitemap.ts` and `app/robots.ts`**

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { MODULE_SLUGS } from "@/lib/modules";
import { INDUSTRY_SLUGS } from "@/lib/industries";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://geodot.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/plataforma", "/casos-exito", "/nosotros", "/contacto",
    ...MODULE_SLUGS.map((m) => `/plataforma/${m}`), ...INDUSTRY_SLUGS.map((i) => `/industrias/${i}`)];
  return paths.flatMap((p) => [
    { url: `${BASE}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 },
    { url: `${BASE}/en${p}`, changeFrequency: "monthly", priority: p === "" ? 0.9 : 0.6 },
  ]);
}
```
```ts
// app/robots.ts
import type { MetadataRoute } from "next";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://geodot.app";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${BASE}/sitemap.xml` };
}
```

- [ ] **Step 5: Verify**

Run: `npm run build`; dev server; check `/sitemap.xml`, `/robots.txt`, `/en/nonexistent` → localized 404, and OG image at `/opengraph-image`.
Expected: all resolve; metadata titles differ per page (view source `<title>`).

- [ ] **Step 6: Commit**

```bash
git add app
git commit -m "feat: per-page metadata, OG image, sitemap, robots, 404"
```

---

## Task 17: Final verification (build, lint, full bilingual walkthrough)

- [ ] **Step 1: Lint + build**

Run: `npm run lint && npm run build`
Expected: lint passes; build completes; all static params (modules × industries × locales) prerender without error.

- [ ] **Step 2: Full Playwright walkthrough (ES)**

Open and visually confirm each page on desktop + mobile viewport: `/`, `/plataforma`, all 4 `/plataforma/<m>`, all 4 `/industrias/<i>`, `/casos-exito`, `/nosotros`, `/contacto`. Check nav links, locale switch, CTA buttons route to `/contacto`, contact form validation. No console errors.

- [ ] **Step 3: Full Playwright walkthrough (EN)**

Repeat for `/en/...` equivalents. Confirm every string is English (no ES leakage), locale switch returns to same page in ES.

- [ ] **Step 4: Report results with evidence**

Summarize: pages verified, screenshots, any issues found/fixed. Do NOT claim success without the walkthrough output.

- [ ] **Step 5: Final commit / tag**

```bash
git add -A
git commit -m "chore: geodot-web Fase 1 complete — bilingual site verified"
```

---

## Self-Review Notes

- **Spec coverage:** stack (T1-2), design system (T3-4), i18n (T2,4), all 13 pages (T12-15), reusable components (T7-10), contact/Resend (T11), git (already done), SEO/OG/Vercel base URL (T16), verification ES+EN (T17). Out-of-scope items (soluciones-por-problema, blog, ROI calc, theme toggle, client logos) correctly omitted.
- **Type consistency:** `MODULES`/`MODULE_SLUGS`/`ModuleSlug` and `INDUSTRIES`/`INDUSTRY_SLUGS`/`IndustrySlug` used consistently across T6/T13/T14/T16. `ContactResult`/`submitContact` consistent across T11. Section `tone` prop (`base|subtle|dark`) consistent across all section components.
- **Copy authoring:** page tasks specify exact message-key structure + the precise source MD file; Home (T12) is shown fully as the worked example. EN is authored as a polished mirror with identical numeric `value` fields.
- **Testing adaptation:** real unit test only where it fits (zod schema, T11); all other verification is build + Playwright, appropriate for a marketing site.
