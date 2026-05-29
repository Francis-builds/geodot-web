export const INDUSTRY_SLUGS = ["bebidas", "alimentos", "gobierno-residuos", "3pl"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export const INDUSTRIES: Record<IndustrySlug, { icon: string; messageKey: string }> = {
  "bebidas":           { icon: "bottle-wine", messageKey: "bebidas" },
  "alimentos":         { icon: "milk",        messageKey: "alimentos" },
  "gobierno-residuos": { icon: "recycle",     messageKey: "gobiernoResiduos" },
  "3pl":               { icon: "package",     messageKey: "logistica3pl" },
};
