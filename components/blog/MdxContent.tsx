import Image, { type ImageProps } from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import { Link } from "@/i18n/navigation";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>;

const components = {
  a: ({ href = "", children, ...rest }: AnchorProps) => {
    const isInternal = href.startsWith("/");
    if (isInternal) {
      // i18n Link expects an app path; cast to satisfy typed routes.
      return (
        <Link href={href as Parameters<typeof Link>[0]["href"]} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
        {children}
      </a>
    );
  },
  img: ({ src, alt = "", width, height, ...rest }: ImgProps) => {
    if (typeof src === "string" && src.length > 0) {
      return (
        <Image
          src={src}
          alt={alt}
          width={typeof width === "number" ? width : 1200}
          height={typeof height === "number" ? height : 675}
          sizes="(max-width: 768px) 100vw, 768px"
          loading="lazy"
          className="my-8 h-auto w-full rounded-2xl"
          {...(rest as Partial<ImageProps>)}
        />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className="my-8 h-auto w-full rounded-2xl" {...rest} />;
  },
};

export async function MdxContent({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components,
    options: { parseFrontmatter: false },
  });

  return (
    <div
      className="
        mx-auto max-w-[768px]
        text-body-lg leading-relaxed text-navy-700
        [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-heading-lg [&_h2]:font-bold [&_h2]:text-navy-900
        [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-heading-md [&_h3]:font-bold [&_h3]:text-navy-900
        [&_p]:my-5
        [&_a]:font-medium [&_a]:text-teal-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-teal-700
        [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6
        [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6
        [&_li]:text-body-md
        [&_strong]:font-semibold [&_strong]:text-navy-900
        [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-teal-500 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-navy-600
        [&_code]:rounded [&_code]:bg-navy-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-body-sm [&_code]:text-navy-800
      "
    >
      {content}
    </div>
  );
}
