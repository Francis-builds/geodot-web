export type Size = { w: number; h: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type CardSpec = { rows: number };

/** Medidas de las cards del HUD (px CSS). La fila 0 es el título. */
export const CARD = { w: 300, pad: 14, head: 26, row: 23, gap: 16 } as const;

/** Punto 0..1 del video → px de la caja, con `object-fit: cover` (centrado). */
export function videoToBox(p: [number, number], video: Size, box: Size): { x: number; y: number; visible: boolean } {
  const s = Math.max(box.w / video.w, box.h / video.h);
  const rw = video.w * s;
  const rh = video.h * s;
  const x = p[0] * rw + (box.w - rw) / 2;
  const y = p[1] * rh + (box.h - rh) / 2;
  return { x, y, visible: x >= 0 && x <= box.w && y >= 0 && y <= box.h };
}

export function cardHeight(rows: number): number {
  return CARD.pad * 2 + CARD.head + CARD.row * rows;
}

/** Cards apiladas en la columna derecha, con margen ≥ 6% del ancho y debajo de la nav. */
export function cardRects(box: Size, cards: CardSpec[]): Rect[] {
  const margin = Math.max(0.06 * box.w, 24);
  const x = box.w - margin - CARD.w;
  let y = Math.max(96, 0.12 * box.h);
  return cards.map(({ rows }) => {
    const r = { x, y, w: CARD.w, h: cardHeight(rows) };
    y += r.h + CARD.gap;
    return r;
  });
}

const n = (v: number) => Math.round(v * 10) / 10;

/** Línea guía: sale del borde de la card a la altura del título, hace un codo y va al anclaje. */
export function leaderPath(from: Rect, to: { x: number; y: number }, side: "L" | "R", elbow = 28): string {
  const sx = side === "R" ? from.x : from.x + from.w;
  const sy = from.y + 22;
  const ex = side === "R" ? sx - elbow : sx + elbow;
  return `M ${n(sx)} ${n(sy)} H ${n(ex)} L ${n(to.x)} ${n(to.y)}`;
}
