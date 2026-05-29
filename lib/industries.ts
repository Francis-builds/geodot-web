export const INDUSTRY_SLUGS = ["bebidas", "alimentos", "gobierno-residuos", "3pl", "healthcare", "recintos-fiscales"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

// hero = reused photo from the asset catalog (public/images/...)
export const INDUSTRIES: Record<IndustrySlug, { icon: string; messageKey: string; hero: string }> = {
  "bebidas":           { icon: "bottle-wine", messageKey: "bebidas",         hero: "/images/warehouse/almacen.jpg" },
  "alimentos":         { icon: "milk",        messageKey: "alimentos",       hero: "/images/cold-chain/cadena-frio.jpg" },
  "gobierno-residuos": { icon: "recycle",     messageKey: "gobiernoResiduos", hero: "/images/fleet/fleet-tracking.jpg" },
  "3pl":               { icon: "package",     messageKey: "logistica3pl",    hero: "/images/fleet/trailer-loading.jpg" },
  "healthcare":        { icon: "heart-pulse", messageKey: "healthcare",      hero: "/images/cold-chain/operario-tablet.jpg" },
  "recintos-fiscales": { icon: "container",   messageKey: "recintosFiscales", hero: "/images/recintos/torre-control.png" },
};
