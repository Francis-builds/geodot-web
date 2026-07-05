import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { RotatingWord } from "./ui/RotatingWord";
import { HeroCanvas } from "./HeroCanvas";
import { Link } from "@/i18n/navigation";

/**
 * Home hero — full-viewport dark "control tower" (Motive school). The whole
 * hero IS the screen: navy-950 canvas with per-word animated mini-scenes
 * (HeroCanvas), viewfinder corner brackets framing the viewport, copy overlaid
 * left. Deliberate exception to the "navy only on CTABanner/Footer" rule —
 * the hero is a product-screen depiction, owner-approved. Internal pages keep
 * the light split Hero.
 */
export function HomeHero({
  eyebrow, title, rotatingWords, titleAfter, subtitle, primaryCta, secondaryCta, tower,
}: {
  eyebrow: string; title: string; rotatingWords: string[]; titleAfter: string; subtitle: string;
  primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string };
  tower: { occupancyLabel: string; transportLabel: string; routeLabel: string; modes: string[] };
}) {
  const brackets = [
    "left-4 top-4 border-l-2 border-t-2 md:left-6 md:top-6",
    "right-4 top-4 border-r-2 border-t-2 md:right-6 md:top-6",
    "bottom-4 left-4 border-b-2 border-l-2 md:bottom-6 md:left-6",
    "bottom-4 right-4 border-b-2 border-r-2 md:bottom-6 md:right-6",
  ];
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-navy-950 md:min-h-[calc(100svh-72px)]">
      <span className="sr-only">{tower.routeLabel}</span>
      <HeroCanvas labels={tower} />
      {brackets.map((c) => (
        <span key={c} aria-hidden className={`absolute z-10 h-8 w-8 border-teal-400 ${c}`} />
      ))}

      <Container className="relative z-10 py-20">
        <p className="mb-6 text-body-sm font-medium text-navy-300">{eyebrow}</p>
        <h1 className="text-display-2xl font-medium text-white">
          {title}
          <br />
          <RotatingWord words={rotatingWords} className="text-teal-400" />
          <br />
          {titleAfter}
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-body-lg text-navy-300">{subtitle}</p>
        <div className="mt-9 flex flex-wrap items-center gap-6">
          <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
          <Link
            href={secondaryCta.href}
            className="inline-flex min-h-11 items-center gap-1.5 text-body-md font-semibold text-teal-400 transition-colors hover:text-teal-300"
          >
            {secondaryCta.label}
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
}
