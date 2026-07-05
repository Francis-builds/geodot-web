"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const HOLD_MS = 2400;

/**
 * Rotating accent word (hero signature animation). The outgoing and incoming
 * words crossfade in the same grid cell, so there is never a blank frame; the
 * cell hugs the current word, so it must sit at the END of its line (Hero
 * inserts a <br> after it) where the ragged edge absorbs width changes.
 * The rotator is aria-hidden; a static sr-only copy of the first word keeps
 * the h1 readable for assistive tech. Still under prefers-reduced-motion.
 */
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const [pair, setPair] = useState<{ cur: number; prev: number | null }>({ cur: 0, prev: null });

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = setInterval(() => {
      setPair(({ cur }) => ({ cur: (cur + 1) % words.length, prev: cur }));
    }, HOLD_MS);
    return () => clearInterval(id);
  }, [reduced, words.length]);

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
