"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODULES, MODULE_SLUGS } from "@/lib/modules";
import { Section, SectionHeader } from "./ui/Section";
import { revealItem } from "./ui/Reveal";
import { Icon } from "./ui/Icon";

// Bento layout: varied spans so the grid reads as a composition, not 4 equal cards.
// 12-col grid on lg. First tile is the hero tile (wider + taller).
const SPANS: Record<number, string> = {
  0: "lg:col-span-7 lg:row-span-2",
  1: "lg:col-span-5",
  2: "lg:col-span-5",
  3: "lg:col-span-7",
};

export function ModuleGrid({ eyebrow, title, titleAccent, description }: {
  eyebrow?: string; title: string; titleAccent?: string; description?: string;
}) {
  const t = useTranslations("modules");
  const reduce = useReducedMotion();

  return (
    <Section tone="dark" texture="glow">
      <SectionHeader
        eyebrow={eyebrow} title={title} titleAccent={titleAccent} description={description}
        tone="dark" accentGradient
      />
      <motion.div
        className="grid auto-rows-[minmax(0,1fr)] gap-4 sm:gap-5 lg:grid-cols-12"
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        {MODULE_SLUGS.map((slug, i) => {
          const { messageKey: key, icon } = MODULES[slug];
          const hero = i === 0;
          return (
            <motion.div key={slug} variants={reduce ? undefined : revealItem} className={SPANS[i]}>
              <Link
                href={`/plataforma/${slug}`}
                className="card-lift group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6 md:p-7"
              >
                {/* surface gradient + dotgrid texture */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[image:var(--gradient-midnight)] opacity-60 transition-opacity duration-300 group-hover:opacity-80"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-dotgrid text-white/[0.05] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl transition-opacity duration-300 group-hover:bg-teal-400/30"
                />

                <span className="relative z-[1] inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-teal-300 transition-colors duration-300 group-hover:border-teal-400/40 group-hover:bg-teal-500 group-hover:text-white">
                  <Icon name={icon} className={hero ? "h-6 w-6" : "h-5 w-5"} />
                </span>

                <div className="relative z-[1] mt-6">
                  <h3 className={`font-semibold text-white ${hero ? "text-heading-lg" : "text-heading-sm"}`}>
                    {t(`${key}.name`)}
                  </h3>
                  <p className={`mt-2 text-navy-200 ${hero ? "text-body-md" : "text-body-sm"}`}>
                    {t(`${key}.tagline`)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold uppercase tracking-wide text-teal-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                    {t("explore")}
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
