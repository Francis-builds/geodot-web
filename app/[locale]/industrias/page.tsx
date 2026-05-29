import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { IndustryGrid } from "@/components/IndustryGrid";
import { CTABanner } from "@/components/CTABanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "industriesIndex" });
  return { title: `${t("title")} ${t("titleAccent")}`, description: t("subtitle") };
}

export default async function IndustriasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("industriesIndex");
  return (
    <>
      <Hero variant="dark" eyebrow={t("hero.eyebrow")} title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        bgImage="/images/warehouse/almacen.jpg" bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`} />
      <IndustryGrid eyebrow={t("eyebrow")} title={t("title")} titleAccent={t("titleAccent")} description={t("subtitle")} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
