"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { INDUSTRIES, INDUSTRY_SLUGS } from "@/lib/industries";
import { Section, SectionHeader } from "./ui/Section";
import { revealItem } from "./ui/Reveal";
import { Icon } from "./ui/Icon";

export function IndustryGrid({ eyebrow, title, titleAccent, description }: {
  eyebrow?: string; title: string; titleAccent?: string; description?: string;
}) {
  const t = useTranslations("industries");
  const tIdx = useTranslations("industriesIndex");
  const reduce = useReducedMotion();

  return (
    <Section tone="dark" texture="glow">
      <SectionHeader
        eyebrow={eyebrow} title={title} titleAccent={titleAccent} description={description}
        tone="dark" accentGradient
      />
      <motion.div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.09 } } }}
      >
        {INDUSTRY_SLUGS.map((slug) => {
          const { messageKey: key, icon, hero } = INDUSTRIES[slug];
          return (
            <motion.div key={slug} variants={reduce ? undefined : revealItem}>
              <Link
                href={`/industrias/${slug}`}
                className="card-lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
              >
                {/* thumbnail */}
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={hero}
                    alt={t(`${key}.name`)}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
                  <span className="absolute left-4 top-4 z-[1] inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-navy-900/70 text-teal-300 backdrop-blur-sm transition-colors duration-300 group-hover:border-teal-400/40 group-hover:bg-teal-500 group-hover:text-white">
                    <Icon name={icon} className="h-5 w-5" />
                  </span>
                </span>

                <div className="relative z-[1] flex flex-1 flex-col p-6">
                  <h3 className="text-heading-sm font-semibold text-white">{t(`${key}.name`)}</h3>
                  <p className="mt-2 text-body-sm text-navy-200">{t(`${key}.tagline`)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold uppercase tracking-wide text-teal-300 transition-all duration-300 group-hover:translate-x-0.5">
                    {tIdx("explore")}
                    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
