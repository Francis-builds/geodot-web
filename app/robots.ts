import type { MetadataRoute } from "next";
import { SITE_URL as BASE } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  // Only the production deploy is indexable; previews and local builds stay out of search.
  const indexable = process.env.VERCEL_ENV === "production";
  return {
    rules: indexable ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
