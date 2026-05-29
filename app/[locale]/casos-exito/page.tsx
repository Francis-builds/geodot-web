import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "casesPage" });
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

export default async function CasosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("casesPage");
  return (
    <>
      <Hero variant="dark" title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }} />
      <CasesStrip title={t("list.title")} cases={t.raw("list.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
