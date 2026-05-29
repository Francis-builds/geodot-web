/**
 * Canonical site base URL.
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL — explicit production domain (set in Vercel project env).
 * 2. VERCEL_URL — auto-set by Vercel on preview/deploy builds (no protocol, so we prepend https).
 * 3. https://geodot.app — production default fallback.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://geodot.app");
