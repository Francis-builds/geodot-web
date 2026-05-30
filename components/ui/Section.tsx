import { ReactNode } from "react";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

type Tone = "base" | "subtle" | "dark";
type Texture = "none" | "dotgrid" | "glow";

const TONE: Record<Tone, string> = {
  base: "bg-white text-navy-900",
  subtle: "bg-navy-50 text-navy-900",
  dark: "bg-navy-900 text-white",
};

export function Section({
  children, id, tone = "base", texture = "none", className = "",
}: {
  children: ReactNode; id?: string; tone?: Tone; texture?: Texture; className?: string;
}) {
  const dark = tone === "dark";
  return (
    <section id={id} className={`relative isolate overflow-hidden py-20 md:py-24 ${TONE[tone]} ${className}`}>
      {dark && texture !== "none" && (
        <>
          <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.06]" />
          {texture === "glow" && (
            <>
              <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "82%", ["--gy" as string]: "12%" }} />
              <div aria-hidden className="absolute inset-0 glow-magenta" style={{ ["--gx" as string]: "8%", ["--gy" as string]: "92%" }} />
            </>
          )}
        </>
      )}
      <Container className="relative z-[1]">{children}</Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow, title, titleAccent, description, align = "center", accentGradient = false, tone = "base",
}: {
  eyebrow?: string; title: string; titleAccent?: string; description?: string;
  align?: "left" | "center"; accentGradient?: boolean; tone?: Tone;
}) {
  const dark = tone === "dark";
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  // Solid brand accent by surface tone (no gradient text — design-system rule).
  // accentGradient kept for API compat; both paths resolve to a tone-correct teal.
  void accentGradient;
  const accentClass = dark ? "text-accent" : "text-accent-strong";
  return (
    <Reveal direction="up" className={`mb-12 max-w-3xl ${alignment}`}>
      {eyebrow && (
        <span className={`eyebrow-dot mb-4 inline-block text-overline font-semibold uppercase tracking-wide ${dark ? "text-teal-300" : "text-teal-700"}`}>
          {eyebrow}
        </span>
      )}
      <h2 className="text-heading-xl md:text-display-lg font-semibold leading-[1.08] tracking-[-0.01em] text-[color:inherit]">
        {title} {titleAccent && <span className={accentClass}>{titleAccent}</span>}
      </h2>
      {description && (
        <p className={`mt-4 text-body-lg ${dark ? "text-navy-200" : "text-navy-600"}`}>{description}</p>
      )}
    </Reveal>
  );
}
