import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MODULE_SLUGS, MODULES, type ModuleSlug } from "@/lib/modules";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/Hero";
import { ProblemStats } from "@/components/ProblemStats";
import { SolutionSteps } from "@/components/SolutionSteps";
import { MetricsBand } from "@/components/MetricsBand";
import { CTABanner } from "@/components/CTABanner";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => MODULE_SLUGS.map((modulo) => ({ locale, modulo })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; modulo: string }> }): Promise<import("next").Metadata> {
  const { locale, modulo } = await params;
  const key = MODULES[modulo as ModuleSlug]?.messageKey;
  if (!key) return {};
  const t = await getTranslations({ locale, namespace: `modules.${key}` });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ModuloPage({ params }: { params: Promise<{ locale: string; modulo: string }> }) {
  const { locale, modulo } = await params;
  if (!MODULE_SLUGS.includes(modulo as ModuleSlug)) notFound();
  setRequestLocale(locale);
  const key = MODULES[modulo as ModuleSlug].messageKey;
  const t = await getTranslations(`modules.${key}`);

  return (
    <>
      <Hero variant="dark" eyebrow={t("eyebrow")} title={t("title")} titleAccent={t("titleAccent")} subtitle={t("subtitle")}
        primaryCta={{ label: t("ctaPrimary"), href: "/contacto" }} />
      <ProblemStats title={t("problem.title")} points={t.raw("problem.points") as string[]} stats={t.raw("problem.stats") as { problem: string; impact: string }[]} />
      <SolutionSteps title={t("solution.title")} steps={t.raw("solution.steps") as { title: string; description: string }[]} />
      <MetricsBand items={t.raw("metrics") as { value: number; suffix?: string; label: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
