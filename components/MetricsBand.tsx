import { AnimatedCounter } from "./ui/AnimatedCounter";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";

export function MetricsBand({ items, tone = "subtle" }: {
  items: { value: number; suffix?: string; prefix?: string; label: string }[];
  tone?: "subtle" | "dark";
}) {
  const dark = tone === "dark";
  const [hero, ...rest] = items;
  if (!hero) return null;
  return (
    <section className={dark ? "bg-navy-900 text-white" : undefined}>
      <Container>
        <Reveal direction="up">
          <div className={`flex flex-col gap-6 border-y py-10 md:flex-row md:items-end md:justify-between ${dark ? "border-white/10" : "border-navy-100"}`}>
            <p>
              <span className={`block text-display-lg font-extrabold ${dark ? "text-accent" : "text-accent-strong"}`}>
                <AnimatedCounter value={hero.value} prefix={hero.prefix} suffix={hero.suffix} />
              </span>
              <span className={`mt-1 block max-w-md text-body-lg ${dark ? "text-navy-300" : "text-navy-600"}`}>{hero.label}</span>
            </p>
            {rest.length > 0 && (
              <ul className="flex flex-wrap gap-x-10 gap-y-3">
                {rest.map((m) => (
                  <li key={m.label} className="text-body-sm">
                    <span className={`font-bold ${dark ? "text-white" : "text-navy-900"}`}>{m.prefix}{m.value}{m.suffix}</span>{" "}
                    <span className={dark ? "text-navy-300" : "text-navy-600"}>{m.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
