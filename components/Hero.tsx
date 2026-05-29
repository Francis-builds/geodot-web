import { ReactNode } from "react";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

export function Hero({
  eyebrow, title, titleAccent, subtitle, primaryCta, secondaryCta, variant = "dark", visual,
}: {
  eyebrow?: string; title: string; titleAccent?: string; subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "dark" | "light"; visual?: ReactNode;
}) {
  const dark = variant === "dark";
  return (
    <section className={dark ? "bg-navy-900 text-white" : "bg-white text-navy-900"}>
      <Container className="grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div>
          {eyebrow && <span className="mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-400">{eyebrow}</span>}
          <h1 className="text-display-lg md:text-display-2xl font-bold leading-tight">
            {title} {titleAccent && <span className="text-teal-400">{titleAccent}</span>}
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
