import type { MetadataRoute } from "next";
import { MODULE_SLUGS } from "@/lib/modules";
import { INDUSTRY_SLUGS } from "@/lib/industries";
import { getPostSlugs } from "@/lib/blog";
import { localizedUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // /partners is intentionally left out (noindex until the Alliance Program is closed).
  const paths = ["", "/plataforma", "/industrias", "/integraciones", "/casos-exito", "/recursos", "/nosotros", "/contacto", "/preguntas-frecuentes", "/privacidad", "/terminos",
    ...MODULE_SLUGS.map((m) => `/plataforma/${m}`), ...INDUSTRY_SLUGS.map((i) => `/industrias/${i}`),
    ...getPostSlugs("es").map((s) => `/recursos/${s}`)];
  return paths.flatMap((p) => {
    const alternates = { languages: { es: localizedUrl("es", p), en: localizedUrl("en", p) } };
    return [
      { url: localizedUrl("es", p), changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7, alternates },
      { url: localizedUrl("en", p), changeFrequency: "monthly" as const, priority: p === "" ? 0.9 : 0.6, alternates },
    ];
  });
}
