"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useReducedMotion } from "motion/react";
import { activeCards, cueAlpha, formatHud, frameAt, palletStage, parseFilm, type Film, type FrameData, type PalletStage } from "@/lib/hero/film";
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
  pallet: {
    title: string; lot: string; lotValue: string; expiry: string; expiryValue: string; position: string;
    positionValue: string; fefo: string; fefoValue: string; status: string;
    stageValues: Record<PalletStage, string>; picker: string; pickerValue: string;
  };
};

const TRUCK_STATUS = ["gate", "yard", "maneuver", "docked"] as const;
type TruckStatus = (typeof TRUCK_STATUS)[number];
/** En la fase 2 el camión sigue acoplado: sus estados nuevos se muestran como "acoplado". */
function truckStatus(s: FrameData["status"]): TruckStatus {
  return (TRUCK_STATUS as readonly string[]).includes(s) ? (s as TruckStatus) : "docked";
}

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
    { label: t.status, value: t.statusValues[truckStatus(frame.status)], ok: truckStatus(frame.status) === "docked" },
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

  const pl = labels.pallet;
  const stage = film && frame ? palletStage(frame.index, film.cues) : "received";
  const palletRows: HudRow[] = [
    { label: pl.lot, value: pl.lotValue },
    { label: pl.expiry, value: pl.expiryValue },
    { label: pl.fefo, value: pl.fefoValue, ok: true },
    { label: pl.position, value: pl.positionValue },
    { label: pl.status, value: pl.stageValues[stage], ok: stage !== "received" },
    ...(stage === "picking" ? [{ label: pl.picker, value: pl.pickerValue }] : []),
  ];

  const hud = film && frame && box.w > 0 ? (() => {
    const video = { w: film.width, h: film.height };
    const showing = activeCards(frame.index, film.cues);
    const palletIn = film.cues.palletCard ?? Number.POSITIVE_INFINITY;
    type Card = { key: string; title: string; rows: HudRow[]; rect: Rect; alpha: number; prog: number; anchor?: [number, number] };
    let cards: Card[];
    if (showing.includes("pallet")) {
      const [r] = cardRects(box, [{ rows: palletRows.length }]);
      const relevo = film.cues.relevo !== undefined && frame.index >= film.cues.relevo;
      cards = [{ key: "pallet", title: pl.title, rows: palletRows, rect: r, alpha: cueAlpha(frame.index, palletIn),
        prog: cueAlpha(frame.index, palletIn + 8, 14), anchor: relevo ? frame.picker : frame.pallet }];
    } else {
      const [rTruck, rCargo] = cardRects(box, [{ rows: truckRows.length }, { rows: cargoRows.length }]);
      cards = [
        { key: "truck", title: t.title, rows: truckRows, rect: rTruck, alpha: cueAlpha(frame.index, film.cues.truckCard),
          prog: cueAlpha(frame.index, film.cues.truckCard + 8, 14), anchor: frame.tractor },
        { key: "cargo", title: c.title, rows: cargoRows, rect: rCargo, alpha: cueAlpha(frame.index, film.cues.cargoCard),
          prog: cueAlpha(frame.index, film.cues.cargoCard + 8, 14), anchor: frame.trailer },
      ];
    }
    const rects = cards.map((k) => k.rect);
    return (
      <>
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${box.w} ${box.h}`}>
          {cards.map((k) => {
            if (!k.anchor || k.alpha <= 0 || k.prog <= 0) return null;
            const a = videoToBox(k.anchor, video, box);
            if (!leaderVisible(a, rects, "R")) return null;
            return (
              <g key={k.key} className="text-teal-400" opacity={k.alpha}>
                <path d={leaderPath(k.rect, a, "R")} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k.prog}
                  fill="none" stroke="currentColor" strokeWidth={1.4} />
                {k.prog >= 1 && (
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
        {cards.map((k) => (k.alpha > 0 ? <HudCard key={k.key} title={k.title} rows={k.rows} alpha={k.alpha} rect={k.rect} /> : null))}
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
