import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { Section, SectionHeader } from "@/components/ui/Section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  return (
    <Section tone="subtle">
      <div className="mx-auto max-w-xl">
        <SectionHeader title={t("title")} description={t("subtitle")} />
        <ContactForm />
      </div>
    </Section>
  );
}
