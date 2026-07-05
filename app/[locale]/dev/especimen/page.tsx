import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Especimen DS v2", robots: { index: false, follow: false } };

// Clases literales (Tailwind v4 no genera clases construidas dinamicamente).
const RAMPS = [
  ["bg-teal-50", "bg-teal-100", "bg-teal-200", "bg-teal-300", "bg-teal-400", "bg-teal-500", "bg-teal-600", "bg-teal-700", "bg-teal-800", "bg-teal-900"],
  ["bg-magenta-50", "bg-magenta-100", "bg-magenta-200", "bg-magenta-300", "bg-magenta-400", "bg-magenta-500", "bg-magenta-600", "bg-magenta-700", "bg-magenta-800", "bg-magenta-900"],
  ["bg-navy-50", "bg-navy-100", "bg-navy-200", "bg-navy-300", "bg-navy-400", "bg-navy-500", "bg-navy-600", "bg-navy-700", "bg-navy-800", "bg-navy-900"],
] as const;

export default async function EspecimenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Container className="space-y-16 py-20">
      <section>
        <h2 className="text-heading-lg font-bold">Type scale: Schibsted Grotesk</h2>
        <p className="text-display-2xl font-extrabold">display-2xl 800</p>
        <p className="text-display-xl font-bold">display-xl 700</p>
        <p className="text-display-lg font-bold">display-lg 700</p>
        <p className="text-heading-xl font-bold">heading-xl 700</p>
        <p className="text-heading-md font-medium">heading-md 500</p>
        <p className="max-w-[65ch] text-body-md">body-md 400. Geodot rutea y paletiza en simultáneo. Texto de prueba para medir line-height, ritmo y color de texto secundario.</p>
        <p className="text-caption text-navy-600">caption navy-600</p>
        <p className="text-overline font-medium uppercase text-accent-sm">overline text-accent-sm (teal-700)</p>
      </section>
      <section>
        <h2 className="text-heading-lg font-bold">Color ramps</h2>
        {RAMPS.map((ramp) => (
          <div key={ramp[0]} className="mt-3 flex gap-1">
            {ramp.map((cls) => (
              <div key={cls} className={`h-12 flex-1 rounded-sm ${cls}`} title={cls} />
            ))}
          </div>
        ))}
      </section>
      <section className="space-y-4">
        <h2 className="text-heading-lg font-bold">Botones y card v2</h2>
        <div className="flex gap-4"><Button href="#" variant="primary">CTA primario</Button><Button href="#" variant="ghost">Ghost</Button></div>
        <div className="max-w-sm rounded-xl border border-navy-100 bg-white p-7 transition-shadow hover:shadow-sm">
          <h3 className="text-heading-sm font-semibold text-navy-900">Card v2</h3>
          <p className="mt-2 text-body-md text-navy-600">Sin sombra en reposo, shadow-sm en hover, border navy-100.</p>
        </div>
      </section>
    </Container>
  );
}
