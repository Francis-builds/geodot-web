import { AnimatedCounter } from "./ui/AnimatedCounter";
import { Container } from "./ui/Container";

export function MetricsBand({ items, tone = "subtle" }: {
  items: { value: number; suffix?: string; prefix?: string; label: string }[];
  tone?: "subtle" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <section className={dark ? "bg-navy-900" : "bg-navy-50"}>
      <Container className="grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m, i) => (
          <div key={i} className="text-center">
            <div className={`text-display-lg font-bold ${dark ? "text-teal-400" : "text-teal-600"}`}>
              <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <p className={`mt-2 text-body-sm ${dark ? "text-navy-200" : "text-navy-600"}`}>{m.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
