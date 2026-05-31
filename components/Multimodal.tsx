import { Ship, Plane, Truck, TrainFront } from "lucide-react";
import { Container } from "./ui/Container";
import { Reveal, RevealGroup } from "./ui/Reveal";

const ICONS = { sea: Ship, air: Plane, road: Truck, rail: TrainFront } as const;
type ModeKey = keyof typeof ICONS;

type Mode = { key: ModeKey; name: string; desc: string; soon?: string };

export function Multimodal({
  eyebrow, title, titleAccent, subtitle, modes,
}: {
  eyebrow: string; title: string; titleAccent: string; subtitle: string; modes: Mode[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <Container className="relative z-[1] py-20 md:py-28">
        <Reveal className="mb-14 max-w-3xl">
          <span className="eyebrow-dot mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-700">{eyebrow}</span>
          <h2 className="text-display-lg font-bold leading-tight text-navy-900">
            {title} <span className="text-accent-strong">{titleAccent}</span>
          </h2>
          <p className="mt-5 text-body-lg text-navy-600">{subtitle}</p>
        </Reveal>

        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map((m) => {
            const I = ICONS[m.key] ?? Truck;
            const soon = !!m.soon;
            return (
              <div
                key={m.key}
                className={`card-lift relative rounded-2xl border border-navy-100 bg-white p-7 shadow-sm ${soon ? "opacity-90" : ""}`}
              >
                {soon && (
                  <span className="absolute right-4 top-4 rounded-full bg-magenta-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-magenta-700 ring-1 ring-inset ring-magenta-200">
                    {m.soon}
                  </span>
                )}
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 ring-1 ring-inset ring-teal-500/20">
                  <I className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-heading-sm font-semibold text-navy-900">{m.name}</h3>
                <p className="mt-2 text-body-sm leading-relaxed text-navy-600">{m.desc}</p>
              </div>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
