import { Button } from "./ui/Button";
import { Container } from "./ui/Container";

export function CTABanner({ title, subtitle, cta }: { title: string; subtitle: string; cta: { label: string; href: string } }) {
  return (
    <section className="bg-[image:var(--gradient-midnight)] bg-navy-900">
      <Container className="flex flex-col items-center gap-6 py-20 text-center">
        <h2 className="max-w-2xl text-display-lg font-bold text-white">{title}</h2>
        <p className="max-w-xl text-body-lg text-navy-200">{subtitle}</p>
        <Button href={cta.href} variant="primary">{cta.label}</Button>
      </Container>
    </section>
  );
}
