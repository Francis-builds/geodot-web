export const INDUSTRY_SLUGS = ["bebidas", "alimentos", "gobierno-residuos", "3pl", "healthcare", "recintos-fiscales"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

// hero = full-bleed photo for the page hero; context = in-page editorial band.
// Each slug has a distinct scenario so verticals never look alike:
// alimentos=fishing fleet, 3pl=forklift yard, recintos=port geofence,
// healthcare=cold-chain network, bebidas=distribution, gobierno=sustainability/waste.
export const INDUSTRIES: Record<IndustrySlug, { icon: string; messageKey: string; hero: string; context: string }> = {
  "bebidas":           { icon: "bottle-wine", messageKey: "bebidas",         hero: "/images/industries/bebidas/hero.jpg",           context: "/images/industries/bebidas/context.jpg" },
  "alimentos":         { icon: "milk",        messageKey: "alimentos",       hero: "/images/industries/alimentos/hero.jpg",         context: "/images/industries/alimentos/context.jpg" },
  "gobierno-residuos": { icon: "recycle",     messageKey: "gobiernoResiduos", hero: "/images/industries/gobierno-residuos/hero.jpg", context: "/images/industries/gobierno-residuos/context.jpg" },
  "3pl":               { icon: "package",     messageKey: "logistica3pl",    hero: "/images/industries/3pl/hero.jpg",               context: "/images/industries/3pl/context.jpg" },
  "healthcare":        { icon: "heart-pulse", messageKey: "healthcare",      hero: "/images/industries/healthcare/hero.jpg",        context: "/images/industries/healthcare/context.jpg" },
  "recintos-fiscales": { icon: "container",   messageKey: "recintosFiscales", hero: "/images/industries/recintos-fiscales/hero.png", context: "/images/industries/recintos-fiscales/context.jpg" },
};
