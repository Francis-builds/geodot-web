import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODULES, MODULE_GROUPS, MODULE_SLUGS, modulesInGroup, type ModuleSlug } from "@/lib/modules";
import { Section, SectionHeader } from "./ui/Section";
import type { CSSProperties } from "react";
import { InView } from "./ui/InView";
import { ModuleIcon } from "./ui/ModuleIcon";

// Bento layout for the Core group: varied spans so the grid reads as a
// composition, not equal cards. 12-col grid on lg; first tile is the hero tile.
const BENTO: Record<number, string[]> = {
  5: ["lg:col-span-7 lg:row-span-2", "lg:col-span-5", "lg:col-span-5", "lg:col-span-6", "lg:col-span-6"],
  4: ["lg:col-span-7 lg:row-span-2", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"],
  3: ["lg:col-span-6 lg:row-span-2", "lg:col-span-6", "lg:col-span-6"],
  2: ["lg:col-span-6", "lg:col-span-6"],
  1: ["lg:col-span-12"],
};

const LIFT = "transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-sm";

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Large tile: the Core bento and an industry's entry modules. */
function FeatureCard({ slug, hero }: { slug: ModuleSlug; hero: boolean }) {
  const t = useTranslations("modules");
  const { messageKey: key } = MODULES[slug];
  return (
    <Link
      href={`/plataforma/${slug}`}
      className={`group flex h-full min-h-[180px] flex-col justify-between rounded-xl border border-navy-100 bg-white p-6 md:p-7 ${LIFT}`}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-accent-sm">
        <ModuleIcon slug={slug} className={hero ? "h-7 w-7" : "h-6 w-6"} />
      </span>

      <div className="mt-6">
        <h3 className={`font-semibold text-navy-900 ${hero ? "text-heading-lg" : "text-heading-sm"}`}>{t(`${key}.name`)}</h3>
        <p className={`mt-2 text-navy-600 ${hero ? "text-body-md" : "text-body-sm"}`}>{t(`${key}.tagline`)}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold uppercase tracking-wide text-accent-sm opacity-0 transition-[translate,opacity] duration-300 group-hover:translate-x-1 group-hover:opacity-100">
          {t("explore")}
          <Arrow />
        </span>
      </div>

      <div className="mt-6 border-t border-navy-100 pt-4">
        <p className={`font-bold text-navy-900 ${hero ? "text-display-lg" : "text-heading-lg"}`}>{t(`${key}.cardMetric.value`)}</p>
        <p className="mt-0.5 text-caption text-navy-600">{t(`${key}.cardMetric.label`)}</p>
      </div>
    </Link>
  );
}

/** Compact row card: Especializados, Operativos and an industry's cross-sell. */
function CompactCard({ slug }: { slug: ModuleSlug }) {
  const t = useTranslations("modules");
  const { messageKey: key } = MODULES[slug];
  return (
    <Link
      href={`/plataforma/${slug}`}
      className={`group flex h-full items-start gap-4 rounded-xl border border-navy-100 bg-white p-5 ${LIFT}`}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-accent-sm">
        <ModuleIcon slug={slug} className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h3 className="flex items-center gap-1.5 text-heading-sm font-semibold text-navy-900">
          {t(`${key}.name`)}
          <span className="text-accent-sm opacity-0 transition-[translate,opacity] duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            <Arrow />
          </span>
        </h3>
        <p className="mt-1 text-body-sm text-navy-600">{t(`${key}.tagline`)}</p>
        <p className="mt-3 text-caption">
          <span className="font-bold text-navy-900">{t(`${key}.cardMetric.value`)}</span>{" "}
          <span className="text-navy-600">{t(`${key}.cardMetric.label`)}</span>
        </p>
      </div>
    </Link>
  );
}

function GroupHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-1 border-t border-navy-100 pt-6 md:flex-row md:items-baseline md:justify-between md:gap-8">
      <h3 className="text-overline font-semibold uppercase tracking-wide text-accent-sm">{title}</h3>
      {description && <p className="max-w-xl text-body-sm text-navy-600 md:text-right">{description}</p>}
    </div>
  );
}

function Bento({ slugs }: { slugs: readonly ModuleSlug[] }) {
  const spans = BENTO[Math.min(slugs.length, 5)] ?? [];
  return (
    <InView className="rv-stagger grid auto-rows-[minmax(0,1fr)] gap-4 sm:gap-5 lg:grid-cols-12">
      {slugs.map((slug, i) => (
        <div key={slug} className={spans[i] ?? "lg:col-span-6"} style={{ "--i": i } as CSSProperties}>
          <FeatureCard slug={slug} hero={i === 0 && slugs.length > 2} />
        </div>
      ))}
    </InView>
  );
}

function CompactGrid({ slugs }: { slugs: readonly ModuleSlug[] }) {
  return (
    <InView className="rv-stagger grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {slugs.map((slug, i) => (
        <div key={slug} style={{ "--i": i } as CSSProperties}>
          <CompactCard slug={slug} />
        </div>
      ))}
    </InView>
  );
}

/**
 * Module catalog. Default: the 11 modules grouped by tier (Core as the bento,
 * Especializados and Operativos as compact rows). `slugs` limits the catalog
 * (industry pages); with `entry`, those modules lead as large tiles and the
 * rest of `slugs` render as the cross-sell row.
 */
export function ModuleGrid({ title, titleAccent, description, slugs, entry }: {
  title: string; titleAccent?: string; description?: string;
  slugs?: readonly ModuleSlug[]; entry?: readonly ModuleSlug[];
}) {
  const t = useTranslations("modules");
  const list = slugs ?? MODULE_SLUGS;

  if (entry?.length) {
    const rest = list.filter((s) => !entry.includes(s));
    return (
      <Section tone="subtle">
        <SectionHeader title={title} titleAccent={titleAccent} description={description} />
        <GroupHeading title={t("entryTitle")} />
        <Bento slugs={entry} />
        {rest.length > 0 && (
          <div className="mt-14">
            <GroupHeading title={t("crossSellTitle")} />
            <CompactGrid slugs={rest} />
          </div>
        )}
      </Section>
    );
  }

  return (
    <Section tone="subtle">
      <SectionHeader title={title} titleAccent={titleAccent} description={description} />
      <div className="space-y-14">
        {MODULE_GROUPS.map((group) => {
          const items = modulesInGroup(group, list);
          if (!items.length) return null;
          return (
            <div key={group}>
              <GroupHeading title={t(`groups.${group}.title`)} description={t(`groups.${group}.description`)} />
              {group === "core" ? <Bento slugs={items} /> : <CompactGrid slugs={items} />}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
