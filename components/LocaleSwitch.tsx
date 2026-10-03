"use client";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

const LOCALES = ["es", "en"] as const;

// Segmented control: both languages are always visible, the active one filled.
export function LocaleSwitch({ dark = false }: { dark?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("ui.nav");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("switchLanguage")}
      className={`inline-flex h-9 items-center gap-1 rounded-full border p-0.5 pl-2 transition-colors duration-200 ${
        dark ? "border-white/30 text-white/80" : "border-navy-200 text-navy-600"
      }`}
    >
      <Globe aria-hidden className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={active}
            onClick={() => !active && router.replace(pathname, { locale: l })}
            className={`relative h-8 min-w-9 rounded-full px-2 text-body-sm font-semibold uppercase tracking-wide transition-colors duration-200 after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] ${
              active
                ? dark
                  ? "bg-white text-navy-900"
                  : "bg-navy-900 text-white"
                : dark
                  ? "hover:text-white"
                  : "hover:text-teal-700"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
