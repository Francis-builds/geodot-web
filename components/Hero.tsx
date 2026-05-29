import { ReactNode } from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { Icon } from "./ui/Icon";

/**
 * Cinematic hero. When `bgImage` is set, the photo becomes a full-bleed canvas
 * under a navy duotone + dot-grid + brand glows, with the headline over it
 * (Terminal-industries-style). Falls back to a split layout with `visual`, or a
 * plain text hero. Entrance is CSS-only (staggered animate-rise) so it stays
 * server-rendered and paints fast.
 */
export function Hero({
  eyebrow,
  eyebrowIcon,
  title,
  titleAccent,
  subtitle,
  primaryCta,
  secondaryCta,
  variant = "dark",
  visual,
  bgImage,
  bgAlt,
}: {
  eyebrow?: string;
  eyebrowIcon?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "dark" | "light";
  visual?: ReactNode;
  bgImage?: string;
  bgAlt?: string;
}) {
  const dark = variant === "dark";

  // ---- Cinematic full-bleed variant ----
  if (bgImage) {
    return (
      <section className="relative isolate grain overflow-hidden bg-navy-950 text-white">
        <Image
          src={bgImage}
          alt={bgAlt ?? title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-80"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-950/55" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-950/90 to-transparent" />
        <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "82%", ["--gy" as string]: "18%" }} />
        <div aria-hidden className="absolute inset-0 glow-magenta" style={{ ["--gx" as string]: "10%", ["--gy" as string]: "90%" }} />
        <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.07]" />

        <Container className="relative z-[2] flex min-h-[90vh] flex-col justify-center py-28">
          <div className="max-w-3xl">
            {eyebrow && (
              <span className={`animate-rise mb-5 inline-flex items-center gap-2 text-overline font-semibold uppercase tracking-wide text-teal-300 ${eyebrowIcon ? "" : "eyebrow-dot"}`} style={{ animationDelay: "0ms" }}>
                {eyebrowIcon && <Icon name={eyebrowIcon} className="h-4 w-4" />}
                {eyebrow}
              </span>
            )}
            <h1 className="animate-rise text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.02em]" style={{ animationDelay: "80ms" }}>
              {title}{" "}
              {titleAccent && <span className="text-gradient-brand">{titleAccent}</span>}
            </h1>
            <p className="animate-rise mt-6 max-w-xl text-body-lg text-navy-200" style={{ animationDelay: "180ms" }}>
              {subtitle}
            </p>
            <div className="animate-rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: "280ms" }}>
              <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
              {secondaryCta && <Button href={secondaryCta.href} variant="outline">{secondaryCta.label}</Button>}
            </div>
          </div>
        </Container>

        <div aria-hidden className="absolute bottom-7 left-1/2 z-[2] -translate-x-1/2">
          <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
            <span className="h-2 w-1 rounded-full bg-teal-300 animate-float" />
          </span>
        </div>
      </section>
    );
  }

  // ---- Split / plain fallback ----
  return (
    <section className={`relative isolate overflow-hidden ${dark ? "bg-navy-900 text-white" : "bg-white text-navy-900"}`}>
      {dark && <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.06]" />}
      {dark && <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "85%", ["--gy" as string]: "20%" }} />}
      <Container className="relative z-[1] grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div>
          {eyebrow && (
            <span className={`mb-4 inline-flex items-center gap-2 text-overline font-semibold uppercase tracking-wide ${dark ? "text-teal-400" : "text-teal-600"} ${eyebrowIcon ? "" : "eyebrow-dot"}`}>
              {eyebrowIcon && <Icon name={eyebrowIcon} className="h-4 w-4" />}
              {eyebrow}
            </span>
          )}
          <h1 className="text-display-lg md:text-display-2xl font-bold leading-tight">
            {title} {titleAccent && <span className="text-gradient-brand">{titleAccent}</span>}
          </h1>
          <p className={`mt-6 text-body-lg ${dark ? "text-navy-200" : "text-navy-600"}`}>{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>
            {secondaryCta && <Button href={secondaryCta.href} variant={dark ? "outline" : "secondary"}>{secondaryCta.label}</Button>}
          </div>
        </div>
        {visual && <div className="relative">{visual}</div>}
      </Container>
    </section>
  );
}
