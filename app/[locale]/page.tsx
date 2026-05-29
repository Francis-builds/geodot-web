import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("nav");
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <h1 className="text-display-xl font-bold text-navy-900">Geodot</h1>
      <p className="mt-4 text-body-lg text-navy-600">{t("cta")}</p>
    </section>
  );
}
