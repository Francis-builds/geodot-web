import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Faq, type FaqGroup } from "@/components/Faq";
import { CTABanner } from "@/components/CTABanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faqPage");
  const groups = t.raw("groups") as FaqGroup[];

  return (
    <>
      <Hero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        titleAccent={t("hero.titleAccent")}
        subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        bgImage="/images/pages/faq.jpg"
        bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`}
      />
      <section className="bg-white">
        <Faq groups={groups} />
      </section>
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
