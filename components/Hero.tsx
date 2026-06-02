import { ReactNode } from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { Icon } from "./ui/Icon";

/**
 * Editorial "magazine band" hero. The photo runs full-width edge-to-edge as a
 * horizontal band (square corners, no frame, no shadow — the photograph IS the
 * design). A solid white panel overlaps the band's lower edge, carrying the copy
 * on its own ground so text never sits illegibly over the image. Same `bgImage`
 * prop as before, so every page inherits this treatment. No image → centered
 * text hero.
 */
export function Hero({
  eyebrow,
  eyebrowIcon,
  title,
  titleAccent,
  subtitle,
  primaryCta,
  secondaryCta,
  visual,
  bgImage,
  bgAlt,
}: {
  eyebrow?: string;
  eyebrowIcon?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "dark" | "light";
  visual?: ReactNode;
  bgImage?: string;
  bgAlt?: string;
}) {
  const image = bgImage;

  const copy = (
    <>
      {eyebrow && (
        <span className={`${eyebrowIcon ? "" : "eyebrow-dot"} mb-5 inline-flex items-center gap-2 text-overline font-semibold uppercase tracking-wide text-teal-700`}>
          {eyebrowIcon && <Icon name={eyebrowIcon} className="h-4 w-4 text-teal-600" />}
          {eyebrow}
        </span>
      )}
      <h1 className="text-balance text-[clamp(2.5rem,5vw,4.25rem)] font-bold leading-[1.04] tracking-[-0.02em] text-navy-900">
        {title} {titleAccent && <span className="text-accent-strong">{titleAccent}</span>}
      </h1>
      <p className="mt-6 max-w-xl text-pretty text-body-lg text-navy-600">{subtitle}</p>
      {(primaryCta || secondaryCta) && (
        <div className="mt-9 flex flex-wrap gap-4">
          {primaryCta && <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>}
          {secondaryCta && <Button href={secondaryCta.href} variant="ghost">{secondaryCta.label}</Button>}
        </div>
      )}
    </>
  );

  // Custom visual node provided → render it as the band, panel still carries copy.
  // Image (bgImage) → magazine band + offset panel.
  if (image || visual) {
    return (
      <section className="relative isolate bg-white">
        {/* Full-width photo band, square corners, no frame/shadow */}
        <div className="relative h-[460px] w-full sm:h-[540px] md:h-[620px]">
          {visual ?? (
            <Image
              src={image as string}
              alt={bgAlt ?? title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          )}
          {/* faint legibility lift on the left where the panel will overlap */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-950/20 to-transparent" />
        </div>

        {/* Solid panel mounted over the band's lower-left edge */}
        <Container className="relative">
          <div className="-mt-40 mb-4 w-full max-w-2xl bg-white p-8 sm:-mt-48 sm:p-10 md:-mt-56 md:p-14">
            {copy}
          </div>
        </Container>
      </section>
    );
  }

  // Text-only hero (no image)
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-navy-900/[0.04]" />
      <Container className="relative z-[1] max-w-3xl py-20 md:py-28">{copy}</Container>
    </section>
  );
}
