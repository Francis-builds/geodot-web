import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { ProblemStats } from "@/components/ProblemStats";
import { ModuleGrid } from "@/components/ModuleGrid";
import { MetricsBand } from "@/components/MetricsBand";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <Hero
        title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.ctaPrimary"), href: "/contacto" }}
        secondaryCta={{ label: t("hero.ctaSecondary"), href: "/plataforma" }}
        variant="dark"
      />
      <ProblemStats
        eyebrow={t("problem.eyebrow")} title={t("problem.title")} titleAccent={t("problem.titleAccent")}
        points={t.raw("problem.points") as string[]}
        stats={t.raw("problem.stats") as { problem: string; impact: string }[]}
      />
      <ModuleGrid eyebrow={t("platform.eyebrow")} title={t("platform.title")} titleAccent={t("platform.titleAccent")} description={t("platform.description")} />
      <MetricsBand items={t.raw("metrics") as { value: number; suffix?: string; label: string }[]} />
      <CasesStrip eyebrow={t("cases.eyebrow")} title={t("cases.title")} cases={t.raw("cases.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
