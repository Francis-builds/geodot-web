"use client";
import { useReducedMotion } from "motion/react";
import { Truck, Ship, Container, Plane, TrainFront } from "lucide-react";
import { useHeroRotation } from "./ui/heroRotation";

/**
 * Full-bleed hero background: five code-built mini-scenes (one per rotating
 * word: camiones, barcos, containers, aviones, vagones) that crossfade in
 * sync with the headline via the shared heroRotation clock. Each scene loops
 * for the duration of its word — a "mini video" built entirely from DS tokens,
 * no fake footage. Decorative (aria-hidden); the global reduced-motion rule
 * freezes every animation and the clock stays at scene 0.
 */
const MODE_ICONS = [Truck, Ship, Container, Plane, TrainFront];

const TRAVEL = "animate-[hc-travel_2.4s_linear_infinite]";
const DASH = "animate-[hc-dash_1.6s_linear_infinite]";

function Scene({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <g className="transition-opacity duration-500" style={{ opacity: active ? 1 : 0 }}>
      {children}
    </g>
  );
}

export function HeroCanvas({
  labels,
}: {
  labels: { occupancyLabel: string; transportLabel: string; routeLabel: string; modes: string[] };
}) {
  const reduced = useReducedMotion();
  const index = useHeroRotation(Boolean(reduced)) % MODE_ICONS.length;
  const ModeIcon = MODE_ICONS[index];

  return (
    <div aria-hidden className="absolute inset-0">
      <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {/* shared faint street/route grid */}
        <path d="M-40,160 C400,220 900,120 1480,220" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />
        <path d="M-40,700 C420,640 980,720 1480,600" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />
        <path d="M300,840 C360,600 320,380 460,-40" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />
        <path d="M1050,840 C1090,640 1020,300 1140,-40" fill="none" stroke="var(--color-navy-800)" strokeWidth="1.5" />

        {/* 1 · camiones — route drive */}
        <Scene active={index === 0}>
          <path d="M560,720 C800,650 960,560 1140,460 S1380,340 1500,300" fill="none" stroke="var(--color-navy-600)" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
          <path d="M580,730 C820,650 980,550 1160,450 S1400,330 1510,290" fill="none" stroke="var(--color-teal-500)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="820" cy="650" r="5" fill="var(--color-navy-950)" stroke="var(--color-navy-400)" strokeWidth="2" />
          <circle cx="1160" cy="450" r="5" fill="var(--color-navy-950)" stroke="var(--color-navy-400)" strokeWidth="2" />
          <circle
            r="7"
            fill="var(--color-teal-400)"
            className={TRAVEL}
            style={{ offsetPath: 'path("M580,730 C820,650 980,550 1160,450 S1400,330 1510,290")' }}
          />
        </Scene>

        {/* 2 · barcos — harbor geofence crossing */}
        <Scene active={index === 1}>
          <polygon
            points="860,340 1300,290 1390,510 930,570"
            fill="var(--color-teal-500)"
            fillOpacity="0.08"
            stroke="var(--color-teal-400)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path d="M540,560 C840,500 1140,560 1510,430" fill="none" stroke="var(--color-navy-600)" strokeWidth="1.5" strokeDasharray="10 12" strokeLinecap="round" className={DASH} />
          <circle
            r="8"
            fill="var(--color-teal-400)"
            className="animate-[hc-travel_4.8s_linear_infinite]"
            style={{ offsetPath: 'path("M540,560 C840,500 1140,560 1510,430")' }}
          />
        </Scene>

        {/* 3 · containers — yard stacking */}
        <Scene active={index === 2}>
          {[0, 1, 2, 3, 4].map((c) => (
            <rect
              key={`c1-${c}`}
              x={950 + c * 74}
              y={470}
              width="62"
              height="34"
              rx="3"
              fill={c % 2 ? "var(--color-navy-700)" : "var(--color-teal-500)"}
              className="animate-[hc-pop_2.4s_ease-out_infinite]"
              style={{ animationDelay: `${c * 0.18}s` }}
            />
          ))}
          {[0, 1, 2, 3].map((c) => (
            <rect
              key={`c2-${c}`}
              x={987 + c * 74}
              y={430}
              width="62"
              height="34"
              rx="3"
              fill={c % 2 ? "var(--color-teal-600)" : "var(--color-navy-600)"}
              className="animate-[hc-pop_2.4s_ease-out_infinite]"
              style={{ animationDelay: `${0.9 + c * 0.18}s` }}
            />
          ))}
          <line x1="900" y1="508" x2="1420" y2="508" stroke="var(--color-navy-600)" strokeWidth="1.5" />
        </Scene>

        {/* 4 · aviones — contrail arc */}
        <Scene active={index === 3}>
          <path d="M560,780 C860,500 1120,320 1500,170" fill="none" stroke="var(--color-navy-600)" strokeWidth="1.5" strokeDasharray="12 14" strokeLinecap="round" className={DASH} />
          <circle
            r="6"
            fill="var(--color-teal-400)"
            className={TRAVEL}
            style={{ offsetPath: 'path("M560,780 C860,500 1120,320 1500,170")' }}
          />
          <circle cx="1310" cy="243" r="5" fill="var(--color-navy-950)" stroke="var(--color-teal-400)" strokeWidth="2" />
        </Scene>

        {/* 5 · vagones — rail convoy */}
        <Scene active={index === 4}>
          <line x1="540" y1="560" x2="1510" y2="560" stroke="var(--color-navy-600)" strokeWidth="1.5" />
          <line x1="540" y1="596" x2="1510" y2="596" stroke="var(--color-navy-600)" strokeWidth="1.5" />
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`tie-${i}`} x1={540 + i * 50} y1="560" x2={532 + i * 50} y2="596" stroke="var(--color-navy-800)" strokeWidth="1.5" />
          ))}
          <g
            className="animate-[hc-travel_4.8s_linear_infinite]"
            style={{ offsetPath: 'path("M480,578 L1560,578")', offsetRotate: "0deg" }}
          >
            {[0, 1, 2, 3].map((c) => (
              <rect
                key={`w-${c}`}
                x={c * 86 - 172}
                y={-30}
                width="74"
                height="30"
                rx="3"
                fill={c === 0 ? "var(--color-teal-500)" : "var(--color-navy-700)"}
                stroke="var(--color-navy-500)"
                strokeWidth="1"
              />
            ))}
          </g>
        </Scene>
      </svg>

      {/* metric chips (real numbers) */}
      <div className="absolute right-6 top-16 hidden rounded-md border border-white/10 bg-navy-900/90 px-4 py-3 md:block lg:right-16">
        <p className="text-caption text-navy-300">{labels.occupancyLabel}</p>
        <p className="text-heading-lg font-bold text-teal-400">99%</p>
        <span className="mt-2 block h-1 w-28 overflow-hidden rounded-full bg-navy-700">
          <span className="block h-full w-[99%] rounded-full bg-teal-400" />
        </span>
      </div>
      <div className="absolute right-6 top-44 hidden rounded-md border border-white/10 bg-navy-900/90 px-4 py-3 md:block lg:right-16">
        <p className="text-caption text-navy-300">{labels.transportLabel}</p>
        <p className="text-heading-md font-bold text-white">−8%</p>
      </div>
      {/* status chip — synced with the rotating word */}
      <div className="absolute bottom-8 left-6 flex items-center gap-2.5 overflow-hidden rounded-md border border-white/10 bg-navy-900/90 px-3.5 py-2 sm:left-8 md:left-12 lg:left-16">
        <ModeIcon key={`icon-${index}`} className="h-4 w-4 shrink-0 animate-word-in text-teal-400" strokeWidth={1.75} />
        <p key={`mode-${index}`} className="animate-word-in text-caption font-medium text-navy-300">
          {labels.modes[index]}
        </p>
      </div>
    </div>
  );
}
