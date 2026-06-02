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

  const linkClass =
    "text-body-sm text-navy-200 transition-colors hover:text-teal-300";
  const headingClass =
    "mb-4 text-overline font-semibold uppercase tracking-wide text-navy-400";

  return (
    <footer className="relative isolate overflow-hidden bg-navy-950 text-navy-200">
      {/* Top hairline + subtle teal seam */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
      {/* Dot-grid texture */}
      <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.05]" />
      {/* Faint brand glows */}
      <div aria-hidden className="absolute inset-0 glow-teal opacity-50" style={{ ["--gx" as string]: "88%", ["--gy" as string]: "0%" }} />
      <div aria-hidden className="absolute inset-0 glow-magenta opacity-40" style={{ ["--gx" as string]: "8%", ["--gy" as string]: "100%" }} />

      <Container className="relative z-[1] grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] md:py-20">
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
          <h3 className={headingClass}>{t("platform")}</h3>
          <ul className="space-y-2.5">
            {MODULE_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/plataforma/${slug}`} className={linkClass}>
                  {tMod(`${MODULES[slug].messageKey}.name`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/plataforma" className={`${linkClass} font-medium text-teal-300/90`}>
                {t("allModules")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Industrias */}
        <div>
          <h3 className={headingClass}>{t("industries")}</h3>
          <ul className="space-y-2.5">
            {INDUSTRY_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/industrias/${slug}`} className={linkClass}>
                  {tInd(`${INDUSTRIES[slug].messageKey}.name`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/industrias" className={`${linkClass} font-medium text-teal-300/90`}>
                {t("allIndustries")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Recursos */}
        <div>
          <h3 className={headingClass}>{t("resources")}</h3>
          <ul className="space-y-2.5">
            <li><Link href="/recursos" className={linkClass}>{tNav("recursos")}</Link></li>
            <li><Link href="/casos-exito" className={linkClass}>{t("cases")}</Link></li>
            <li><Link href="/integraciones" className={linkClass}>{tNav("integraciones")}</Link></li>
            <li><Link href="/partners" className={linkClass}>{tNav("partners")}</Link></li>
            <li><Link href="/preguntas-frecuentes" className={linkClass}>{t("faq")}</Link></li>
          </ul>
        </div>

        {/* Empresa */}
        <div>
          <h3 className={headingClass}>{t("company")}</h3>
          <ul className="space-y-2.5">
            <li><Link href="/nosotros" className={linkClass}>{t("about")}</Link></li>
            <li><Link href="/contacto" className={linkClass}>{t("contact")}</Link></li>
          </ul>
        </div>
      </Container>

      <div className="relative z-[1] border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-caption text-navy-400 sm:flex-row">
          <span>{t("rights")}</span>
          <ul className="flex items-center gap-5">
            <li><Link href="/privacidad" className="transition-colors hover:text-teal-300">{t("privacy")}</Link></li>
            <li><Link href="/terminos" className="transition-colors hover:text-teal-300">{t("terms")}</Link></li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
