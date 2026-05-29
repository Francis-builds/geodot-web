import { ReactNode } from "react";
import { Container } from "./Container";

type Tone = "base" | "subtle" | "dark";

const TONE: Record<Tone, string> = {
  base: "bg-white text-navy-900",
  subtle: "bg-navy-50 text-navy-900",
  dark: "bg-navy-900 text-white",
};

export function Section({
  children, id, tone = "base", className = "",
}: { children: ReactNode; id?: string; tone?: Tone; className?: string }) {
  return (
    <section id={id} className={`relative overflow-hidden py-20 md:py-24 ${TONE[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow, title, titleAccent, description, align = "center",
}: {
  eyebrow?: string; title: string; titleAccent?: string; description?: string; align?: "left" | "center";
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`mb-12 max-w-3xl ${alignment}`}>
      {eyebrow && (
        <span className="mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-600">
          {eyebrow}
        </span>
      )}
      <h2 className="text-heading-xl md:text-display-lg font-semibold text-[color:inherit]">
        {title} {titleAccent && <span className="text-teal-500">{titleAccent}</span>}
      </h2>
      {description && <p className="mt-4 text-body-lg text-navy-600">{description}</p>}
    </div>
  );
}
