// Slugs are a contract shared with the image set (public/images/modules/<slug>.jpg)
// and the icon set (components/ui/ModuleIcon.tsx). Order = display order.
export const MODULE_SLUGS = [
  // Core
  "wms", "tms", "router", "paletizado", "torre-control",
  // Especializados
  "cadena-frio", "gestor-documental", "etiqueta-zero",
  // Operativos
  "gps-flotas", "companion", "plant-sync",
] as const;
export type ModuleSlug = (typeof MODULE_SLUGS)[number];

export const MODULE_GROUPS = ["core", "especializados", "operativos"] as const;
export type ModuleGroup = (typeof MODULE_GROUPS)[number];

// icon = lucide icon name (components/ui/Icon.tsx); messageKey = namespace in messages JSON (modules.<key>)
// hero = module hero photo; group = catalog tier (messages: modules.groups.<group>)
export const MODULES: Record<ModuleSlug, { icon: string; messageKey: string; hero: string; group: ModuleGroup }> = {
  "wms":               { icon: "warehouse",       messageKey: "wms",              hero: "/images/modules/wms.jpg",               group: "core" },
  "tms":               { icon: "truck",           messageKey: "tms",              hero: "/images/modules/tms.jpg",               group: "core" },
  "router":            { icon: "route",           messageKey: "router",           hero: "/images/modules/router.jpg",            group: "core" },
  "paletizado":        { icon: "boxes",           messageKey: "paletizado",       hero: "/images/modules/paletizado.jpg",        group: "core" },
  "torre-control":     { icon: "radar",           messageKey: "torreControl",     hero: "/images/modules/torre-control.jpg",     group: "core" },
  "cadena-frio":       { icon: "thermometer",     messageKey: "cadenaFrio",       hero: "/images/modules/cadena-frio.jpg",       group: "especializados" },
  "gestor-documental": { icon: "file-text",       messageKey: "gestorDocumental", hero: "/images/modules/gestor-documental.jpg", group: "especializados" },
  "etiqueta-zero":     { icon: "scan-barcode",    messageKey: "etiquetaZero",     hero: "/images/modules/etiqueta-zero.jpg",     group: "especializados" },
  "gps-flotas":        { icon: "map-pin",         messageKey: "gpsFlotas",        hero: "/images/modules/gps-flotas.jpg",        group: "operativos" },
  "companion":         { icon: "smartphone",      messageKey: "companion",        hero: "/images/modules/companion.jpg",         group: "operativos" },
  "plant-sync":        { icon: "calendar-clock",  messageKey: "plantSync",        hero: "/images/modules/plant-sync.jpg",        group: "operativos" },
};

export function modulesInGroup(group: ModuleGroup, slugs: readonly ModuleSlug[] = MODULE_SLUGS): ModuleSlug[] {
  return slugs.filter((s) => MODULES[s].group === group);
}
