import { z } from "zod";

/**
 * Contrato de `public/hero/film-anchors.json`, que exporta video-blender/export/anchors.py.
 * Coordenadas 0..1 con origen arriba a la izquierda, una entrada por frame del video.
 */
const point = z.tuple([z.number(), z.number()]);
const status = z.enum(["gate", "yard", "maneuver", "docked", "unloading", "storing", "relevo"]);

export const filmSchema = z.object({
  fps: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  frames: z.array(z.object({
    tractor: point, driver: point, trailer: point,
    pallet: point.optional(), picker: point.optional(),   // fase 2 (opcionales: el JSON de la fase 1 sigue siendo válido)
    dist: z.number(), art: z.number(), status,
  })).min(1),
  cues: z.object({
    truckCard: z.number().int(), cargoCard: z.number().int(), docked: z.number().int(),
    palletCard: z.number().int().optional(), slotDone: z.number().int().optional(), relevo: z.number().int().optional(),
  }),
});

export type Film = z.infer<typeof filmSchema>;
export type FilmStatus = z.infer<typeof status>;
export type FrameData = {
  index: number;
  tractor: [number, number];
  driver: [number, number];
  trailer: [number, number];
  pallet?: [number, number];
  picker?: [number, number];
  dist: number;
  art: number;
  status: FilmStatus;
};

export function parseFilm(raw: unknown): Film | null {
  const r = filmSchema.safeParse(raw);
  return r.success ? r.data : null;
}

/** Frame que se está mostrando: floor(t·fps) envuelto al largo del loop. */
export function frameIndex(mediaTime: number, fps: number, count: number): number {
  if (!Number.isFinite(mediaTime) || count <= 0) return 0;
  const f = Math.floor(mediaTime * fps);
  return ((f % count) + count) % count;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] =>
  [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/** Interpola entre el frame mostrado y el siguiente; en el último frame no cruza la vuelta del loop. */
export function frameAt(film: Film, mediaTime: number): FrameData {
  const n = film.frames.length;
  const i0 = frameIndex(mediaTime, film.fps, n);
  const pos = Number.isFinite(mediaTime) ? mediaTime * film.fps : 0;
  const t = pos - Math.floor(pos);
  const a = film.frames[i0];
  const b = film.frames[i0 === n - 1 ? i0 : i0 + 1];
  return {
    index: i0,
    tractor: lerp2(a.tractor, b.tractor, t),
    driver: lerp2(a.driver, b.driver, t),
    trailer: lerp2(a.trailer, b.trailer, t),
    ...(a.pallet && b.pallet ? { pallet: lerp2(a.pallet, b.pallet, t) } : a.pallet ? { pallet: a.pallet } : {}),
    ...(a.picker && b.picker ? { picker: lerp2(a.picker, b.picker, t) } : a.picker ? { picker: a.picker } : {}),
    dist: lerp(a.dist, b.dist, t),
    art: lerp(a.art, b.art, t),
    status: a.status,
  };
}

/** 0 antes del cue, 1 después de `fadeFrames`, smoothstep en el medio. */
export function cueAlpha(frame: number, cue: number, fadeFrames = 10): number {
  const t = Math.min(1, Math.max(0, (frame - cue) / fadeFrames));
  return t * t * (3 - 2 * t);
}

const oneDecimal = { es: new Intl.NumberFormat("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  en: new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) };

export function formatHud(locale: "es" | "en", kind: "dist" | "art" | "weight", value: number): string {
  if (kind === "art") return `${Math.round(value)}°`;
  // es-MX usa punto decimal; el HUD en español va con coma, como el resto del sitio
  const s = oneDecimal[locale].format(value);
  const v = locale === "es" ? s.replace(".", ",") : s;
  return `${v} ${kind === "dist" ? "m" : "t"}`;
}

export type CardKey = "truck" | "cargo" | "pallet";
export type PalletStage = "received" | "scanned" | "stored" | "picking";

/** Qué cards están en pantalla: CAMIÓN + CARGA hasta que el pallet toma el relato (fase 2). */
export function activeCards(frame: number, cues: Film["cues"]): CardKey[] {
  return cues.palletCard !== undefined && frame >= cues.palletCard ? ["pallet"] : ["truck", "cargo"];
}

export function palletStage(frame: number, cues: Film["cues"]): PalletStage {
  if (cues.palletCard === undefined || frame < cues.palletCard) return "received";
  if (cues.slotDone === undefined || frame < cues.slotDone) return "scanned";
  if (cues.relevo === undefined || frame < cues.relevo) return "stored";
  return "picking";
}
