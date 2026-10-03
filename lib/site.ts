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

/**
 * Search indexing switch. Off unless SITE_INDEXABLE=true on the production
 * deploy: until the geodot.app cutover, production lives on *.vercel.app with
 * canonicals pointing at geodot.app (still the old WordPress), so indexing it
 * would send Google mixed signals. Flip the env var on cutover day.
 */
export const INDEXABLE =
  process.env.VERCEL_ENV === "production" && process.env.SITE_INDEXABLE === "true";
