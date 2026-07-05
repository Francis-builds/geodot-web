"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const HOLD_MS = 2200;
const OUT_MS = 300;

/**
 * Rotating accent word (hero signature animation). Reserves the width of the
 * longest word so the surrounding line never shifts. The rotator is
 * aria-hidden; a static sr-only copy of the first word keeps the h1 readable
 * for assistive tech. Under prefers-reduced-motion the word stays still.
 */
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const hold = setInterval(() => setLeaving(true), HOLD_MS);
    return () => clearInterval(hold);
  }, [reduced, words.length]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      setLeaving(false);
    }, OUT_MS);
    return () => clearTimeout(t);
  }, [leaving, words.length]);

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
        <span className="invisible col-start-1 row-start-1">{longest}</span>
        <span key={index} className={`col-start-1 row-start-1 ${leaving ? "animate-word-out" : "animate-word-in"}`}>
          {words[index]}
        </span>
      </span>
    </>
  );
}
