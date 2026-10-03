import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { InView, SplitWords } from "./ui/InView";

export function CTABanner({ title, subtitle, cta }: { title: string; subtitle: string; cta: { label: string; href: string } }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      {/* radar-pulse accent — concentric teal rings expanding behind the CTA */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] -translate-x-1/2 -translate-y-1/2">
        <span className="block h-40 w-40 rounded-full border border-teal-400/30 [animation:radar-pulse_4s_ease-out_infinite]" />
        <span className="absolute inset-0 block h-40 w-40 rounded-full border border-teal-400/30 [animation:radar-pulse_4s_ease-out_infinite_1.3s]" />
        <span className="absolute inset-0 block h-40 w-40 rounded-full border border-teal-400/30 [animation:radar-pulse_4s_ease-out_infinite_2.6s]" />
      </div>

      <Container className="relative z-[2] flex flex-col items-center gap-6 py-20 text-center md:py-24">
        <InView className="rv-words flex flex-col items-center gap-6">
          <h2 className="max-w-2xl text-heading-xl font-bold text-white md:text-display-lg"><SplitWords text={title} /></h2>
          <p className="rv-after max-w-xl text-body-lg text-navy-300">{subtitle}</p>
          <div className="rv-after"><Button href={cta.href} variant="primary">{cta.label}</Button></div>
        </InView>
      </Container>
    </section>
  );
}
