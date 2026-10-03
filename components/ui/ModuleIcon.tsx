import type { ReactElement } from "react";

/**
 * Geodot module pictograms — 24×24 grid, 2px stroke, round caps/joins.
 * Shared motif: every glyph carries "the Geodot dot" (the hole of the logo pin),
 * placed exactly where the module acts. It is the only filled element.
 * Standalone copies live in /public/images/modules/icons/<slug>.svg — keep paths in sync.
 * Rationale and usage rules: docs/module-icons.md
 */
export type ModuleSlug =
  | "wms"
  | "tms"
  | "router"
  | "paletizado"
  | "torre-control"
  | "cadena-frio"
  | "gestor-documental"
  | "etiqueta-zero"
  | "gps-flotas"
  | "companion"
  | "plant-sync";

export const MODULE_SLUGS: readonly ModuleSlug[] = [
  "wms",
  "tms",
  "router",
  "paletizado",
  "torre-control",
  "cadena-frio",
  "gestor-documental",
  "etiqueta-zero",
  "gps-flotas",
  "companion",
  "plant-sync",
];

type Glyph = { body: ReactElement; dot: ReactElement };

const GLYPHS: Record<ModuleSlug, Glyph> = {
  wms: {
    body: (
      <>
        <path d="M3 20.5V9.3L12 4l9 5.3v11.2" />
        <path d="M7.5 20.5V13h9v7.5" />
        <path d="M2 20.5h20" />
      </>
    ),
    dot: (
      <>
        <circle cx={12} cy={16.75} r={2} />
      </>
    ),
  },
  tms: {
    body: (
      <>
        <path d="M2.5 15.5V7A1.5 1.5 0 0 1 4 5.5h8A1.5 1.5 0 0 1 13.5 7v8.5" />
        <path d="M13.5 9h3.7l3.3 3.6v4.9h-1.5" />
        <path d="M9 17.5h6" />
        <path d="M2.5 15.5v2H5" />
        <circle cx={7} cy={17.5} r={2} />
        <circle cx={17} cy={17.5} r={2} />
      </>
    ),
    dot: (
      <>
        <circle cx={8} cy={10.5} r={2} />
      </>
    ),
  },
  router: {
    body: (
      <>
        <circle cx={5} cy={7} r={2} />
        <path d="M5 9v6.5a3 3 0 0 0 3 3h6.5a3 3 0 0 0 3-3v-2.2" />
        <path d="M17.5 13.25L14.38 8.58A3.75 3.75 0 1 1 20.62 8.58Z" />
      </>
    ),
    dot: (
      <>
        <circle cx={17.5} cy={6.5} r={1.5} />
      </>
    ),
  },
  paletizado: {
    body: (
      <>
        <rect x={4} y={11.5} width={7.5} height={7} rx={1} />
        <rect x={12.5} y={11.5} width={7.5} height={7} rx={1} />
        <rect x={8} y={4.5} width={8} height={7} rx={1} />
        <path d="M2.5 18.5h19M5 18.5V21M12 18.5V21M19 18.5V21" />
      </>
    ),
    dot: (
      <>
        <circle cx={12} cy={8} r={2} />
      </>
    ),
  },
  "torre-control": {
    body: (
      <>
        <path d="M8.26 3a4.5 4.5 0 0 0 0 5" />
        <path d="M15.74 3a4.5 4.5 0 0 1 0 5" />
        <path d="M6.5 12.5h11l-1.5 4H8z" />
        <path d="M12 12.5v4M10 16.5V21M14 16.5V21M7 21h10" />
      </>
    ),
    dot: (
      <>
        <circle cx={12} cy={5.5} r={2} />
      </>
    ),
  },
  "cadena-frio": {
    body: (
      <>
        <path d="M7 13.5V6a2.5 2.5 0 0 1 5 0v7.5a4 4 0 1 1-5 0z" />
        <path d="M17.5 4v6M14.9 5.5l5.2 3M14.9 8.5l5.2-3" />
      </>
    ),
    dot: (
      <>
        <circle cx={9.5} cy={16.62} r={2} />
      </>
    ),
  },
  "gestor-documental": {
    body: (
      <>
        <path d="M18 10V8l-5-5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
        <path d="M13 3v3.5A1.5 1.5 0 0 0 14.5 8H18" />
        <path d="M8.5 10h3M8.5 13.5h2" />
        <circle cx={16} cy={15.5} r={3.5} />
        <path d="M18.6 18.1 21 20.5" />
      </>
    ),
    dot: (
      <>
        <circle cx={16} cy={15.5} r={1.5} />
      </>
    ),
  },
  "etiqueta-zero": {
    body: (
      <>
        <path d="M6.18 15 3.44 12.26A1.5 1.5 0 0 1 3 11.2V4.5A1.5 1.5 0 0 1 4.5 3h6.7a1.5 1.5 0 0 1 1.06.44L15 6.18" />
        <path d="m17.82 9 2.74 2.74a1.5 1.5 0 0 1 0 2.12l-6.7 6.7a1.5 1.5 0 0 1-2.12 0L9 17.82" />
        <path d="M3 21 21 3" />
      </>
    ),
    dot: (
      <>
        <circle cx={7.5} cy={7.5} r={2} />
      </>
    ),
  },
  "gps-flotas": {
    body: (
      <>
        <path d="M12 18.4L7.43 11.56A5.5 5.5 0 1 1 16.57 11.56Z" />
        <path d="M3 21.5h3M9.5 21.5h5M18 21.5h3" />
      </>
    ),
    dot: (
      <>
        <circle cx={12} cy={8.5} r={2} />
      </>
    ),
  },
  companion: {
    body: (
      <>
        <rect x={5.5} y={2.5} width={13} height={19} rx={2.5} />
        <path d="M10.5 5.5h3" />
        <path d="M8.5 14.5c1.2-3 2.6-3.8 3.1-2.6.5 1.2-.8 3.2.3 3.3 1 .1 1.7-1.6 2.6-1.6" />
        <path d="M8.5 18h4" />
      </>
    ),
    dot: (
      <>
        <circle cx={15.5} cy={18} r={1.5} />
      </>
    ),
  },
  "plant-sync": {
    body: (
      <>
        <rect x={3} y={5} width={18} height={16} rx={2} />
        <path d="M8 3v4M16 3v4M3 10h18" />
        <path d="M7 14h4M7 17.5h4" />
      </>
    ),
    dot: (
      <>
        <circle cx={16} cy={15.75} r={2} />
      </>
    ),
  },
};

export function ModuleIcon({
  slug,
  className,
  accent = false,
}: {
  slug: ModuleSlug;
  className?: string;
  accent?: boolean;
}) {
  const glyph = GLYPHS[slug];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      {glyph.body}
      <g
        fill="currentColor"
        stroke="none"
        className={accent ? "text-magenta-500" : undefined}
      >
        {glyph.dot}
      </g>
    </svg>
  );
}
