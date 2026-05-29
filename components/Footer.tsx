import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "./ui/Container";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="relative isolate overflow-hidden bg-navy-950 text-navy-200">
      {/* Top hairline + subtle teal seam */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
      {/* Dot-grid texture */}
      <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.05]" />
      {/* Faint brand glows */}
      <div aria-hidden className="absolute inset-0 glow-teal opacity-50" style={{ ["--gx" as string]: "88%", ["--gy" as string]: "0%" }} />
      <div aria-hidden className="absolute inset-0 glow-magenta opacity-40" style={{ ["--gx" as string]: "8%", ["--gy" as string]: "100%" }} />

      <Container className="relative z-[1] grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-20">
        <div>
          <span className="inline-flex items-center gap-2.5">
            <span aria-hidden className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_0_4px_rgba(0,169,157,0.2)]" />
            <span className="text-heading-md font-bold tracking-tight text-white">geo<span className="text-teal-400">dot</span></span>
          </span>
          <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-navy-300">{t("tagline")}</p>
        </div>

        <div>
          <h3 className="mb-4 text-overline font-semibold uppercase tracking-wide text-navy-400">{t("platform")}</h3>
          <ul className="space-y-2.5">
            <li><Link href="/plataforma" className="text-body-sm text-navy-200 transition-colors hover:text-teal-300">{t("allModules")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-overline font-semibold uppercase tracking-wide text-navy-400">{t("company")}</h3>
          <ul className="space-y-2.5">
            <li><Link href="/nosotros" className="text-body-sm text-navy-200 transition-colors hover:text-teal-300">{t("about")}</Link></li>
            <li><Link href="/casos-exito" className="text-body-sm text-navy-200 transition-colors hover:text-teal-300">{t("cases")}</Link></li>
            <li><Link href="/recursos" className="text-body-sm text-navy-200 transition-colors hover:text-teal-300">{t("resources")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-overline font-semibold uppercase tracking-wide text-navy-400">{t("contact")}</h3>
          <ul className="space-y-2.5">
            <li><Link href="/contacto" className="text-body-sm text-navy-200 transition-colors hover:text-teal-300">{t("demo")}</Link></li>
          </ul>
        </div>
      </Container>

      <div className="relative z-[1] border-t border-white/10">
        <Container className="py-6 text-center text-caption text-navy-400">{t("rights")}</Container>
      </div>
    </footer>
  );
}
