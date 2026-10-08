import type { Rect } from "@/lib/hero/geometry";
import { CARD } from "@/lib/hero/geometry";

export type HudRow = { label: string; value: string; ok?: boolean; section?: boolean };
export type HudCardProps = { title: string; rows: HudRow[]; alpha: number; rect: Rect };

/** Card fija del HUD (estilo del spike): panel oscuro, barra teal, mono. Decorativa. */
export function HudCard({ title, rows, alpha, rect }: HudCardProps) {
  return (
    <div
      aria-hidden
      className="absolute border border-navy-700 bg-navy-950/85 font-mono text-[11px] tracking-wide"
      style={{
        left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: alpha,
        transform: `translateY(${(1 - alpha) * 10}px)`, padding: `${CARD.pad}px ${CARD.pad}px ${CARD.pad}px ${CARD.pad + 4}px`,
      }}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-teal-400" />
      <p className="text-[12px] font-medium text-teal-400" style={{ height: CARD.head }}>{title}</p>
      {rows.map((r) =>
        r.section ? (
          <p key={r.label} className="flex items-end border-t border-navy-700 text-[12px] text-teal-400" style={{ height: CARD.row }}>
            {r.label}
          </p>
        ) : (
          <p key={r.label} className="flex items-center justify-between" style={{ height: CARD.row }}>
            <span className="text-navy-300">{r.label}</span>
            <span className={r.ok ? "text-teal-400" : "text-white"}>{r.value}</span>
          </p>
        ),
      )}
    </div>
  );
}
