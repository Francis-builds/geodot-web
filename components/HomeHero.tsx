import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { RotatingWord } from "./ui/RotatingWord";
import { HeroCanvas } from "./HeroCanvas";
import type { HeroFilmLabels } from "./hero/HeroFilm";
import { HeroFilmLazy } from "./hero/HeroFilmLazy";
import { Link } from "@/i18n/navigation";

/**
 * Home hero — full-viewport dark "control tower" (Motive school), on every
 * breakpoint (the scroll-scrubbed HeroStory is parked for v1.1). The whole
 * hero IS the screen: navy-950 canvas with per-word animated mini-scenes
 * (HeroCanvas), viewfinder corner brackets framing the viewport, copy overlaid
 * left. Deliberate exception to the "navy only on CTABanner/Footer" rule —
 * the hero is a product-screen depiction, owner-approved. Internal pages keep
 * the light split Hero.
 */
export function HomeHero({
  eyebrow, title, rotatingWords, titleAfter, subtitle, primaryCta, secondaryCta, tower, film,
}: {
  eyebrow: string; title: string; rotatingWords: string[]; titleAfter: string; subtitle: string;
  primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string };
  tower: { occupancyLabel: string; transportLabel: string; routeLabel: string; modes: string[] };
  film: HeroFilmLabels;
}) {
  const brackets = [
    // top pair clears the transparent nav that floats over the hero
    "left-4 top-20 border-l-2 border-t-2 md:left-6 md:top-24",
    "right-4 top-20 border-r-2 border-t-2 md:right-6 md:top-24",
    "bottom-4 left-4 border-b-2 border-l-2 md:bottom-6 md:left-6",
    "bottom-4 right-4 border-b-2 border-r-2 md:bottom-6 md:right-6",
  ];
  return (
    <section data-hero-overlay className="hero-seq relative isolate -mt-16 flex min-h-svh items-center overflow-hidden bg-navy-950 pt-16 md:-mt-[72px] md:pt-[72px]">
      <span className="sr-only">{tower.routeLabel}</span>
      <div data-seq="visual" className="absolute inset-0">
        {/* < 1280 px: escenas en código; ≥ 1280 px (fase 1 del hero maqueta): película + HUD HTML.
            Debajo de xl las cards del HUD taparían al camión y al H1. */}
        <div className="absolute inset-0 xl:hidden"><HeroCanvas labels={tower} /></div>
        <div className="absolute inset-0 hidden xl:block">
          <HeroFilmLazy labels={film} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/40 to-transparent" />
        </div>
      </div>
      {brackets.map((c) => (
        <span key={c} aria-hidden className={`absolute z-10 h-8 w-8 border-teal-400 ${c}`} />
      ))}

      <Container className="relative z-10 py-20">
        <p data-seq="1" className="mb-6 text-body-sm font-medium text-navy-300">{eyebrow}</p>
        <h1 data-seq="2" className="text-display-2xl font-medium text-white">
          {title}
          <br />
          <RotatingWord words={rotatingWords} className="text-teal-400" />
          <br />
          {titleAfter}
        </h1>
        <p data-seq="3" className="mt-6 max-w-xl text-pretty text-body-lg text-navy-300">{subtitle}</p>
        <div data-seq="4" className="mt-9 flex flex-wrap items-center gap-6">
          <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
          <Link
            href={secondaryCta.href}
            className="group inline-flex min-h-11 items-center gap-1.5 text-body-md font-semibold text-teal-400 transition-colors hover:text-teal-300"
          >
            {secondaryCta.label}
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current transition-transform duration-200 group-hover:translate-x-1" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
}
