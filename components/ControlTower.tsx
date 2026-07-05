/**
 * Hero visual — stylized control-tower "screen" (Motive-style viewfinder frame).
 * A navy panel with teal corner brackets containing a code-built route
 * visualization + real metric chips. Deliberately a designed representation,
 * not a fake product screenshot. Decorative: aria-hidden with an sr-only
 * description; the pulse animation is CSS-only so the global
 * prefers-reduced-motion rule freezes it.
 */
export function ControlTower({
  labels,
}: {
  labels: { occupancyLabel: string; transportLabel: string; statusLabel: string; routeLabel: string };
}) {
  const brackets = [
    "-left-2 -top-2 border-l-2 border-t-2",
    "-right-2 -top-2 border-r-2 border-t-2",
    "-left-2 -bottom-2 border-l-2 border-b-2",
    "-right-2 -bottom-2 border-r-2 border-b-2",
  ];
  return (
    <div className="relative">
      <span className="sr-only">{labels.routeLabel}</span>
      <div aria-hidden className="relative">
        {brackets.map((c) => (
          <span key={c} className={`absolute z-10 h-7 w-7 border-teal-400 ${c}`} />
        ))}
        <div className="relative overflow-hidden rounded-lg bg-navy-950">
          <svg viewBox="0 0 480 320" className="block w-full">
            {/* faint secondary roads */}
            <path d="M-10,90 C120,110 220,60 490,110" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />
            <path d="M-10,300 C140,270 260,290 490,210" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />
            <path d="M120,330 C150,240 130,160 210,-10" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />
            <path d="M340,330 C360,250 330,120 400,-10" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />
            {/* planned route (dashed) */}
            <path d="M30,262 C120,240 170,190 240,180 S390,128 462,96" fill="none" stroke="var(--color-navy-600)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
            {/* active optimized route */}
            <path d="M30,262 C130,232 190,206 250,168 S370,112 462,96" fill="none" stroke="var(--color-teal-500)" strokeWidth="2.5" strokeLinecap="round" />
            {/* waypoints */}
            <circle cx="30" cy="262" r="4" fill="var(--color-navy-950)" stroke="var(--color-navy-400)" strokeWidth="2" />
            <circle cx="250" cy="168" r="4" fill="var(--color-navy-950)" stroke="var(--color-navy-400)" strokeWidth="2" />
            <circle cx="462" cy="96" r="4" fill="var(--color-navy-950)" stroke="var(--color-teal-400)" strokeWidth="2" />
            {/* current position + radar pulse */}
            <circle cx="250" cy="168" r="12" fill="none" stroke="var(--color-teal-400)" strokeWidth="1.5" className="origin-[250px_168px] animate-[radar-pulse_2.6s_ease-out_infinite]" />
            <circle cx="250" cy="168" r="5" fill="var(--color-teal-400)" />
          </svg>

          {/* metric chips (real numbers) */}
          <div className="absolute left-5 top-5 rounded-md border border-white/10 bg-navy-900 px-4 py-3">
            <p className="text-caption text-navy-300">{labels.occupancyLabel}</p>
            <p className="text-heading-lg font-bold text-teal-400">99%</p>
            <span className="mt-2 block h-1 w-28 overflow-hidden rounded-full bg-navy-700">
              <span className="block h-full w-[99%] rounded-full bg-teal-400" />
            </span>
          </div>
          <div className="absolute right-5 top-[38%] rounded-md border border-white/10 bg-navy-900 px-4 py-3">
            <p className="text-caption text-navy-300">{labels.transportLabel}</p>
            <p className="text-heading-md font-bold text-white">−10%</p>
          </div>
          <div className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-md border border-white/10 bg-navy-900 px-3.5 py-2">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            <p className="text-caption font-medium text-navy-300">{labels.statusLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
