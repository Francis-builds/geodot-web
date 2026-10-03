import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { INDUSTRIES, INDUSTRY_SLUGS } from "@/lib/industries";
import { Section, SectionHeader } from "./ui/Section";
import type { CSSProperties } from "react";
import { InView } from "./ui/InView";
import { Icon } from "./ui/Icon";

export function IndustryGrid({ title, titleAccent, description }: {
  title: string; titleAccent?: string; description?: string;
}) {
  const t = useTranslations("industries");
  const tIdx = useTranslations("industriesIndex");

  return (
    <Section tone="subtle">
      <SectionHeader
        title={title} titleAccent={titleAccent} description={description}
      />
      <InView className="rv-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRY_SLUGS.map((slug, i) => {
          const { messageKey: key, icon, hero } = INDUSTRIES[slug];
          return (
            <div key={slug} style={{ "--i": i } as CSSProperties}>
              <Link
                href={`/industrias/${slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-navy-100 bg-white transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-sm"
              >
                {/* thumbnail */}
                <span className="rv-clip relative block aspect-[16/10] overflow-hidden rounded-t-xl">
                  <Image
                    src={hero}
                    alt={t(`${key}.name`)}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>

                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-accent-sm">
                    <Icon name={icon} className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-heading-sm font-semibold text-navy-900">{t(`${key}.name`)}</h3>
                  <p className="mt-2 text-body-sm text-navy-600">{t(`${key}.tagline`)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold uppercase tracking-wide text-accent-sm transition-transform duration-300 group-hover:translate-x-1">
                    {tIdx("explore")}
                    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </InView>
    </Section>
  );
}
