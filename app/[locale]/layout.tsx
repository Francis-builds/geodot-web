import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "en" ? "/en" : "";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: "%s · Geodot" },
    description: t("description"),
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_MX",
      url: `${SITE_URL}${path}`,
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "Geodot",
    },
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: { es: SITE_URL, en: `${SITE_URL}/en` },
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale === "en" ? "en" : "es-MX"} data-scroll-behavior="smooth" className={schibsted.variable}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <SmoothScroll />
          <Nav />
          <main className="pt-16 md:pt-[72px]">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
