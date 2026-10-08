"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useReducedMotion } from "motion/react";
import { cueAlpha, formatHud, frameAt, parseFilm, type Film, type FrameData } from "@/lib/hero/film";
import { cardRects, leaderPath, leaderVisible, videoToBox, type Rect, type Size } from "@/lib/hero/geometry";
import { HudCard, type HudRow } from "./HudCard";

export type HeroFilmLabels = {
  summary: string;
  truck: {
    title: string; plates: string; platesValue: string; appointment: string; appointmentValue: string;
    documents: string; documentsValue: string; status: string;
    statusValues: { gate: string; yard: string; maneuver: string; docked: string };
    distance: string; articulation: string; driverSection: string; name: string; nameValue: string;
    license: string; licenseValue: string; checkin: string; checkinValue: string;
  };
  cargo: {
    title: string; pallets: string; palletsValue: string; weight: string; weightValue: number;
    skus: string; skusValue: string; cartaPorte: string; cartaPorteValue: string;
  };
};

const ASSETS = { anchors: "/hero/film-anchors.json", poster: "/hero/film-poster.webp", webm: "/hero/film-1080.webm", mp4: "/hero/film-1080.mp4" };
type VideoWithRvfc = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

/**
 * Película del hero (video sin texto) + HUD HTML: cards fijas en la columna derecha unidas al
 * camión por líneas guía que siguen los anclajes que exporta Blender, frame a frame.
 * Video y HUD son decorativos; el resumen para lectores de pantalla va en `labels.summary`.
 */
export function HeroFilm({ labels }: { labels: HeroFilmLabels }) {
  const locale = useLocale() === "en" ? "en" : "es";
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<VideoWithRvfc>(null);
  const [film, setFilm] = useState<Film | null>(null);
  const [liveFrame, setFrame] = useState<FrameData | null>(null);
  const [box, setBox] = useState<Size>({ w: 0, h: 0 });
  const [mountVideo, setMountVideo] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(ASSETS.anchors).then((r) => (r.ok ? r.json() : null)).then((j) => alive && setFilm(parseFilm(j))).catch(() => alive && setFilm(null));
    return () => { alive = false; };
  }, []);

  // el video se monta después del LCP (HeroFilmLazy ya garantizó viewport ancho)
  useEffect(() => {
    if (reduced) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMountVideo(true));
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setMountVideo(true), 1200);
    return () => clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // sincronía: cada frame presentado (rVFC) o, si no existe, cada repintado leyendo currentTime
  useEffect(() => {
    if (!film || reduced) return;
    const v = videoRef.current;
    if (!v) return;
    let raf = 0, vfc = 0;
    if (v.requestVideoFrameCallback) {
      const onFrame = (_: number, meta: { mediaTime: number }) => { setFrame(frameAt(film, meta.mediaTime)); vfc = v.requestVideoFrameCallback!(onFrame); };
      vfc = v.requestVideoFrameCallback(onFrame);
    } else {
      const tick = () => { setFrame(frameAt(film, v.currentTime)); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(raf); if (vfc) v.cancelVideoFrameCallback?.(vfc); };
  }, [film, reduced, mountVideo]);

  // con reduced-motion no hay video: el HUD queda fijo en el último frame (acoplado)
  const frame: FrameData | null = film && reduced ? frameAt(film, (film.frames.length - 1) / film.fps) : liveFrame;
  const t = labels.truck, c = labels.cargo;
  const truckRows: HudRow[] = frame ? [
    { label: t.plates, value: t.platesValue },
    { label: t.appointment, value: t.appointmentValue, ok: true },
    { label: t.documents, value: t.documentsValue, ok: true },
    { label: t.status, value: t.statusValues[frame.status], ok: frame.status === "docked" },
    { label: t.distance, value: formatHud(locale, "dist", frame.dist) },
    { label: t.articulation, value: formatHud(locale, "art", frame.art) },
    { label: t.driverSection, value: "", section: true },
    { label: t.name, value: t.nameValue },
    { label: t.license, value: t.licenseValue, ok: true },
    { label: t.checkin, value: t.checkinValue },
  ] : [];
  const cargoRows: HudRow[] = [
    { label: c.pallets, value: c.palletsValue },
    { label: c.weight, value: formatHud(locale, "weight", c.weightValue) },
    { label: c.skus, value: c.skusValue },
    { label: c.cartaPorte, value: c.cartaPorteValue, ok: true },
  ];

  const hud = film && frame && box.w > 0 ? (() => {
    const [rTruck, rCargo] = cardRects(box, [{ rows: truckRows.length }, { rows: cargoRows.length }]);
    const video = { w: film.width, h: film.height };
    const cards: { key: string; title: string; rows: HudRow[]; rect: Rect; cue: number; anchor: [number, number] }[] = [
      { key: "truck", title: t.title, rows: truckRows, rect: rTruck, cue: film.cues.truckCard, anchor: frame.tractor },
      { key: "cargo", title: c.title, rows: cargoRows, rect: rCargo, cue: film.cues.cargoCard, anchor: frame.trailer },
    ];
    return (
      <>
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${box.w} ${box.h}`}>
          {cards.map((k) => {
            const alpha = cueAlpha(frame.index, k.cue);
            const prog = cueAlpha(frame.index, k.cue + 8, 14);
            const a = videoToBox(k.anchor, video, box);
            if (alpha <= 0 || prog <= 0 || !leaderVisible(a, [rTruck, rCargo], "R")) return null;
            return (
              <g key={k.key} className="text-teal-400" opacity={alpha}>
                <path d={leaderPath(k.rect, a, "R")} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog}
                  fill="none" stroke="currentColor" strokeWidth={1.4} />
                {prog >= 1 && (
                  <>
                    <circle cx={a.x} cy={a.y} r={7} fill="none" stroke="currentColor" strokeWidth={1.4} />
                    <circle cx={a.x} cy={a.y} r={2.5} fill="currentColor" />
                    {!reduced && (
                      <circle cx={a.x} cy={a.y} r={7} fill="none" stroke="currentColor" strokeWidth={1.2}>
                        <animate attributeName="r" from="7" to="21" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.7" to="0" dur="1s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
        {cards.map((k) => {
          const alpha = cueAlpha(frame.index, k.cue);
          return alpha > 0 ? <HudCard key={k.key} title={k.title} rows={k.rows} alpha={alpha} rect={k.rect} /> : null;
        })}
      </>
    );
  })() : null;

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden">
      {reduced || !mountVideo ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster decorativo fijo, sin optimización
        <img aria-hidden src={ASSETS.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <video ref={videoRef} aria-hidden muted loop playsInline autoPlay preload="none" poster={ASSETS.poster}
          className="absolute inset-0 h-full w-full object-cover">
          <source src={ASSETS.webm} type="video/webm" />
          <source src={ASSETS.mp4} type="video/mp4" />
        </video>
      )}
      {hud}
    </div>
  );
}
