import { ReactNode } from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { RotatingWord } from "./ui/RotatingWord";
import { Link } from "@/i18n/navigation";

/**
 * Hero v2.1 — split light, 2026 scale. Giant display type at weight 500 (the
 * "shout" comes from size, not boldness), a plain-case stat eyebrow, one
 * primary CTA + a text-link secondary. The visual slot takes either a custom
 * node (which brings its own frame) or a photo panel. `rotatingWords` takes priority over `titleAccent`; `titleAfter`
 * continues the sentence after the accent on its own line.
 */
export function Hero({
  eyebrow, title, titleAccent, rotatingWords, titleAfter, subtitle, primaryCta, secondaryCta, visual, bgImage, bgAlt,
}: {
  eyebrow?: string; title: string; titleAccent?: string; rotatingWords?: string[]; titleAfter?: string;
  subtitle: string; primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string }; visual?: ReactNode; bgImage?: string; bgAlt?: string;
}) {
  const accent = rotatingWords?.length ? (
    <RotatingWord words={rotatingWords} className="text-accent-strong" />
  ) : titleAccent ? (
    <span className="text-accent-strong">{titleAccent}</span>
  ) : null;
  const split = Boolean(visual || bgImage);

  return (
    <section className="bg-white">
      <Container className={`grid items-center gap-12 py-16 md:gap-16 md:py-24 ${split ? "md:grid-cols-[1.1fr_1fr]" : "max-w-4xl"}`}>
        <div>
          {eyebrow && (
            <p className="mb-6 text-body-sm font-medium text-navy-600">{eyebrow}</p>
          )}
          <h1 className={`${rotatingWords?.length ? "" : "text-balance "}text-display-2xl font-medium text-navy-900`}>
            {rotatingWords?.length ? (
              // The rotating word owns its line: every word fits alone, so the
              // line count (and everything below) never shifts during rotation.
              <>{title}<br />{accent}{titleAfter ? <><br />{titleAfter}</> : null}</>
            ) : (
              <>{title} {accent}{titleAfter ? <> {titleAfter}</> : null}</>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-body-lg text-navy-600">{subtitle}</p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-9 flex flex-wrap items-center gap-6">
              {primaryCta && <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex min-h-11 items-center gap-1.5 text-body-md font-semibold text-teal-700 transition-colors hover:text-teal-800"
                >
                  {secondaryCta.label}
                  <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
        {visual ? (
          <div className="relative">{visual}</div>
        ) : bgImage ? (
          <div className="relative aspect-[4/3] overflow-hidden md:mr-[calc(50%-50vw)]">
            <Image src={bgImage} alt={bgAlt ?? ""} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
