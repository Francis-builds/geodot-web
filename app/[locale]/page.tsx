import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { ControlTower } from "@/components/ControlTower";
import { ProblemStats } from "@/components/ProblemStats";
import { ModuleGrid } from "@/components/ModuleGrid";
import { JourneyScroll } from "@/components/JourneyScroll";
import { MetricsBand } from "@/components/MetricsBand";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const m = await getTranslations({ locale, namespace: "meta" });
  return { title: { absolute: m("title") }, description: t("hero.subtitle") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <Hero eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        rotatingWords={t.raw("hero.rotatingWords") as string[]}
        titleAfter={t("hero.titleAfter")}
        subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.ctaPrimary"), href: "/contacto" }}
        secondaryCta={{ label: t("hero.ctaSecondary"), href: "/plataforma" }}
        visual={<ControlTower labels={t.raw("hero.tower") as { occupancyLabel: string; transportLabel: string; routeLabel: string; modes: string[] }} />}
      />
      <MetricsBand items={t.raw("metrics") as { value: number; suffix?: string; label: string }[]} />
      <ProblemStats
        title={t("problem.title")} titleAccent={t("problem.titleAccent")}
        points={t.raw("problem.points") as string[]}
        stats={t.raw("problem.stats") as { problem: string; impact: string }[]}
      />
      <ModuleGrid title={t("platform.title")} titleAccent={t("platform.titleAccent")} description={t("platform.description")} />
      <JourneyScroll title={t("journey.title")} titleAccent={t("journey.titleAccent")} />
      <CasesStrip title={t("cases.title")} cases={t.raw("cases.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
