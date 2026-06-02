"use client";

import { useState } from "react";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";

export type FaqItem = { q: string; a: string };
export type FaqGroup = { group: string; items: FaqItem[] };

/** Accessible accordion. Native <details>/<summary> keeps it keyboard- and
 *  screen-reader-friendly with zero JS dependency; the chevron is purely visual. */
function FaqRow({ item }: { item: FaqItem }) {
  return (
    <details className="group border-b border-navy-100 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
        <span className="text-body-lg font-semibold text-navy-900">{item.q}</span>
        <span aria-hidden className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-500 transition-colors group-open:border-teal-300 group-open:bg-teal-50 group-open:text-teal-600">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current transition-transform duration-200 group-open:rotate-180" strokeWidth="2">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <p className="pb-5 pr-10 text-body-md leading-relaxed text-navy-600">{item.a}</p>
    </details>
  );
}

export function Faq({ groups }: { groups: FaqGroup[] }) {
  const [active, setActive] = useState(0);

  return (
    <Container className="grid gap-10 py-16 md:grid-cols-[14rem_1fr] md:gap-14 md:py-20">
      {/* Sticky category nav */}
      <nav aria-label="FAQ categories" className="md:sticky md:top-28 md:self-start">
        <ul className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {groups.map((g, i) => (
            <li key={g.group}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active ? "true" : undefined}
                className={`w-full rounded-lg px-3 py-2 text-left text-body-sm font-medium transition-colors ${
                  i === active
                    ? "bg-teal-50 text-teal-700"
                    : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                }`}
              >
                {g.group}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Active group */}
      <div className="min-w-0">
        {groups.map((g, i) => (
          <div key={g.group} hidden={i !== active}>
            <Reveal>
              <h2 className="mb-2 text-heading-md font-semibold text-navy-900">{g.group}</h2>
              <div className="rounded-2xl border border-navy-100 bg-white px-6 shadow-sm">
                {g.items.map((item, j) => (
                  <FaqRow key={j} item={item} />
                ))}
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </Container>
  );
}
