"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts up when it enters the viewport. Writes to the DOM via ref inside the
 * rAF loop (no per-frame setState/re-render). Reduced motion: final value directly.
 */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2000,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animationFrame = 0;
    const setText = (n: number) => {
      el.textContent = `${prefix}${n}${suffix}`;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        if (reduced) {
          setText(value);
          return;
        }

        let startTime: number | undefined;
        const animate = (timestamp: number) => {
          if (startTime === undefined) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);

          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);

          if (progress < 1) {
            setText(Math.floor(easeOutQuart * value));
            animationFrame = requestAnimationFrame(animate);
          } else {
            setText(value);
          }
        };
        animationFrame = requestAnimationFrame(animate);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [value, duration, prefix, suffix, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
