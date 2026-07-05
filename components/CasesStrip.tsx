import { Section, SectionHeader } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function CasesStrip({ title, cases }: {
  title: string; cases: { client: string; result: string; metric: string }[];
}) {
  return (
    <Section tone="subtle">
      <SectionHeader title={title} />
      <div className="grid gap-6 md:grid-cols-3">
        {cases.map((c, i) => (
          <Reveal key={i} direction="up" delay={i * 0.06}>
            <div className="h-full rounded-xl border border-navy-100 bg-white p-6 transition-shadow hover:shadow-sm">
              <p className="text-heading-md font-semibold text-accent-strong">{c.metric}</p>
              <p className="mt-2 text-body-md text-navy-900">{c.result}</p>
              <p className="mt-4 text-caption uppercase tracking-wide text-navy-600">{c.client}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
