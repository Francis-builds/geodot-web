import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { CTABanner } from "@/components/CTABanner";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "integrationsPage" });
  return { title: `${t("hero.title")} ${t("hero.titleAccent")}`, description: t("hero.subtitle") };
}

export default async function IntegracionesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("integrationsPage");
  const points = t.raw("how.points") as { title: string; body: string }[];
  const systems = t.raw("systems.items") as { name: string; detail: string }[];

  return (
    <>
      <Hero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        titleAccent={t("hero.titleAccent")}
        subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        secondaryCta={{ label: t("hero.cta2"), href: "/plataforma" }}
        bgImage="/images/torre/torre-control.jpg"
        bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`}
      />

      {/* How it integrates — does not replace the ERP */}
      <Section tone="base">
        <SectionHeader
          align="left"
          eyebrow={t("how.eyebrow")}
          title={t("how.title")}
          titleAccent={t("how.titleAccent")}
          description={t("how.description")}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={i} direction="up" delay={i * 0.08}>
              <div className="card-lift h-full rounded-2xl border border-navy-100 bg-white p-7 shadow-sm">
                <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/12 text-body-sm font-bold text-teal-600">
                  {i + 1}
                </span>
                <h3 className="text-heading-sm font-semibold text-navy-900">{p.title}</h3>
                <p className="mt-2 text-body-md leading-relaxed text-navy-600">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Systems grid */}
      <Section tone="subtle">
        <SectionHeader
          eyebrow={t("systems.eyebrow")}
          title={t("systems.title")}
          titleAccent={t("systems.titleAccent")}
          description={t("systems.description")}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {systems.map((s, i) => (
            <Reveal key={i} direction="up" delay={(i % 3) * 0.06}>
              <div className="h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
                <h3 className="text-body-lg font-semibold text-navy-900">{s.name}</h3>
                <p className="mt-1.5 text-body-sm leading-relaxed text-navy-600">{s.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 90-day note */}
      <section className="bg-white">
        <Container className="py-16 md:py-20">
          <Reveal className="mx-auto max-w-3xl rounded-2xl border border-teal-100 bg-teal-50/60 p-8 text-center md:p-10">
            <p className="text-overline font-semibold uppercase tracking-wide text-teal-700">{t("speed.eyebrow")}</p>
            <h2 className="mt-3 text-heading-lg font-semibold text-navy-900">{t("speed.title")}</h2>
            <p className="mt-3 text-body-md leading-relaxed text-navy-600">{t("speed.body")}</p>
          </Reveal>
        </Container>
      </section>

      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
