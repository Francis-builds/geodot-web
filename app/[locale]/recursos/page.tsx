import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
import { Hero } from "@/components/Hero";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/blog/PostCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: `${t("hero.title")} ${t("hero.titleAccent")}`, description: t("hero.subtitle") };
}

export default async function RecursosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = getAllPosts(locale);

  return (
    <>
      <Hero
        variant="dark"
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        titleAccent={t("hero.titleAccent")}
        subtitle={t("hero.subtitle")}
        primaryCta={{ label: t("hero.cta"), href: "/contacto" }}
        bgImage="/images/warehouse/almacen.jpg"
        bgAlt={`${t("hero.title")} ${t("hero.titleAccent")}`}
      />
      <section className="bg-white py-20">
        <Container>
          {posts.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-navy-200 py-20 text-center">
              <p className="text-body-lg font-medium text-navy-700">{t("empty.title")}</p>
              <p className="mt-2 text-body-sm text-navy-500">{t("empty.subtitle")}</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} readingLabel={t("readingMin")} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
