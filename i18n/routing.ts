import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"] as const,
  defaultLocale: "es",
  localePrefix: "as-needed", // ES at root, EN at /en
});

export type Locale = (typeof routing.locales)[number];
