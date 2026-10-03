"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitch } from "./LocaleSwitch";
import { Button } from "./ui/Button";
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
  const tUi = useTranslations("ui.nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Hide while reading down, come back on any scroll up (and always near the top).
  const [hidden, setHidden] = useState(false);
  // Only float transparent when a dark hero is present at the top of the page.
  const [overHero, setOverHero] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 320);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A dark hero renders [data-hero-overlay]; if absent, the nav stays solid.
  // Re-read on every route change: the Nav lives in the layout and survives
  // client-side navigation. Intentional setState in effect (DOM read).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverHero(!!document.querySelector("[data-hero-overlay]"));
    setHidden(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open + make the page content
  // behind the drawer inert so focus/AT can't reach it.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.getElementById("contenido")?.toggleAttribute("inert", open);
    return () => {
      document.body.style.overflow = "";
      document.getElementById("contenido")?.removeAttribute("inert");
    };
  }, [open]);

  // Close the drawer with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Plataforma + Industrias are dropdown menus (see <DesktopNavMenus> /
  // <MobileNavMenus>); the rest stay as plain links.
  const links = [
    { href: "/integraciones", label: t("integraciones") },
    { href: "/casos-exito", label: t("casos") },
    { href: "/recursos", label: t("recursos") },
    { href: "/nosotros", label: t("nosotros") },
  ];

  // Over the hero (top): transparent, light text. Scrolled, drawer open, or no
  // hero present: glass, dark text.
  const solid = scrolled || open || !overHero;
  const linkColor = solid
    ? "text-navy-600 hover:text-teal-700"
    : "text-white/85 hover:text-white";

  return (
    <header
      onFocusCapture={() => setHidden(false)}
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color,translate] duration-300 ease-out ${
        hidden && !open ? "-translate-y-full" : ""
      } ${
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
          {/* Same Button recipe (size included) as everywhere else in the site. */}
          <Button href="/contacto" variant={solid ? "primary" : "outline-light"}>
            {t("cta")}
          </Button>
        </div>

        <button
          className={`flex h-11 w-11 items-center justify-center md:hidden ${
            solid ? "text-navy-900" : "text-white"
          }`}
          onClick={() => setOpen(!open)}
          aria-label={tUi("menu")}
          aria-expanded={open}
          aria-controls="nav-drawer"
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
        id="nav-drawer"
        inert={!open}
        className={`border-t border-navy-100/80 bg-white md:hidden ${
          open ? "max-h-[80vh] overflow-y-auto" : "max-h-0 overflow-hidden border-t-0"
        } transition-[max-height] duration-300 ease-out`}
      >
        <Container className="flex flex-col gap-1 py-4">
          <MobileNavMenus onNavigate={() => setOpen(false)} />
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-2 py-2.5 text-body-md font-medium text-navy-900 transition-colors hover:bg-navy-50 hover:text-teal-700"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-4">
            <LocaleSwitch />
            <Button href="/contacto" variant="primary" onClick={() => setOpen(false)}>
              {t("cta")}
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
