import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "./ui/Container";
import { MODULE_SLUGS, MODULES } from "@/lib/modules";
import { INDUSTRY_SLUGS, INDUSTRIES } from "@/lib/industries";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tMod = useTranslations("modules");
  const tInd = useTranslations("industries");
  const tUi = useTranslations("ui.footer");

  const linkClass =
    "inline-block py-2 text-body-sm text-navy-300 transition-colors hover:text-teal-300";
  const headingClass =
    "mb-4 text-overline font-semibold uppercase tracking-wide text-navy-300";

  return (
    <footer className="border-t border-white/10 bg-navy-900 text-navy-300">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] md:py-20">
        {/* Brand */}
        <div>
          <Image
            src="/images/brand/geodot-logo-white.png"
            alt="Geodot"
            width={527}
            height={162}
            className="h-8 w-auto"
          />
          <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-navy-300">{t("tagline")}</p>
        </div>

        {/* Plataforma */}
        <div>
          <p className={headingClass}>{t("platform")}</p>
          <ul className="space-y-2.5">
            {MODULE_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/plataforma/${slug}`} className={linkClass}>
                  {tMod(`${MODULES[slug].messageKey}.name`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/plataforma" className={`${linkClass} font-medium text-teal-400`}>
                {t("allModules")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Industrias */}
        <div>
          <p className={headingClass}>{t("industries")}</p>
          <ul className="space-y-2.5">
            {INDUSTRY_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/industrias/${slug}`} className={linkClass}>
                  {tInd(`${INDUSTRIES[slug].messageKey}.name`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/industrias" className={`${linkClass} font-medium text-teal-400`}>
                {t("allIndustries")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Recursos */}
        <div>
          <p className={headingClass}>{t("resources")}</p>
          <ul className="space-y-2.5">
            <li><Link href="/recursos" className={linkClass}>{tNav("recursos")}</Link></li>
            <li><Link href="/casos-exito" className={linkClass}>{t("cases")}</Link></li>
            <li><Link href="/integraciones" className={linkClass}>{tNav("integraciones")}</Link></li>
            <li><Link href="/preguntas-frecuentes" className={linkClass}>{t("faq")}</Link></li>
          </ul>
        </div>

        {/* Empresa */}
        <div>
          <p className={headingClass}>{t("company")}</p>
          <ul className="space-y-2.5">
            <li><Link href="/nosotros" className={linkClass}>{t("about")}</Link></li>
            <li><Link href="/contacto" className={linkClass}>{t("contact")}</Link></li>
            <li><Link href="/contacto?tipo=partner" className={linkClass}>{tUi("partnerCta")}</Link></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-caption text-navy-300 sm:flex-row">
          <span>{t("rights")}</span>
          <ul className="flex items-center gap-5">
            <li><Link href="/privacidad" className="inline-block py-2 transition-colors hover:text-teal-300">{t("privacy")}</Link></li>
            <li><Link href="/terminos" className="inline-block py-2 transition-colors hover:text-teal-300">{t("terms")}</Link></li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
