import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CTABanner } from "@/components/CTABanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return { title: `${t("hero.title")} ${t("hero.titleAccent")}`, description: t("hero.subtitle") };
}

export default async function NosotrosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const paras = t.raw("body") as string[];
  return (
    <>
      <Hero variant="dark" eyebrow={t("hero.eyebrow")} title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        bgImage="/images/torre/torre-control.jpg" bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`} />
      <Section tone="base">
        <SectionHeader title={t("mission.title")} align="left" />
        <div className="max-w-3xl space-y-4">{paras.map((p, i) => <p key={i} className="text-body-lg text-navy-700">{p}</p>)}</div>
      </Section>
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
