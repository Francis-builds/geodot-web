import { ReactNode } from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { Icon } from "./ui/Icon";

/**
 * Light-first editorial hero. Text lives on a clean light surface; the photo
 * sits beside it in a rounded container with NO darkening overlay, so imagery
 * stays crisp and copy stays legible (Stripe/Linear/Mercury register).
 *
 * `bgImage` (kept for caller compatibility) renders as the side image, not a
 * full-bleed background. Without an image it falls back to a centered text hero.
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
    <div className="max-w-xl">
      {eyebrow && (
        <span className={`${eyebrowIcon ? "" : "eyebrow-dot"} mb-5 inline-flex items-center gap-2 text-overline font-semibold uppercase tracking-wide text-teal-700`}>
          {eyebrowIcon && <Icon name={eyebrowIcon} className="h-4 w-4 text-teal-600" />}
          {eyebrow}
        </span>
      )}
      <h1 className="text-balance text-[clamp(2.5rem,5.5vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.02em] text-navy-900">
        {title} {titleAccent && <span className="text-accent-strong">{titleAccent}</span>}
      </h1>
      <p className="mt-6 text-pretty text-body-lg text-navy-600">{subtitle}</p>
      {(primaryCta || secondaryCta) && (
        <div className="mt-9 flex flex-wrap gap-4">
          {primaryCta && <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>}
          {secondaryCta && <Button href={secondaryCta.href} variant="ghost">{secondaryCta.label}</Button>}
        </div>
      )}
    </div>
  );

  // Split: copy + clean image (no overlay)
  if (image || visual) {
    return (
      <section className="relative isolate overflow-hidden bg-white">
        <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-navy-900/[0.04]" />
        <Container className="relative z-[1] grid items-center gap-12 py-16 md:grid-cols-2 md:py-24 lg:gap-16">
          {copy}
          <div className="relative">
            {visual ?? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-navy-100">
                <Image
                  src={image as string}
                  alt={bgAlt ?? title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </section>
    );
  }

  // Text-only hero
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-navy-900/[0.04]" />
      <Container className="relative z-[1] py-20 md:py-28">{copy}</Container>
    </section>
  );
}
