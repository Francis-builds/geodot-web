import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "./ui/Container";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-navy-900 text-navy-200">
      <Container className="grid gap-8 py-16 md:grid-cols-4">
        <div>
          <span className="text-heading-md font-bold text-white">geo<span className="text-teal-400">dot</span></span>
          <p className="mt-3 text-body-sm text-navy-300">{t("tagline")}</p>
        </div>
        <div>
          <h3 className="mb-3 text-overline uppercase tracking-wide text-navy-400">{t("platform")}</h3>
          <Link href="/plataforma" className="block text-body-sm hover:text-teal-300">{t("allModules")}</Link>
        </div>
        <div>
          <h3 className="mb-3 text-overline uppercase tracking-wide text-navy-400">{t("company")}</h3>
          <Link href="/nosotros" className="block text-body-sm hover:text-teal-300">{t("about")}</Link>
          <Link href="/casos-exito" className="block text-body-sm hover:text-teal-300">{t("cases")}</Link>
        </div>
        <div>
          <h3 className="mb-3 text-overline uppercase tracking-wide text-navy-400">{t("contact")}</h3>
          <Link href="/contacto" className="block text-body-sm hover:text-teal-300">{t("demo")}</Link>
        </div>
      </Container>
      <div className="border-t border-navy-800 py-6 text-center text-caption text-navy-400">{t("rights")}</div>
    </footer>
  );
}
