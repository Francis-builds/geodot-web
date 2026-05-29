"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "./LocaleSwitch";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

export function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/plataforma", label: t("plataforma") },
    { href: "/industrias/bebidas", label: t("industrias") },
    { href: "/casos-exito", label: t("casos") },
    { href: "/nosotros", label: t("nosotros") },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-heading-md font-bold text-navy-900">geo<span className="text-teal-500">dot</span></Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-body-sm font-medium text-navy-700 hover:text-teal-600">{l.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <LocaleSwitch />
          <Button href="/contacto">{t("cta")}</Button>
        </div>
        <button className="md:hidden text-navy-900" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      </Container>
      {open && (
        <div className="border-t border-navy-100 bg-white md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-body-md text-navy-700" onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            <div className="flex items-center justify-between"><LocaleSwitch /><Button href="/contacto">{t("cta")}</Button></div>
          </Container>
        </div>
      )}
    </header>
  );
}
