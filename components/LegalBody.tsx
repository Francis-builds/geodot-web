import { Reveal } from "@/components/ui/Reveal";

type LegalSection = { title: string; body: string[] };

export function LegalBody({ updated, sections }: { updated: string; sections: LegalSection[] }) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-10 text-overline font-semibold uppercase tracking-wide text-teal-700">{updated}</p>
      <div className="space-y-10">
        {sections.map((s, i) => (
          <Reveal key={i} direction="up" delay={i * 0.04}>
            <h2 className="text-heading-md font-semibold tracking-[-0.01em] text-navy-900">{s.title}</h2>
            <div className="mt-3 space-y-3">
              {s.body.map((p, j) => (
                <p key={j} className="text-body-lg leading-relaxed text-navy-700">{p}</p>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
