"use client";
import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { useHeroRotation } from "./heroRotation";

/**
 * Rotating accent word (hero signature animation), driven by the shared
 * heroRotation clock so the ControlTower visual swaps in sync. Outgoing and
 * incoming words crossfade in the same grid cell (no blank frame); the cell
 * hugs the current word, so it must sit at the END of its line (Hero inserts
 * a <br> after it). aria-hidden rotator + static sr-only first word for AT.
 * Still under prefers-reduced-motion.
 */
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const index = useHeroRotation(Boolean(reduced)) % words.length;

  // Derive prev during render (official "adjust state on prop change" pattern).
  const [pair, setPair] = useState<{ cur: number; prev: number | null }>({ cur: index, prev: null });
  if (pair.cur !== index) setPair({ cur: index, prev: pair.cur });

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden className={`inline-grid overflow-hidden ${className}`}>
        {pair.prev !== null && (
          <span
            key={`out-${pair.cur}`}
            className="col-start-1 row-start-1 animate-word-out"
            onAnimationEnd={() => setPair((p) => ({ ...p, prev: null }))}
          >
            {words[pair.prev]}
          </span>
        )}
        <span key={pair.cur} className="col-start-1 row-start-1 animate-word-in">
          {words[pair.cur]}
        </span>
      </span>
    </>
  );
}
