import { ReactNode } from "react";
import { Container } from "./Container";
import { InView, SplitWords } from "./InView";

type Tone = "base" | "subtle" | "dark";

const TONE: Record<Tone, string> = {
  base: "bg-white text-navy-900",
  subtle: "bg-navy-50 text-navy-900",
  dark: "bg-navy-900 text-white",
};

export function Section({
  children, id, tone = "base", className = "",
}: {
  children: ReactNode; id?: string; tone?: Tone; className?: string;
}) {
  return (
    <section id={id} className={`relative py-20 md:py-24 ${TONE[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  title, titleAccent, description, align = "left", tone = "base",
}: {
  title: string; titleAccent?: string; description?: string;
  align?: "left" | "center"; tone?: Tone;
}) {
  const dark = tone === "dark";
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <InView className={`rv-words mb-12 max-w-3xl ${alignment}`}>
      <h2 className="text-balance text-heading-xl md:text-display-lg font-bold text-[color:inherit]">
        <SplitWords text={title} accent={titleAccent} accentClassName={dark ? "text-accent" : "text-accent-strong"} />
      </h2>
      {description && (
        <p className={`rv-after mt-4 text-pretty text-body-lg ${dark ? "text-navy-300" : "text-navy-600"}`}>{description}</p>
      )}
    </InView>
  );
}
