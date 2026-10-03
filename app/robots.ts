import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL as BASE } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  // Previews, local builds and pre-cutover production stay out of search (see INDEXABLE).
  return {
    rules: INDEXABLE ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
