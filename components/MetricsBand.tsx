import { AnimatedCounter } from "./ui/AnimatedCounter";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";

export function MetricsBand({ items, tone = "subtle" }: {
  items: { value: number; suffix?: string; prefix?: string; label: string }[];
  tone?: "subtle" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <section className={`relative isolate overflow-hidden ${dark ? "bg-navy-900 text-white" : "bg-navy-50"}`}>
      {dark && (
        <>
          <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.05]" />
          <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "85%", ["--gy" as string]: "30%" }} />
        </>
      )}
      <Container className="relative z-[1] grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m, i) => (
          <Reveal key={i} direction="up" delay={i * 0.08} className="text-center">
            <div className={`text-display-lg font-bold ${dark ? "text-teal-400" : "text-teal-600"}`}>
              <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <p className={`mt-2 text-body-sm ${dark ? "text-navy-200" : "text-navy-600"}`}>{m.label}</p>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
