"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Sets `data-in` on its element the first time it enters the viewport, then
 * stops observing. All the motion lives in CSS (`.rv-*` utilities in
 * globals.css), gated behind prefers-reduced-motion: no-preference, so under
 * reduced motion the content is simply static and visible.
 */
export function InView({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-in", "");
        io.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Splits a heading into words, each rising from its own mask with a stagger
 * (`.rv-words`). Server-renderable: pair it with an <InView> ancestor. The
 * accent words continue the stagger so the sentence reads as one gesture.
 */
export function SplitWords({
  text,
  accent,
  accentClassName = "",
}: {
  text: string;
  accent?: string;
  accentClassName?: string;
}) {
  const base = text.split(/\s+/).filter(Boolean);
  const extra = accent ? accent.split(/\s+/).filter(Boolean) : [];
  return (
    <>
      {[...base, ...extra].map((w, i) => (
        <span key={i}>
          <span className="rv-word">
            <span style={{ "--i": i } as CSSProperties} className={i >= base.length ? accentClassName : undefined}>
              {w}
            </span>
          </span>{" "}
        </span>
      ))}
    </>
  );
}
