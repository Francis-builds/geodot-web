"use client";

import { motion, useReducedMotion } from "motion/react";
import { Section, SectionHeader } from "./ui/Section";
import { revealItem } from "./ui/Reveal";

export function CasesStrip({ eyebrow, title, cases }: {
  eyebrow?: string; title: string; cases: { client: string; result: string; metric: string }[];
}) {
  const reduce = useReducedMotion();
  return (
    <Section tone="subtle">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        {cases.map((c, i) => (
          <motion.div key={i} variants={reduce ? undefined : revealItem}>
            <div className="card-lift group relative h-full overflow-hidden rounded-xl border border-navy-100 bg-white p-6">
              <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-magenta-500/8 blur-2xl transition-opacity duration-300 group-hover:bg-magenta-500/14" />
              <p className="relative z-[1] text-heading-md font-semibold text-magenta-600">{c.metric}</p>
              <p className="relative z-[1] mt-2 text-body-md text-navy-900">{c.result}</p>
              <p className="relative z-[1] mt-4 text-caption uppercase tracking-wide text-navy-500">{c.client}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
