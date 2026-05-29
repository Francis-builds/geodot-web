import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CTABanner } from "@/components/CTABanner";

export default async function NosotrosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const paras = t.raw("body") as string[];
  return (
    <>
      <Hero variant="dark" title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }} />
      <Section tone="base">
        <SectionHeader title={t("mission.title")} align="left" />
        <div className="max-w-3xl space-y-4">{paras.map((p, i) => <p key={i} className="text-body-lg text-navy-700">{p}</p>)}</div>
      </Section>
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
