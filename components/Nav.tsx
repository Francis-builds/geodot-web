"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "./LocaleSwitch";
import { Container } from "./ui/Container";
import { DesktopNavMenus, MobileNavMenus } from "./NavMenu";

/** Official geodot logo — full-color over light surfaces, white over the dark hero. */
function Logo({ scrolled }: { scrolled: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="Geodot">
      <Image
        src={scrolled ? "/images/brand/geodot-logo.png" : "/images/brand/geodot-logo-white.png"}
        alt="Geodot"
        width={527}
        height={162}
        priority
        className="h-7 w-auto md:h-8"
      />
    </Link>
  );
}

export function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Only float transparent when a dark hero is present at the top of the page.
  const [overHero, setOverHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A cinematic <Hero> renders [data-hero-overlay]; if absent, the nav stays solid.
  // One-shot post-mount DOM read; intentional setState in effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverHero(!!document.querySelector("[data-hero-overlay]"));
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Plataforma + Industrias are dropdown menus (see <DesktopNavMenus> /
  // <MobileNavMenus>); the rest stay as plain links.
  const links = [
    { href: "/integraciones", label: t("integraciones") },
    { href: "/partners", label: t("partners") },
    { href: "/casos-exito", label: t("casos") },
    { href: "/recursos", label: t("recursos") },
    { href: "/nosotros", label: t("nosotros") },
  ];

  // Over the hero (top): transparent, light text. Scrolled, drawer open, or no
  // hero present: glass, dark text.
  const solid = scrolled || open || !overHero;
  const linkColor = solid
    ? "text-navy-700 hover:text-teal-600"
    : "text-white/85 hover:text-white";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color] duration-300 ${
        solid
          ? "glass border-b border-navy-100/80 shadow-nav"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between md:h-[72px]">
        <Logo scrolled={solid} />

        <nav className="hidden items-center gap-7 md:flex">
          <DesktopNavMenus linkColor={linkColor} />
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-body-sm font-medium transition-colors duration-200 ${linkColor}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <LocaleSwitch dark={!solid} />
          <Link
            href="/contacto"
            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-body-sm font-semibold shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/45 ${
              solid
                ? "bg-magenta-500 text-white hover:bg-magenta-600"
                : "bg-white/12 text-white ring-1 ring-inset ring-white/25 backdrop-blur hover:bg-white/20"
            }`}
          >
            {t("cta")}
          </Link>
        </div>

        <button
          className={`flex h-10 w-10 items-center justify-center md:hidden ${
            solid ? "text-navy-900" : "text-white"
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="relative flex h-4 w-5 flex-col justify-between">
            <span className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </Container>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-navy-100/80 bg-white md:hidden ${
          open ? "max-h-[80vh]" : "max-h-0 border-t-transparent"
        } transition-[max-height] duration-300 ease-out`}
      >
        <Container className="flex flex-col gap-1 py-4">
          <MobileNavMenus onNavigate={() => setOpen(false)} />
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-2 py-2.5 text-body-md font-medium text-navy-800 transition-colors hover:bg-navy-50 hover:text-teal-600"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-4">
            <LocaleSwitch />
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-magenta-500 px-6 py-3 text-body-sm font-semibold text-white shadow-sm transition-colors hover:bg-magenta-600"
            >
              {t("cta")}
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
