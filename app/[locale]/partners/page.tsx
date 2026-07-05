import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const CONTACT_EMAIL = "luis.perasollo@geodot.app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partnersPage" });
  return { title: `${t("hero.title")} ${t("hero.titleAccent")}`, description: t("hero.subtitle") };
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("partnersPage");
  const categories = t.raw("categories.items") as { name: string; body: string }[];
  const tiers = t.raw("tiers.items") as { name: string; range: string; body: string }[];
  const services = t.raw("services.items") as { title: string; body: string }[];

  return (
    <>
      <Hero eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        titleAccent={t("hero.titleAccent")}
        subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.cta"), href: `mailto:${CONTACT_EMAIL}` }}
        bgImage="/images/pages/partners.jpg"
      />

      {/* Partner categories */}
      <Section tone="base">
        <SectionHeader
          title={t("categories.title")}
          titleAccent={t("categories.titleAccent")}
          description={t("categories.description")}
        />
        <div className="divide-y divide-navy-100 border-y border-navy-100">
          {categories.map((c, i) => (
            <Reveal key={i} direction="up" delay={i * 0.05}>
              <div className="grid gap-2 py-8 md:grid-cols-[16rem_1fr] md:gap-10">
                <h3 className="text-heading-md font-bold text-navy-900">{c.name}</h3>
                <p className="max-w-2xl text-body-lg text-navy-600">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Levels */}
      <Section tone="subtle">
        <SectionHeader
          title={t("tiers.title")}
          titleAccent={t("tiers.titleAccent")}
          description={t("tiers.description")}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => {
            const featured = i === 1;
            return (
              <Reveal key={i} direction="up" delay={i * 0.08}>
                <div
                  className={`flex h-full flex-col rounded-xl border bg-white p-8 transition-shadow hover:shadow-sm ${
                    featured ? "border-teal-300 ring-1 ring-teal-200" : "border-navy-100"
                  }`}
                >
                  <h3 className="text-heading-md font-semibold text-navy-900">{tier.name}</h3>
                  <p className="mt-2 text-overline font-semibold uppercase tracking-wide text-accent-sm">{tier.range}</p>
                  <p className="mt-4 text-body-md leading-relaxed text-navy-600">{tier.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Services model */}
      <Section tone="base">
        <SectionHeader
          title={t("services.title")}
          titleAccent={t("services.titleAccent")}
          description={t("services.description")}
        />
        <div className="divide-y divide-navy-100 border-y border-navy-100">
          {services.map((s, i) => (
            <Reveal key={i} direction="up" delay={i * 0.05}>
              <div className="grid gap-2 py-8 md:grid-cols-[16rem_1fr] md:gap-10">
                <h3 className="text-heading-md font-bold text-navy-900">{s.title}</h3>
                <p className="max-w-2xl text-body-lg text-navy-600">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Contact CTA */}
      <section className="bg-navy-900 text-white">
        <Container className="flex flex-col items-center gap-6 py-20 text-center md:py-24">
          <Reveal direction="up" className="flex flex-col items-center gap-6">
            <h2 className="max-w-2xl text-display-lg font-bold text-white">{t("contact.title")}</h2>
            <p className="max-w-xl text-body-lg text-navy-300">{t("contact.subtitle")}</p>
            <Button href={`mailto:${CONTACT_EMAIL}`} variant="primary">{t("contact.button")}</Button>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-body-sm font-medium text-teal-400 transition-colors hover:text-teal-200">
              {CONTACT_EMAIL}
            </a>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
