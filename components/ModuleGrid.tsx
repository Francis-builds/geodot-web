import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODULES, MODULE_SLUGS } from "@/lib/modules";
import { Section, SectionHeader } from "./ui/Section";
import { Reveal } from "./ui/Reveal";
import { Icon } from "./ui/Icon";

// Bento layout: varied spans so the grid reads as a composition, not 4 equal cards.
// 12-col grid on lg. First tile is the hero tile (wider + taller).
const SPANS: Record<number, string> = {
  0: "lg:col-span-7 lg:row-span-2",
  1: "lg:col-span-5",
  2: "lg:col-span-5",
  3: "lg:col-span-7",
};

export function ModuleGrid({ title, titleAccent, description }: {
  title: string; titleAccent?: string; description?: string;
}) {
  const t = useTranslations("modules");

  return (
    <Section tone="subtle">
      <SectionHeader
        title={title} titleAccent={titleAccent} description={description}
      />
      <div className="grid auto-rows-[minmax(0,1fr)] gap-4 sm:gap-5 lg:grid-cols-12">
        {MODULE_SLUGS.map((slug, i) => {
          const { messageKey: key, icon } = MODULES[slug];
          const hero = i === 0;
          return (
            <Reveal key={slug} direction="up" delay={i * 0.06} className={SPANS[i]}>
              <Link
                href={`/plataforma/${slug}`}
                className="group flex h-full min-h-[180px] flex-col justify-between rounded-xl border border-navy-100 bg-white p-6 transition-shadow hover:shadow-sm md:p-7"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-accent-sm">
                  <Icon name={icon} className={hero ? "h-6 w-6" : "h-5 w-5"} />
                </span>

                <div className="mt-6">
                  <h3 className={`font-semibold text-navy-900 ${hero ? "text-heading-lg" : "text-heading-sm"}`}>
                    {t(`${key}.name`)}
                  </h3>
                  <p className={`mt-2 text-navy-600 ${hero ? "text-body-md" : "text-body-sm"}`}>
                    {t(`${key}.tagline`)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold uppercase tracking-wide text-accent-sm opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                    {t("explore")}
                    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>

                <div className="mt-6 border-t border-navy-100 pt-4">
                  <p className={`font-bold text-navy-900 ${hero ? "text-display-lg" : "text-heading-lg"}`}>
                    {t(`${key}.cardMetric.value`)}
                  </p>
                  <p className="mt-0.5 text-caption text-navy-600">{t(`${key}.cardMetric.label`)}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
