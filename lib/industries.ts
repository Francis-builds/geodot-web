import type { ModuleSlug } from "./modules";

export const INDUSTRY_SLUGS = ["bebidas", "alimentos", "gobierno-residuos", "3pl", "healthcare", "recintos-fiscales"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

// hero = full-bleed photo for the page hero; context = in-page editorial band.
// Each slug has a distinct scenario so verticals never look alike:
// alimentos=fishing fleet, 3pl=forklift yard, recintos=port geofence,
// healthcare=cold-chain network, bebidas=distribution, gobierno=sustainability/waste.
// entryModules = where the customer comes in (the acute pain); crossSell = what
// follows once inside (land-and-expand). Source: STATUS.md "Mapa módulo-de-entrada
// × industria" (bebidas follows the ruteo + paletizado wedge).
type Industry = {
  icon: string; messageKey: string; hero: string; context: string;
  entryModules: readonly ModuleSlug[]; crossSell: readonly ModuleSlug[];
};

export const INDUSTRIES: Record<IndustrySlug, Industry> = {
  "bebidas":           { icon: "bottle-wine", messageKey: "bebidas",         hero: "/images/industries/bebidas/hero.jpg",           context: "/images/industries/bebidas/context.jpg",
    entryModules: ["paletizado", "router"], crossSell: ["wms", "tms", "torre-control"] },
  "alimentos":         { icon: "milk",        messageKey: "alimentos",       hero: "/images/industries/alimentos/hero.jpg",         context: "/images/industries/alimentos/context.jpg",
    entryModules: ["wms", "cadena-frio"], crossSell: ["paletizado", "router", "torre-control"] },
  "gobierno-residuos": { icon: "recycle",     messageKey: "gobiernoResiduos", hero: "/images/industries/gobierno-residuos/hero.jpg", context: "/images/industries/gobierno-residuos/context.jpg",
    entryModules: ["gps-flotas", "router"], crossSell: ["torre-control", "companion"] },
  "3pl":               { icon: "package",     messageKey: "logistica3pl",    hero: "/images/industries/3pl/hero.jpg",               context: "/images/industries/3pl/context.jpg",
    entryModules: ["etiqueta-zero", "wms"], crossSell: ["tms", "torre-control", "companion"] },
  "healthcare":        { icon: "heart-pulse", messageKey: "healthcare",      hero: "/images/industries/healthcare/hero.jpg",        context: "/images/industries/healthcare/context.jpg",
    entryModules: ["cadena-frio", "wms"], crossSell: ["torre-control", "gestor-documental", "tms"] },
  "recintos-fiscales": { icon: "container",   messageKey: "recintosFiscales", hero: "/images/industries/recintos-fiscales/hero.jpg", context: "/images/industries/recintos-fiscales/context.jpg",
    entryModules: ["etiqueta-zero", "wms"], crossSell: ["gestor-documental", "torre-control"] },
};
