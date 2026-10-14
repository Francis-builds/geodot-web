"use client";

import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

/**
 * Scroll-triggered reveal. Fades + slides children in once, when they enter the
 * viewport. Respects prefers-reduced-motion via MotionConfig (drops the slide, keeps
 * the fade) so server and client render the same tree — no hydration mismatch.
 * transform/opacity only — cheap to animate, keeps PSI healthy.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  once = true,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  once?: boolean;
}) {
  const offset = OFFSET[direction];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, ...offset }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once, margin: "-80px" }}
        transition={{ duration: 0.6, delay, ease: [0.2, 0, 0, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/** Staggers direct children using Reveal-like motion (for grids / lists). */
export function RevealGroup({
  children,
  className = "",
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: stagger } } }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.2, 0, 0, 1] as const },
  },
};
