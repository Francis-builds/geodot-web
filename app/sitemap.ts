import type { MetadataRoute } from "next";
import { MODULE_SLUGS } from "@/lib/modules";
import { INDUSTRY_SLUGS } from "@/lib/industries";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://geodot.app";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/plataforma", "/casos-exito", "/nosotros", "/contacto",
    ...MODULE_SLUGS.map((m) => `/plataforma/${m}`), ...INDUSTRY_SLUGS.map((i) => `/industrias/${i}`)];
  return paths.flatMap((p) => [
    { url: `${BASE}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 },
    { url: `${BASE}/en${p}`, changeFrequency: "monthly", priority: p === "" ? 0.9 : 0.6 },
  ]);
}
