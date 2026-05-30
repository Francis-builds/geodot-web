"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODULES, MODULE_SLUGS } from "@/lib/modules";
import { INDUSTRIES, INDUSTRY_SLUGS } from "@/lib/industries";
import { Icon } from "./ui/Icon";

type MenuKind = "platform" | "industries";

export type MenuItem = {
  href: string;
  icon: string;
  name: string;
  tagline: string;
};

/** Build the item list for a menu from the registries + messages. */
function usePlatformItems(): MenuItem[] {
  const t = useTranslations("modules");
  return MODULE_SLUGS.map((slug) => {
    const { messageKey: key, icon } = MODULES[slug];
    return {
      href: `/plataforma/${slug}`,
      icon,
      name: t(`${key}.name`),
      tagline: t(`${key}.tagline`),
    };
  });
}

function useIndustryItems(): MenuItem[] {
  const t = useTranslations("industries");
  return INDUSTRY_SLUGS.map((slug) => {
    const { messageKey: key, icon } = INDUSTRIES[slug];
    return {
      href: `/industrias/${slug}`,
      icon,
      name: t(`${key}.name`),
      tagline: t(`${key}.tagline`),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Desktop dropdown trigger + panel                                    */
/* ------------------------------------------------------------------ */

function MenuRow({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      role="menuitem"
      className="group/row flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-teal-50 focus-visible:bg-teal-50 focus-visible:outline-none"
    >
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy-100 bg-white text-teal-600 transition-colors duration-200 group-hover/row:border-teal-300 group-hover/row:bg-teal-500 group-hover/row:text-white">
        <Icon name={item.icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-body-sm font-semibold text-navy-900">{item.name}</span>
        <span className="block truncate text-caption text-navy-500">{item.tagline}</span>
      </span>
    </Link>
  );
}

function DesktopMenu({
  kind,
  label,
  linkColor,
}: {
  kind: MenuKind;
  label: string;
  linkColor: string;
}) {
  const t = useTranslations("nav");
  const platformItems = usePlatformItems();
  const industryItems = useIndustryItems();
  const items = kind === "platform" ? platformItems : industryItems;
  const viewAllHref = kind === "platform" ? "/plataforma" : "/industrias";
  const viewAllLabel = kind === "platform" ? t("platformAll") : t("industriesAll");

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  // Close on Esc + click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const wide = kind === "industries";

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose();
        setOpen(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 text-body-sm font-medium transition-colors duration-200 ${linkColor}`}
      >
        {label}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={`h-3.5 w-3.5 fill-none stroke-current transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id={panelId}
        role="menu"
        aria-label={label}
        className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`origin-top rounded-2xl border border-navy-100/80 glass p-2.5 shadow-pop transition-all duration-200 ${
            open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-1 scale-[0.98] opacity-0"
          } ${wide ? "w-[34rem]" : "w-[26rem]"}`}
        >
          <div className={`grid gap-0.5 ${wide ? "grid-cols-2" : "grid-cols-1"}`}>
            {items.map((item) => (
              <MenuRow key={item.href} item={item} onSelect={() => setOpen(false)} />
            ))}
          </div>
          <Link
            href={viewAllHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border-t border-navy-100/70 px-3 py-2.5 text-body-sm font-semibold text-teal-700 transition-colors duration-200 hover:bg-teal-50 focus-visible:bg-teal-50 focus-visible:outline-none"
          >
            {viewAllLabel}
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Desktop mega-nav: platform + industries dropdowns. */
export function DesktopNavMenus({ linkColor }: { linkColor: string }) {
  const t = useTranslations("nav");
  return (
    <>
      <DesktopMenu kind="platform" label={t("plataforma")} linkColor={linkColor} />
      <DesktopMenu kind="industries" label={t("industrias")} linkColor={linkColor} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile accordion                                                    */
/* ------------------------------------------------------------------ */

function MobileAccordion({
  kind,
  label,
  onNavigate,
}: {
  kind: MenuKind;
  label: string;
  onNavigate: () => void;
}) {
  const t = useTranslations("nav");
  const platformItems = usePlatformItems();
  const industryItems = useIndustryItems();
  const items = kind === "platform" ? platformItems : industryItems;
  const viewAllHref = kind === "platform" ? "/plataforma" : "/industrias";
  const viewAllLabel = kind === "platform" ? t("platformAll") : t("industriesAll");

  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-navy-100/70 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-body-md font-medium text-navy-800 transition-colors hover:text-teal-600"
      >
        {label}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={`h-4 w-4 fill-none stroke-current transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={panelId}
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${open ? "max-h-[640px]" : "max-h-0"}`}
      >
        <div className="flex flex-col gap-0.5 pb-2 pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-navy-50"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-navy-100 bg-white text-teal-600">
                <Icon name={item.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-body-sm font-semibold text-navy-900">{item.name}</span>
                <span className="block truncate text-caption text-navy-500">{item.tagline}</span>
              </span>
            </Link>
          ))}
          <Link
            href={viewAllHref}
            onClick={onNavigate}
            className="mt-1 rounded-lg px-2 py-2 text-body-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Mobile drawer accordions for platform + industries. */
export function MobileNavMenus({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations("nav");
  return (
    <div className="rounded-xl border border-navy-100/70">
      <MobileAccordion kind="platform" label={t("plataforma")} onNavigate={onNavigate} />
      <MobileAccordion kind="industries" label={t("industrias")} onNavigate={onNavigate} />
    </div>
  );
}
