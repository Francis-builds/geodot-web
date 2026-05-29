import { Section, SectionHeader } from "./ui/Section";

export function CasesStrip({ eyebrow, title, cases }: {
  eyebrow?: string; title: string; cases: { client: string; result: string; metric: string }[];
}) {
  return (
    <Section tone="subtle">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <div className="grid gap-6 md:grid-cols-3">
        {cases.map((c, i) => (
          <div key={i} className="rounded-lg border border-navy-100 bg-white p-6">
            <p className="text-heading-md font-semibold text-magenta-600">{c.metric}</p>
            <p className="mt-2 text-body-md text-navy-900">{c.result}</p>
            <p className="mt-4 text-caption uppercase tracking-wide text-navy-400">{c.client}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
