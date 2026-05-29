import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { INDUSTRY_SLUGS, INDUSTRIES, type IndustrySlug } from "@/lib/industries";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/Hero";
import { ProblemStats } from "@/components/ProblemStats";
import { ModuleGrid } from "@/components/ModuleGrid";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => INDUSTRY_SLUGS.map((industria) => ({ locale, industria })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; industria: string }> }): Promise<import("next").Metadata> {
  const { locale, industria } = await params;
  const key = INDUSTRIES[industria as IndustrySlug]?.messageKey;
  if (!key) return {};
  const t = await getTranslations({ locale, namespace: `industries.${key}` });
  return { title: `${t("title")} ${t("titleAccent")}`, description: t("subtitle") };
}

export default async function IndustriaPage({ params }: { params: Promise<{ locale: string; industria: string }> }) {
  const { locale, industria } = await params;
  if (!INDUSTRY_SLUGS.includes(industria as IndustrySlug)) notFound();
  setRequestLocale(locale);
  const { messageKey: key, hero, context, icon } = INDUSTRIES[industria as IndustrySlug];
  const t = await getTranslations(`industries.${key}`);

  return (
    <>
      <Hero variant="dark" eyebrow={t("eyebrow")} eyebrowIcon={icon} title={t("title")} titleAccent={t("titleAccent")} subtitle={t("subtitle")}
        primaryCta={{ label: t("ctaPrimary"), href: "/contacto" }}
        bgImage={hero} bgAlt={`${t("title")} ${t("titleAccent")}`} />
      <ProblemStats title={t("problem.title")} points={t.raw("problem.points") as string[]} stats={t.raw("problem.stats") as { problem: string; impact: string }[]} />
      <section className="bg-white py-12 md:py-16">
        <Container>
          <Media src={context} alt={`${t("title")} ${t("titleAccent")}`} ratio="16/9" sizes="(max-width: 1024px) 100vw, 1024px" />
        </Container>
      </section>
      <ModuleGrid title={t("modules.title")} />
      <CasesStrip title={t("cases.title")} cases={t.raw("cases.items") as { client: string; result: string; metric: string }[]} />
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
