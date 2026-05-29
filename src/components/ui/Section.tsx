import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}

export function Section({ children, className = "", id, dark = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`
        relative py-20 md:py-28 lg:py-32 overflow-hidden
        ${dark ? "bg-[#0a0f1a]" : ""}
        ${className}
      `}
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  badge,
  title,
  titleHighlight,
  description,
  className = "",
  align = "center",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  
  return (
    <div className={`max-w-3xl mb-16 ${alignClass} ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-sm font-medium text-teal-400">{badge}</span>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
        {title}{" "}
        {titleHighlight && (
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            {titleHighlight}
          </span>
        )}
      </h2>
      {description && (
        <p className="text-lg text-gray-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

