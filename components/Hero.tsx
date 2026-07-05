import Image from "next/image";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { RotatingWord } from "./ui/RotatingWord";

/**
 * Hero v2 — split light. Navy headline on white with a solid teal accent
 * (static word or RotatingWord); the photo, when present, sits beside the copy
 * as a framed panel instead of behind it. `rotatingWords` takes priority over
 * `titleAccent`; `titleAfter` continues the sentence after the accent.
 */
export function Hero({
  eyebrow, title, titleAccent, rotatingWords, titleAfter, subtitle, primaryCta, secondaryCta, bgImage, bgAlt,
}: {
  eyebrow?: string; title: string; titleAccent?: string; rotatingWords?: string[]; titleAfter?: string;
  subtitle: string; primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string }; bgImage?: string; bgAlt?: string;
}) {
  const accent = rotatingWords?.length ? (
    <RotatingWord words={rotatingWords} className="text-accent-strong" />
  ) : titleAccent ? (
    <span className="text-accent-strong">{titleAccent}</span>
  ) : null;

  return (
    <section className="bg-white">
      <Container className={`grid items-center gap-12 py-16 md:py-24 ${bgImage ? "md:grid-cols-2" : "max-w-3xl"}`}>
        <div>
          {eyebrow && (
            <span className="mb-5 inline-block text-overline font-medium uppercase tracking-wide text-accent-sm">{eyebrow}</span>
          )}
          <h1 className="text-balance text-display-xl font-extrabold text-navy-900">
            {title} {accent}{titleAfter ? <> {titleAfter}</> : null}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-body-lg text-navy-600">{subtitle}</p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-9 flex flex-wrap gap-4">
              {primaryCta && <Button href={primaryCta.href} variant="primary">{primaryCta.label}</Button>}
              {secondaryCta && <Button href={secondaryCta.href} variant="ghost">{secondaryCta.label}</Button>}
            </div>
          )}
        </div>
        {bgImage && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-navy-100">
            <Image src={bgImage} alt={bgAlt ?? ""} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
      </Container>
    </section>
  );
}
