import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { ModuleGrid } from "@/components/ModuleGrid";
import { CTABanner } from "@/components/CTABanner";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "platformPage" });
  return pageMeta({ locale, path: "/plataforma", title: `${t("hero.title")} ${t("hero.titleAccent")}`, description: t("hero.subtitle") });
}

export default async function PlataformaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("platformPage");
  return (
    <>
      <Hero eyebrow={t("hero.eyebrow")} title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        bgImage="/images/warehouse/hero-patio.jpg" />
      <ModuleGrid title={t("modules.title")} description={t("modules.description")} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
