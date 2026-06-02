import type { MetadataRoute } from "next";
import { MODULE_SLUGS } from "@/lib/modules";
import { INDUSTRY_SLUGS } from "@/lib/industries";
import { getPostSlugs } from "@/lib/blog";
import { SITE_URL as BASE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/plataforma", "/industrias", "/integraciones", "/partners", "/casos-exito", "/recursos", "/nosotros", "/contacto", "/preguntas-frecuentes", "/privacidad", "/terminos",
    ...MODULE_SLUGS.map((m) => `/plataforma/${m}`), ...INDUSTRY_SLUGS.map((i) => `/industrias/${i}`),
    ...getPostSlugs("es").map((s) => `/recursos/${s}`)];
  return paths.flatMap((p) => [
    { url: `${BASE}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 },
    { url: `${BASE}/en${p}`, changeFrequency: "monthly", priority: p === "" ? 0.9 : 0.6 },
  ]);
}
