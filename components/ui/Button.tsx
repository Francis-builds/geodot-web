import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "outline-light" | "ghost";
const BASE = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/45 disabled:opacity-60";
const SIZES = "px-7 py-3.5 text-[15px]";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-magenta-500 text-white hover:bg-magenta-600 shadow-sm",
  // For dark surfaces (cinematic hero): white outline + frosted hover.
  "outline-light": "border border-white/30 text-white backdrop-blur-sm hover:bg-white/10",
  ghost: "text-teal-700 hover:bg-teal-50 rounded-[10px]",
};

export function Button({
  children, href, variant = "primary", className = "", type = "button", disabled, onClick,
}: {
  children: ReactNode; href?: string; variant?: Variant; className?: string;
  /** Only used when `href` is absent (renders a real <button>). */
  type?: "button" | "submit"; disabled?: boolean; onClick?: () => void;
}) {
  const cls = `${BASE} ${SIZES} ${VARIANTS[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
