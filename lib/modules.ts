export const MODULE_SLUGS = ["wms", "tms", "paletizado", "torre-control"] as const;
export type ModuleSlug = (typeof MODULE_SLUGS)[number];

// icon = lucide icon name; messageKey = namespace in messages JSON (modules.<key>)
export const MODULES: Record<ModuleSlug, { icon: string; messageKey: string }> = {
  "wms":           { icon: "warehouse",   messageKey: "wms" },
  "tms":           { icon: "truck",       messageKey: "tms" },
  "paletizado":    { icon: "boxes",       messageKey: "paletizado" },
  "torre-control": { icon: "radar",       messageKey: "torreControl" },
};
