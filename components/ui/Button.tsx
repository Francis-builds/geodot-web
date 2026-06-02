import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "outline" | "outline-light" | "ghost";
const BASE = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/45";
const SIZES = "px-7 py-3.5 text-[15px]";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-magenta-500 text-white hover:bg-magenta-600 shadow-sm",
  secondary: "bg-teal-500 text-white hover:bg-teal-600",
  outline: "border-2 border-magenta-500 text-magenta-600 hover:bg-magenta-50",
  // For dark surfaces (cinematic hero): white outline + frosted hover.
  "outline-light": "border border-white/30 text-white backdrop-blur-sm hover:bg-white/10",
  ghost: "text-teal-600 hover:bg-navy-50 rounded-[10px]",
};

export function Button({
  children, href, variant = "primary", className = "",
}: { children: ReactNode; href: string; variant?: Variant; className?: string }) {
  return (
    <Link href={href} className={`${BASE} ${SIZES} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
