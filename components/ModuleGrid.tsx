import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MODULES, MODULE_SLUGS } from "@/lib/modules";
import { Section, SectionHeader } from "./ui/Section";

export function ModuleGrid({ eyebrow, title, titleAccent, description }: {
  eyebrow?: string; title: string; titleAccent?: string; description?: string;
}) {
  const t = useTranslations("modules");
  return (
    <Section tone="subtle">
      <SectionHeader eyebrow={eyebrow} title={title} titleAccent={titleAccent} description={description} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {MODULE_SLUGS.map((slug) => {
          const key = MODULES[slug].messageKey;
          return (
            <Link key={slug} href={`/plataforma/${slug}`}
              className="group rounded-lg border border-navy-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <h3 className="text-heading-sm font-semibold text-navy-900 group-hover:text-teal-600">{t(`${key}.name`)}</h3>
              <p className="mt-2 text-body-sm text-navy-600">{t(`${key}.tagline`)}</p>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
