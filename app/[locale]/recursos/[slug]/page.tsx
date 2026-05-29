import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getPost, getPostSlugs } from "@/lib/blog";
import { Container } from "@/components/ui/Container";
import { MdxContent } from "@/components/blog/MdxContent";
import { CTABanner } from "@/components/CTABanner";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getPostSlugs(locale).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<import("next").Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.cover], type: "article" },
  };
}

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPost(locale, slug);
  if (!post) notFound();
  const t = await getTranslations("blog");

  const dateLabel = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(post.date));

  return (
    <>
      <article className="bg-white">
        <header className="bg-navy-900 text-white">
          <Container className="py-16 md:py-20">
            <div className="mx-auto max-w-[768px]">
              {post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-caption font-medium text-teal-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="font-display text-display-lg font-bold leading-tight">{post.title}</h1>
              <p className="mt-4 text-body-lg text-navy-200">{post.excerpt}</p>
              <div className="mt-6 flex items-center gap-2 text-body-sm text-navy-300">
                <span>{post.author}</span>
                <span aria-hidden>·</span>
                <time dateTime={post.date}>{dateLabel}</time>
                <span aria-hidden>·</span>
                <span>
                  {post.readingMin} {t("readingMin")}
                </span>
              </div>
            </div>
          </Container>
        </header>

        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-[768px]">
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl bg-navy-50">
              <Image
                src={post.cover}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          </div>
          <MdxContent source={post.body} />
        </Container>
      </article>

      <CTABanner title={t("cta.title")} subtitle={t("cta.subtitle")} cta={{ label: t("cta.button"), href: "/contacto" }} />
    </>
  );
}
