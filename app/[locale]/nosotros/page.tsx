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
  const timelineSteps = t.raw("timeline.steps") as { year: string; label: string; title: string; body: string }[];
  return (
    <>
      <Hero variant="dark" eyebrow={t("hero.eyebrow")} title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        bgImage="/images/torre/torre-control.jpg" bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`} />
      <Section tone="base">
        <SectionHeader title={t("mission.title")} align="left" />
        <div className="max-w-3xl space-y-4">{paras.map((p, i) => <p key={i} className="text-body-lg text-navy-700">{p}</p>)}</div>
      </Section>
      <Section tone="subtle">
        <SectionHeader title={t("timeline.title")} align="left" />
        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {timelineSteps.map((s, i) => (
            <li key={i} className="rounded-lg border border-navy-100 bg-white p-6">
              <span className="text-heading-md font-bold text-accent-strong">{s.year}</span>
              <p className="mt-1 text-body-sm font-semibold uppercase tracking-wide text-navy-500">{s.label}</p>
              <h3 className="mt-3 text-heading-sm font-semibold text-navy-900">{s.title}</h3>
              <p className="mt-2 text-body-sm text-navy-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
