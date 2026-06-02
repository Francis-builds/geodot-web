import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { CasesStrip } from "@/components/CasesStrip";
import { CTABanner } from "@/components/CTABanner";
import { Section, SectionHeader } from "@/components/ui/Section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "casesPage" });
  return { title: `${t("hero.title")} ${t("hero.titleAccent")}`, description: t("hero.subtitle") };
}

export default async function CasosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("casesPage");
  return (
    <>
      <Hero variant="dark" eyebrow={t("hero.eyebrow")} title={t("hero.title")} titleAccent={t("hero.titleAccent")} subtitle={t("hero.subtitle")} primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        bgImage="/images/recintos/geocerca-puerto.jpg" bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`} />
      <CasesStrip title={t("list.title")} cases={t.raw("list.items") as { client: string; result: string; metric: string }[]} />
      <Section tone="base">
        <SectionHeader title={t("studies.title")} />
        <div className="grid gap-6 md:grid-cols-3">
          {(t.raw("studies.items") as { industry: string; challenge: string; solution: string; result: string }[]).map((s, i) => (
            <div key={i} className="flex h-full flex-col rounded-xl border border-navy-100 bg-white p-6">
              <span className="inline-block self-start rounded-full bg-teal-50 px-3 py-1 text-caption font-semibold uppercase tracking-wide text-accent-strong">{s.industry}</span>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-overline font-semibold uppercase tracking-wide text-navy-500">{t("studies.labels.challenge")}</dt>
                  <dd className="mt-1 text-body-md text-navy-700">{s.challenge}</dd>
                </div>
                <div>
                  <dt className="text-overline font-semibold uppercase tracking-wide text-navy-500">{t("studies.labels.solution")}</dt>
                  <dd className="mt-1 text-body-md text-navy-700">{s.solution}</dd>
                </div>
              </dl>
              <div className="mt-auto border-t border-navy-100 pt-4">
                <dt className="text-overline font-semibold uppercase tracking-wide text-navy-500">{t("studies.labels.result")}</dt>
                <p className="mt-1 text-body-md font-semibold text-navy-900">{s.result}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
