"use client";
import { useSyncExternalStore } from "react";

/**
 * Shared rotation clock for the hero: RotatingWord (headline) and ControlTower
 * (status chip) subscribe to the SAME index so word and visual always match.
 * The timer starts with the first subscriber and stops with the last; under
 * reduced motion components subscribe to a no-op and stay at index 0.
 */
const CYCLE = 3; // camiones · barcos · contenedores (air/rail are roadmap, not shown)
export const HOLD_MS = 2400;

let index = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (timer === null) {
    timer = setInterval(() => {
      index = (index + 1) % CYCLE;
      listeners.forEach((l) => l());
    }, HOLD_MS);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const noopSubscribe = () => () => {};

export function useHeroRotation(reduced: boolean): number {
  return useSyncExternalStore(
    reduced ? noopSubscribe : subscribe,
    () => (reduced ? 0 : index),
    () => 0,
  );
}
