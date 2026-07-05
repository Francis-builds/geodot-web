import { Section, SectionHeader } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function ProblemStats({ title, titleAccent, points, stats }: {
  title: string; titleAccent?: string;
  points: string[]; stats: { problem: string; impact: string }[];
}) {
  return (
    <Section tone="base">
      <SectionHeader title={title} titleAccent={titleAccent} align="left" />
      <div className="grid gap-12 md:grid-cols-2">
        <Reveal direction="right">
          <ul className="space-y-4">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3 text-body-md text-navy-600">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-navy-300" />{p}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal direction="left" delay={0.1}>
          <div className="overflow-hidden rounded-xl border border-navy-100 bg-white transition-shadow hover:shadow-sm">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center justify-between border-b border-navy-100 px-5 py-4 transition-colors duration-200 last:border-0 hover:bg-navy-50">
                <span className="text-body-sm text-navy-600">{s.problem}</span>
                <span className="text-heading-sm font-semibold text-navy-900">{s.impact}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
