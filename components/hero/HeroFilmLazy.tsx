"use client";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { HeroFilmLabels } from "./HeroFilm";

/** Ancho desde el que se muestra la película: debajo, las cards taparían al camión y al H1. */
export const FILM_MIN_WIDTH = 1280;
const FILM_QUERY = `(min-width: ${FILM_MIN_WIDTH}px)`;

function subscribe(cb: () => void) {
  const mq = window.matchMedia(FILM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

// El chunk de la película (HUD, zod, sincronía) solo se descarga con viewport ancho:
// en mobile y tablet no suma JavaScript al hero.
const HeroFilm = dynamic(() => import("./HeroFilm").then((m) => m.HeroFilm), { ssr: false });

export function HeroFilmLazy({ labels }: { labels: HeroFilmLabels }) {
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(FILM_QUERY).matches, () => false);
  return (
    <>
      <span className="sr-only">{labels.summary}</span>
      {wide ? <HeroFilm labels={labels} /> : null}
    </>
  );
}
