import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { INDUSTRY_SLUGS, INDUSTRIES, type IndustrySlug } from "@/lib/industries";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/Hero";
import { ProblemStats } from "@/components/ProblemStats";
import { ModuleGrid } from "@/components/ModuleGrid";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => INDUSTRY_SLUGS.map((industria) => ({ locale, industria })));
}

export default async function IndustriaPage({ params }: { params: Promise<{ locale: string; industria: string }> }) {
  const { locale, industria } = await params;
  if (!INDUSTRY_SLUGS.includes(industria as IndustrySlug)) notFound();
  setRequestLocale(locale);
  const key = INDUSTRIES[industria as IndustrySlug].messageKey;
  const t = await getTranslations(`industries.${key}`);

  return (
    <>
      <Hero variant="dark" eyebrow={t("eyebrow")} title={t("title")} titleAccent={t("titleAccent")} subtitle={t("subtitle")}
        primaryCta={{ label: t("ctaPrimary"), href: "/contacto" }} />
      <ProblemStats title={t("problem.title")} points={t.raw("problem.points") as string[]} stats={t.raw("problem.stats") as { problem: string; impact: string }[]} />
      <ModuleGrid title={t("modules.title")} />
      <CasesStrip title={t("cases.title")} cases={t.raw("cases.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
