import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default async function NotFound() {
  const t = await getTranslations("ui.notFound");
  return (
    <section className="bg-navy-50">
      <Container className="flex flex-col items-center gap-6 py-32 text-center">
        <h1 className="text-display-lg font-bold text-navy-900">{t("title")}</h1>
        <p className="max-w-md text-body-lg text-navy-600">{t("body")}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" variant="primary">{t("home")}</Button>
          <Button href="/plataforma" variant="ghost">{t("platform")}</Button>
          <Button href="/contacto" variant="ghost">{t("contact")}</Button>
        </div>
      </Container>
    </section>
  );
}
