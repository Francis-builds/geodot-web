"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

/**
 * Full-viewport cinematic hero (home only). The photo is a parallax background
 * layer that drifts slower than scroll; the copy block sits vertically centered
 * so the CTAs are always above the fold. A directional navy scrim lifts only the
 * lower-left where the text lives, so the image stays readable elsewhere (no flat
 * overlay that dulls the whole photo). Reduced-motion → no parallax.
 */
export function HeroCinematic({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  primaryCta,
  secondaryCta,
  image,
  imageAlt,
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  image: string;
  imageAlt: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Photo drifts down slower than scroll; copy lifts slightly. Disabled if reduced.
  const yPhoto = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const yCopy = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  return (
    <section ref={ref} data-hero-overlay className="relative -mt-16 h-[92svh] min-h-[600px] w-full overflow-hidden bg-navy-950 md:-mt-[72px]">
      {/* Parallax photo layer (oversized so the drift never reveals an edge) */}
      <motion.div style={{ y: yPhoto }} className="absolute inset-x-0 top-0 h-[118%]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Directional scrim: strong lower-left (under the copy), clear upper-right (HUD visible) */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-navy-950 via-navy-950/55 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/80 to-transparent" />

      {/* Copy — vertically centered, CTAs above the fold */}
      <motion.div style={{ y: yCopy, opacity }} className="relative z-[1] flex h-full items-center">
        <Container>
          <div className="max-w-2xl">
            {eyebrow && (
              <span className="eyebrow-dot mb-5 inline-block text-overline font-semibold uppercase tracking-wide text-teal-300">
                {eyebrow}
              </span>
            )}
            <h1 className="text-balance text-[clamp(2.75rem,6vw,5.25rem)] font-bold leading-[1.02] tracking-[-0.02em] text-white">
              {title} {titleAccent && <span className="text-accent">{titleAccent}</span>}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-body-lg text-navy-100">{subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
              {secondaryCta && (
                <Button href={secondaryCta.href} variant="outline-light">{secondaryCta.label}</Button>
              )}
            </div>
          </div>
        </Container>
      </motion.div>

      {/* Scroll cue */}
      <div aria-hidden className="absolute bottom-7 left-1/2 z-[1] -translate-x-1/2">
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
          <span className="h-2 w-1 rounded-full bg-teal-300 animate-float" />
        </span>
      </div>
    </section>
  );
}
