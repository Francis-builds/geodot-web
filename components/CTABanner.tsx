import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";

export function CTABanner({ title, subtitle, cta }: { title: string; subtitle: string; cta: { label: string; href: string } }) {
  return (
    <section className="relative isolate grain overflow-hidden bg-[image:var(--gradient-midnight)] bg-navy-900 text-white">
      <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.07]" />
      <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "80%", ["--gy" as string]: "20%" }} />
      <div aria-hidden className="absolute inset-0 glow-magenta" style={{ ["--gx" as string]: "12%", ["--gy" as string]: "85%" }} />

      {/* radar-pulse accent — concentric teal rings expanding behind the CTA */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] -translate-x-1/2 -translate-y-1/2">
        <span className="block h-40 w-40 rounded-full border border-teal-400/30 [animation:radar-pulse_4s_ease-out_infinite]" />
        <span className="absolute inset-0 block h-40 w-40 rounded-full border border-teal-400/30 [animation:radar-pulse_4s_ease-out_infinite_1.3s]" />
        <span className="absolute inset-0 block h-40 w-40 rounded-full border border-teal-400/30 [animation:radar-pulse_4s_ease-out_infinite_2.6s]" />
      </div>

      <Container className="relative z-[2] flex flex-col items-center gap-6 py-20 text-center md:py-24">
        <Reveal direction="up" className="flex flex-col items-center gap-6">
          <h2 className="max-w-2xl text-display-lg font-bold text-white">{title}</h2>
          <p className="max-w-xl text-body-lg text-navy-200">{subtitle}</p>
          <Button href={cta.href} variant="primary">{cta.label}</Button>
        </Reveal>
      </Container>
    </section>
  );
}
