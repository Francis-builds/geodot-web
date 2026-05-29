import { Section, SectionHeader } from "./ui/Section";

export function SolutionSteps({ eyebrow, title, steps }: {
  eyebrow?: string; title: string; steps: { title: string; description: string }[];
}) {
  return (
    <Section tone="base">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <ol className="grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={i} className="rounded-lg border border-navy-100 p-6">
            <span className="text-display-lg font-bold text-teal-500">{i + 1}</span>
            <h3 className="mt-3 text-heading-sm font-semibold text-navy-900">{s.title}</h3>
            <p className="mt-2 text-body-sm text-navy-600">{s.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
