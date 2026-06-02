import Image from "next/image";

type AspectRatio = "16/9" | "4/3" | "3/2" | "1/1";

const ASPECT: Record<AspectRatio, string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
};

/**
 * Thin next/image wrapper for editorial / hero imagery.
 *
 * Renders a `fill` image inside a fixed aspect-ratio, rounded container so the
 * layout never shifts (CLS = 0). Applies Geodot brand treatment: a navy/magenta
 * duotone overlay so brand color stays dominant over the photo (DESIGN.md → Imagery).
 *
 * Use `priority` ONLY for the above-the-fold LCP hero. Everything else lazy-loads.
 */
export function Media({
  src,
  alt,
  ratio = "4/3",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  overlay = false,
  rounded = true,
  fill = false,
  className = "",
}: {
  src: string;
  alt: string;
  ratio?: AspectRatio;
  sizes?: string;
  priority?: boolean;
  overlay?: boolean;
  rounded?: boolean;
  /** Fill the parent (parent must be relative + sized) instead of a fixed aspect ratio. */
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        fill ? "absolute inset-0" : "relative w-full overflow-hidden bg-navy-50",
        fill ? "" : ASPECT[ratio],
        rounded && !fill ? "rounded-2xl" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="object-cover"
      />
      {overlay && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-navy-900/55 via-navy-900/10 to-magenta-500/20 mix-blend-multiply"
        />
      )}
    </div>
  );
}
