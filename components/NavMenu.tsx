"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODULES, MODULE_GROUPS, MODULE_SLUGS, type ModuleGroup, type ModuleSlug } from "@/lib/modules";
import { ModuleIcon } from "./ui/ModuleIcon";
import { INDUSTRIES, INDUSTRY_SLUGS } from "@/lib/industries";

type MenuKind = "platform" | "industries";

export type MenuItem = {
  href: string;
  name: string;
  tagline: string;
  /** Platform items only: drives the pictogram and the per-group columns. */
  module?: { slug: ModuleSlug; group: ModuleGroup };
};

/** Build the item list for a menu from the registries + messages. */
function usePlatformItems(): MenuItem[] {
  const t = useTranslations("modules");
  return MODULE_SLUGS.map((slug) => {
    const { messageKey: key, group } = MODULES[slug];
    return {
      href: `/plataforma/${slug}`,
      name: t(`${key}.name`),
      tagline: t(`${key}.tagline`),
      module: { slug, group },
    };
  });
}

function useIndustryItems(): MenuItem[] {
  const t = useTranslations("industries");
  return INDUSTRY_SLUGS.map((slug) => {
    const { messageKey: key } = INDUSTRIES[slug];
    return {
      href: `/industrias/${slug}`,
      name: t(`${key}.name`),
      tagline: t(`${key}.tagline`),
    };
  });
}

/** Compact platform row: pictogram + name (11 modules × tagline was too tall). */
function ModuleRow({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className="group/row flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
    >
      {item.module && <ModuleIcon slug={item.module.slug} className="h-5 w-5 shrink-0 text-teal-700" />}
      <span className="text-body-sm font-semibold text-navy-900 transition-colors duration-200 group-hover/row:text-teal-700">{item.name}</span>
    </Link>
  );
}

/** Platform panel body: one column per catalog group (Core / Especializados / Operativos). */
function PlatformColumns({ items, onSelect }: { items: MenuItem[]; onSelect: () => void }) {
  const t = useTranslations("modules");
  return (
    <div className="grid grid-cols-3 gap-x-2">
      {MODULE_GROUPS.map((g) => (
        <div key={g}>
          <p className="px-3 pb-1 pt-2 text-caption font-semibold uppercase tracking-wide text-navy-600">{t(`groups.${g}.title`)}</p>
          {items.filter((i) => i.module?.group === g).map((item) => (
            <ModuleRow key={item.href} item={item} onSelect={onSelect} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop dropdown trigger + panel                                    */
/* ------------------------------------------------------------------ */

function MenuRow({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className="group/row block rounded-lg px-4 py-3 transition-colors duration-200 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
    >
      <span className="block text-body-sm font-semibold text-navy-900 transition-colors duration-200 group-hover/row:text-teal-700">{item.name}</span>
      <span className="mt-0.5 block text-caption leading-snug text-navy-600">{item.tagline}</span>
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

  const tUi = useTranslations("ui.nav");
  const [open, setOpen] = useState(false);
  // Opened by hover and then clicked on the chevron: keep it open (a click must not close what hover opened).
  const [pinned, setPinned] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const close = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(false);
    setPinned(false);
  }, []);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(close, 120);
  };

  // Close on Esc (returning focus to the chevron) + pointer down outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (wrapRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
      close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  const wide = kind === "industries";

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center"
      // Hover only drives mouse pointers; touch/pen use the chevron button.
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelClose();
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse" || pinned) return;
        scheduleClose();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close();
      }}
    >
      <Link
        href={viewAllHref}
        onClick={close}
        className={`text-body-sm font-medium transition-colors duration-200 ${linkColor}`}
      >
        {label}
      </Link>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={tUi("toggleSubmenu", { label })}
        onClick={(e) => {
          // A mouse click on a hover-opened menu pins it; otherwise it toggles.
          if (open && !pinned && e.detail > 0 && window.matchMedia("(hover: hover)").matches) {
            setPinned(true);
            return;
          }
          if (open) close();
          else setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown") return;
          e.preventDefault();
          setOpen(true);
          // Wait a frame so the panel is no longer inert, then focus the first row.
          requestAnimationFrame(() => wrapRef.current?.querySelector<HTMLElement>(`#${CSS.escape(panelId)} a`)?.focus());
        }}
        className={`ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${linkColor}`}
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={`h-3.5 w-3.5 fill-none stroke-current transition-[rotate] duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Visual dim only: never captures pointer events, so it can't hold the menu open. */}
      {open && <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 top-16 z-40 bg-navy-950/25 md:top-[72px]" />}
      <div
        id={panelId}
        inert={!open}
        className={`absolute top-full z-50 pt-3 ${
          // the wide platform panel anchors to its trigger's left edge so it never runs off-screen
          kind === "platform" ? "left-0" : "left-1/2 -translate-x-1/2"
        } ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`origin-top rounded-xl border border-navy-100 bg-white p-3 shadow-pop transition-[opacity,translate,scale] duration-200 motion-reduce:transition-none ${
            open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-1 scale-[0.98] opacity-0"
          } ${wide ? "w-[40rem]" : "w-[44rem]"}`}
        >
          {kind === "platform" ? (
            <PlatformColumns items={items} onSelect={close} />
          ) : (
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {items.map((item) => (
                <MenuRow key={item.href} item={item} onSelect={close} />
              ))}
            </div>
          )}
          <Link
            href={viewAllHref}
            onClick={close}
            className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border-t border-navy-100/70 px-3 py-2.5 text-body-sm font-semibold text-teal-700 transition-colors duration-200 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
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
        className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-body-md font-medium text-navy-900 transition-colors hover:text-teal-700"
      >
        {label}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={`h-4 w-4 fill-none stroke-current transition-[rotate] duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        id={panelId}
        inert={!open}
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${open ? "max-h-[1200px]" : "max-h-0"}`}
      >
        <div className="flex flex-col gap-0.5 pb-2 pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-navy-50"
            >
              {item.module && <ModuleIcon slug={item.module.slug} className="h-5 w-5 shrink-0 text-teal-700" />}
              <span className="min-w-0">
                <span className="block text-body-sm font-semibold text-navy-900">{item.name}</span>
                <span className="block text-caption leading-snug text-navy-600">{item.tagline}</span>
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
