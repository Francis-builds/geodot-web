import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/Hero";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const steps = t.raw("steps") as { title: string; body: string }[];
  const proof = t.raw("proof") as { value: string; label: string }[];

  return (
    <>
      <Hero
        title={t("title")}
        subtitle={t("subtitle")}
        primaryCta={{ label: t("form.submit"), href: "#form" }}
        bgImage="/images/fleet/itms.jpg"
        bgAlt={t("title")}
      />

      <section className="bg-navy-50">
        <Container className="grid gap-12 py-20 md:grid-cols-2 md:py-24">
          {/* Left: what happens next + proof */}
          <Reveal>
            <h2 className="text-heading-lg font-semibold text-navy-900">{t("sideTitle")}</h2>
            <ol className="mt-8 space-y-7">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/12 text-body-sm font-bold text-teal-600">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-heading-sm font-semibold text-navy-900">{s.title}</h3>
                    <p className="mt-1 text-body-md text-navy-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-navy-100 pt-8">
              {proof.map((p, i) => (
                <div key={i}>
                  <div className="text-heading-lg font-bold text-accent-strong">{p.value}</div>
                  <div className="mt-1 text-caption text-navy-500">{p.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right: form in an elevated card */}
          <Reveal direction="left" delay={0.1}>
            <div id="form" className="card-lift scroll-mt-28 rounded-2xl border border-navy-100 bg-white p-8 shadow-md">
              <ContactForm />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
