"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useReducedMotion } from "motion/react";
import { cueAlpha, formatHud, frameAt, parseFilm, type Film, type FrameData } from "@/lib/hero/film";
import { cardRects, leaderPath, leaderVisible, videoToBox, type Rect, type Size } from "@/lib/hero/geometry";
import { HudCard, type HudRow } from "./HudCard";

export type HeroFilmLabels = {
  summary: string;
  loading: string;
  outro: { eyebrow: string; title: string; lead: string; replay: string };
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
  // la película no arranca hasta tener buffer suficiente: el loader tapa el video mientras tanto
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);

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

  useEffect(() => {
    const v = videoRef.current;
    if (!v || ready) return;
    const progress = () => {
      if (v.duration > 0 && v.buffered.length) setLoaded(Math.min(1, v.buffered.end(v.buffered.length - 1) / v.duration));
    };
    const start = () => { setLoaded(1); setReady(true); v.play().catch(() => {}); };
    const fallback = setTimeout(start, 15000);  // red lenta: arranca igual, el navegador sigue cargando
    v.addEventListener("progress", progress);
    v.addEventListener("canplaythrough", start);
    if (v.readyState >= 4) start();
    return () => { clearTimeout(fallback); v.removeEventListener("progress", progress); v.removeEventListener("canplaythrough", start); };
  }, [mountVideo, ready]);

  const replay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setEnded(false);
    v.play().catch(() => {});
  };

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

  const outro = reduced || ended;
  const hud = film && frame && box.w > 0 && ready && !outro ? (() => {
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

  const col = cardRects(box, [{ rows: 7 }])[0];
  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden">
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster decorativo fijo, sin optimización
        <img aria-hidden src={ASSETS.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : mountVideo ? (
        <video ref={videoRef} aria-hidden muted playsInline preload="auto" onEnded={() => setEnded(true)}
          className="absolute inset-0 h-full w-full object-cover">
          <source src={ASSETS.webm} type="video/webm" />
          <source src={ASSETS.mp4} type="video/mp4" />
        </video>
      ) : null}
      {hud}

      {/* loader: tapa el video hasta que hay buffer, así no se ven escenas sueltas */}
      {!reduced && (
        <div aria-hidden className={`pointer-events-none absolute inset-0 bg-navy-950 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
          {box.w > 0 && (
            <div className="absolute font-mono text-[11px] uppercase tracking-[0.2em] text-navy-300" style={{ left: col.x, top: box.h / 2 - 12, width: col.w }}>
              <p className="flex justify-between">
                <span>{labels.loading}</span>
                <span className="tabular-nums text-teal-400">{Math.round(loaded * 100)}%</span>
              </p>
              <div className="mt-3 h-px w-full bg-navy-700">
                <div className="h-px bg-teal-400 transition-[width] duration-300" style={{ width: `${Math.max(4, loaded * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* cierre: en vez de volver a empezar, la película termina en el statement */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${outro ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div aria-hidden className="absolute inset-0 bg-navy-950/80" />
        {box.w > 0 && (
          <div className={`absolute transition-transform duration-1000 ${outro ? "translate-y-0" : "translate-y-3"}`}
            style={{ left: col.x + col.w - 520, top: box.h / 2, width: 520 }}>
            <div className="-translate-y-1/2">
              <p aria-hidden className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.25em] text-teal-400"><span className="h-px w-8 bg-teal-400" />{labels.outro.eyebrow}</p>
              <p aria-hidden className="mt-5 text-balance text-[56px] font-light leading-[1.02] tracking-tight text-white">{labels.outro.title}</p>
              <p aria-hidden className="mt-5 max-w-[30ch] text-[15px] leading-relaxed text-navy-300">{labels.outro.lead}</p>
              {!reduced && (
                <button type="button" onClick={replay} tabIndex={outro ? 0 : -1}
                  className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-navy-300 transition-colors hover:text-teal-400 focus-visible:text-teal-400 focus-visible:outline-none">
                  <span aria-hidden>↻</span> {labels.outro.replay}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
