export const MODULE_SLUGS = ["wms", "tms", "paletizado", "torre-control"] as const;
export type ModuleSlug = (typeof MODULE_SLUGS)[number];

// icon = lucide icon name; messageKey = namespace in messages JSON (modules.<key>)
// hero = reused photo from the asset catalog (public/images/...)
export const MODULES: Record<ModuleSlug, { icon: string; messageKey: string; hero: string }> = {
  "wms":           { icon: "warehouse",   messageKey: "wms",          hero: "/images/warehouse/iwms.jpg" },
  "tms":           { icon: "truck",       messageKey: "tms",          hero: "/images/fleet/itms.jpg" },
  "paletizado":    { icon: "boxes",       messageKey: "paletizado",   hero: "/images/warehouse/paletizado.jpg" },
  "torre-control": { icon: "radar",       messageKey: "torreControl", hero: "/images/torre/torre-control.jpg" },
};
