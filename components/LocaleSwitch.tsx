"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LocaleSwitch({ dark = false }: { dark?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const toggle = () => router.replace(pathname, { locale: locale === "es" ? "en" : "es" });
  return (
    <button
      onClick={toggle}
      className={`inline-flex h-11 min-w-11 items-center justify-center px-2 text-body-sm font-semibold tracking-wide transition-colors duration-200 ${
        dark ? "text-white/80 hover:text-white" : "text-navy-600 hover:text-teal-600"
      }`}
      aria-label="Switch language"
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
