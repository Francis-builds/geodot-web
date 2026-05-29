import { Section, SectionHeader } from "./ui/Section";

export function ProblemStats({ eyebrow, title, titleAccent, points, stats }: {
  eyebrow?: string; title: string; titleAccent?: string;
  points: string[]; stats: { problem: string; impact: string }[];
}) {
  return (
    <Section tone="base">
      <SectionHeader eyebrow={eyebrow} title={title} titleAccent={titleAccent} align="left" />
      <div className="grid gap-12 md:grid-cols-2">
        <ul className="space-y-4">
          {points.map((p, i) => (
            <li key={i} className="flex gap-3 text-body-md text-navy-700">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-magenta-500" />{p}
            </li>
          ))}
        </ul>
        <div className="overflow-hidden rounded-lg border border-navy-100">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-navy-100 px-5 py-4 last:border-0">
              <span className="text-body-sm text-navy-600">{s.problem}</span>
              <span className="text-heading-sm font-semibold text-magenta-600">{s.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
