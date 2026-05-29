import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Post } from "@/lib/blog";

export function PostCard({ post, locale, readingLabel }: { post: Post; locale: string; readingLabel: string }) {
  const dateLabel = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(post.date));

  return (
    <Link
      href={`/recursos/${post.slug}` as Parameters<typeof Link>[0]["href"]}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-50">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-caption font-medium text-teal-700">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-display text-heading-sm font-bold text-navy-900 group-hover:text-teal-600">{post.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-body-sm text-navy-600">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-2 text-caption text-navy-500">
          <time dateTime={post.date}>{dateLabel}</time>
          <span aria-hidden>·</span>
          <span>
            {post.readingMin} {readingLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
