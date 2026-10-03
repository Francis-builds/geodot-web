import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

type PageMetaInput = {
  locale: string;
  /** Unprefixed path, e.g. "/plataforma/wms" ("" or "/" for the home). */
  path: string;
  title: string;
  description: string;
};

/** Real localized URL: ES at the root, EN under /en (localePrefix: as-needed). */
export function localizedUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  return `${SITE_URL}${locale === "en" ? "/en" : ""}${clean}`;
}

/** Per-page canonical + hreflang + OpenGraph. Title is the page's own (layout template appends the brand). */
export function pageMeta({ locale, path, title, description }: PageMetaInput): Metadata {
  const url = localizedUrl(locale, path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: localizedUrl("es", path),
        en: localizedUrl("en", path),
        "x-default": localizedUrl("es", path),
      },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      locale: locale === "en" ? "en_US" : "es_MX",
      siteName: "Geodot",
    },
  };
}
