// NOTE: This is generic, boilerplate legal copy intended as a placeholder.
// It MUST be reviewed and adapted by a qualified attorney before being relied
// upon for any real legal or compliance purpose.
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/ui/Section";
import { LegalBody } from "@/components/LegalBody";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function TerminosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.terms");
  return (
    <>
      <Hero variant="dark" eyebrow={t("hero.eyebrow")} title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")}
        bgImage="/images/torre/torre-control.jpg" bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`} />
      <Section tone="base">
        <LegalBody updated={t("updated")} sections={t.raw("sections") as { title: string; body: string[] }[]} />
      </Section>
    </>
  );
}
