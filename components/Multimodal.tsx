import Image from "next/image";
import { Ship, Plane, Truck, TrainFront } from "lucide-react";
import { Container } from "./ui/Container";
import { Reveal, RevealGroup } from "./ui/Reveal";

const ICONS = { sea: Ship, air: Plane, road: Truck, rail: TrainFront } as const;
const IMAGES = {
  sea: "/images/industries/alimentos/hero.jpg", // fishing fleet at sea
  air: "/images/multimodal/aereo.jpg",
  road: "/images/fleet/itms.jpg",
  rail: "/images/multimodal/ferroviario.jpg",
} as const;
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
            const img = IMAGES[m.key];
            return (
              <div
                key={m.key}
                className="card-lift group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl"
              >
                <Image
                  src={img}
                  alt={m.name}
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/45 to-navy-950/10" />
                <div className="relative z-[1] p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-teal-300 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                    <I className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-heading-sm font-semibold text-white">{m.name}</h3>
                  <p className="mt-1.5 text-body-sm leading-relaxed text-navy-100">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
