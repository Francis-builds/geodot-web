"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { useTranslations } from "next-intl";
import { Container } from "./ui/Container";
import { Icon } from "./ui/Icon";

type Stage = {
  key: string;
  icon: string;
  /** Node position in the 1000x520 SVG viewBox. */
  x: number;
  y: number;
};

// Four supply-chain nodes laid out as a connected path across the canvas.
const STAGES: Stage[] = [
  { key: "warehouse", icon: "warehouse", x: 130, y: 360 },
  { key: "transport", icon: "truck", x: 400, y: 170 },
  { key: "route", icon: "route", x: 670, y: 350 },
  { key: "delivery", icon: "package-check", x: 905, y: 150 },
];

// Cubic-curve path connecting all four nodes (used for the drawing line).
const LINE_PATH = `M ${STAGES[0].x} ${STAGES[0].y}
  C 240 250, 300 180, ${STAGES[1].x} ${STAGES[1].y}
  C 500 160, 560 340, ${STAGES[2].x} ${STAGES[2].y}
  C 770 360, 820 180, ${STAGES[3].x} ${STAGES[3].y}`;

export function ConnectThePoints({
  eyebrow,
  title,
  titleAccent,
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
}) {
  const t = useTranslations("home.journey");
  const reduce = useReducedMotion();

  if (reduce) {
    return <StaticJourney t={t} eyebrow={eyebrow} title={title} titleAccent={titleAccent} />;
  }

  return <AnimatedJourney t={t} eyebrow={eyebrow} title={title} titleAccent={titleAccent} />;
}

/* ------------------------------------------------------------------ */
/* Animated (scroll-scrubbed) variant                                  */
/* ------------------------------------------------------------------ */

function AnimatedJourney({
  t,
  eyebrow,
  title,
  titleAccent,
}: {
  t: ReturnType<typeof useTranslations>;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Track scroll across the tall section; the inner canvas is pinned (sticky).
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Smooth the raw progress so the line draws fluidly rather than snapping.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // The line draws over the first 78% of the scroll, leaving room to settle.
  const pathLength = useTransform(progress, [0.04, 0.82], [0, 1]);

  return (
    <section className="relative isolate bg-navy-950 text-white">
      <div aria-hidden className="absolute inset-0 bg-dotgrid text-white/[0.05]" />
      <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "82%", ["--gy" as string]: "14%" }} />
      <div aria-hidden className="absolute inset-0 glow-magenta" style={{ ["--gx" as string]: "10%", ["--gy" as string]: "88%" }} />

      {/* Tall scroll track — drives the pinned canvas below. */}
      <div ref={ref} className="relative h-[320vh]">
        <div className="sticky top-0 flex min-h-screen flex-col justify-center overflow-hidden py-20">
          <Container className="relative z-[1]">
            <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
              {eyebrow && (
                <span className="eyebrow-dot mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-300">
                  {eyebrow}
                </span>
              )}
              <h2 className="text-heading-xl md:text-display-lg font-semibold leading-[1.08] tracking-[-0.01em]">
                {title} {titleAccent && <span className="text-gradient-brand">{titleAccent}</span>}
              </h2>
            </header>

            <JourneyCanvas progress={progress} pathLength={pathLength} t={t} />

            <StageCaptions progress={progress} t={t} />
          </Container>
        </div>
      </div>
    </section>
  );
}

/* The SVG canvas: drawing line + glowing leader pin + nodes. */
function JourneyCanvas({
  progress,
  pathLength,
  t,
}: {
  progress: MotionValue<number>;
  pathLength: MotionValue<number>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <svg viewBox="0 0 1000 520" className="h-auto w-full overflow-visible" role="img" aria-label={t("title")}>
        <defs>
          <linearGradient id="ctp-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-teal-300)" />
            <stop offset="55%" stopColor="var(--color-teal-400)" />
            <stop offset="100%" stopColor="var(--color-magenta-400)" />
          </linearGradient>
          <filter id="ctp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ghost track — faint full path so the route reads even before drawing. */}
        <path d={LINE_PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />

        {/* The drawing line, scrubbed by scroll via pathLength. */}
        <motion.path
          d={LINE_PATH}
          fill="none"
          stroke="url(#ctp-line)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#ctp-glow)"
          style={{ pathLength }}
        />

        {/* Leader pin riding the path head. */}
        <LeaderPin pathLength={pathLength} />

        {/* Nodes light up in sequence as the line reaches them. */}
        {STAGES.map((s, i) => (
          <Node key={s.key} stage={s} index={i} progress={progress} label={t(`stages.${s.key}.title`)} />
        ))}
      </svg>
    </div>
  );
}

// Each node's "lit" threshold roughly matches the line's arrival.
const NODE_LIT_AT = [0.06, 0.32, 0.58, 0.82];

function Node({
  stage,
  index,
  progress,
  label,
}: {
  stage: Stage;
  index: number;
  progress: MotionValue<number>;
  label: string;
}) {
  const lit = NODE_LIT_AT[index];
  const opacity = useTransform(progress, [lit - 0.05, lit + 0.02], [0.35, 1]);
  const scale = useTransform(progress, [lit - 0.05, lit + 0.02], [0.8, 1]);
  const ringOpacity = useTransform(progress, [lit - 0.02, lit + 0.04, lit + 0.16], [0, 0.7, 0]);
  const ringScale = useTransform(progress, [lit, lit + 0.16], [1, 2.4]);

  return (
    <motion.g style={{ opacity }}>
      {/* radar ping when the line arrives */}
      <motion.circle
        cx={stage.x}
        cy={stage.y}
        r={26}
        fill="none"
        stroke="var(--color-teal-300)"
        strokeWidth="2"
        style={{ opacity: ringOpacity, scale: ringScale, transformOrigin: `${stage.x}px ${stage.y}px` }}
      />
      <motion.g style={{ scale, transformOrigin: `${stage.x}px ${stage.y}px` }}>
        <circle cx={stage.x} cy={stage.y} r={28} fill="var(--color-navy-800)" stroke="var(--color-teal-400)" strokeWidth="2" />
        <circle cx={stage.x} cy={stage.y} r={28} fill="none" stroke="var(--color-teal-300)" strokeWidth="2" opacity="0.35" filter="url(#ctp-glow)" />
        <foreignObject x={stage.x - 14} y={stage.y - 14} width="28" height="28">
          <div className="flex h-7 w-7 items-center justify-center text-teal-200">
            <Icon name={stage.icon} className="h-5 w-5" />
          </div>
        </foreignObject>
      </motion.g>
      <text
        x={stage.x}
        y={stage.y + 52}
        textAnchor="middle"
        className="fill-white font-display text-[15px] font-semibold"
      >
        {label}
      </text>
    </motion.g>
  );
}

// The magenta leader pin travels along the path, riding the drawing head.
function LeaderPin({ pathLength }: { pathLength: MotionValue<number> }) {
  const offsetDistance = useTransform(pathLength, (v) => `${v * 100}%`);
  const opacity = useTransform(pathLength, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  return (
    <motion.g style={{ offsetPath: `path("${LINE_PATH}")`, offsetDistance, opacity } as unknown as React.CSSProperties}>
      <circle r="16" fill="var(--color-magenta-500)" opacity="0.25" filter="url(#ctp-glow)" />
      <circle r="7" fill="var(--color-magenta-400)" stroke="#fff" strokeWidth="2" />
    </motion.g>
  );
}

/* Captions that cross-fade in sequence below the canvas. */
function StageCaptions({ progress, t }: { progress: MotionValue<number>; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAGES.map((s, i) => (
        <Caption
          key={s.key}
          index={i}
          progress={progress}
          step={String(i + 1).padStart(2, "0")}
          title={t(`stages.${s.key}.title`)}
          body={t(`stages.${s.key}.body`)}
        />
      ))}
    </div>
  );
}

function Caption({
  index,
  progress,
  step,
  title,
  body,
}: {
  index: number;
  progress: MotionValue<number>;
  step: string;
  title: string;
  body: string;
}) {
  const lit = NODE_LIT_AT[index];
  const opacity = useTransform(progress, [lit - 0.08, lit + 0.01], [0.25, 1]);
  const y = useTransform(progress, [lit - 0.08, lit + 0.01], [16, 0]);
  const borderColor = useTransform(progress, [lit - 0.04, lit + 0.02], ["rgba(255,255,255,0.08)", "rgba(0,169,157,0.45)"]);

  return (
    <motion.div
      style={{ opacity, y, borderColor }}
      className="rounded-xl border bg-white/[0.04] p-5 backdrop-blur-sm"
    >
      <span className="text-overline font-semibold uppercase tracking-wide text-teal-300">{step}</span>
      <h3 className="mt-1 font-display text-heading-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-body-sm text-navy-200">{body}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Static (reduced-motion) variant                                     */
/* ------------------------------------------------------------------ */

function StaticJourney({
  t,
  eyebrow,
  title,
  titleAccent,
}: {
  t: ReturnType<typeof useTranslations>;
  eyebrow?: string;
  title: string;
  titleAccent?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 py-20 text-white md:py-24">
      <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.05]" />
      <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "82%", ["--gy" as string]: "14%" }} />
      <Container className="relative z-[1]">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          {eyebrow && (
            <span className="eyebrow-dot mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-300">
              {eyebrow}
            </span>
          )}
          <h2 className="text-heading-xl md:text-display-lg font-semibold leading-[1.08] tracking-[-0.01em]">
            {title} {titleAccent && <span className="text-gradient-brand">{titleAccent}</span>}
          </h2>
        </header>
        <ol className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (
            <li key={s.key} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-teal-400/40 bg-white/5 text-teal-300">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <span className="mt-4 block text-overline font-semibold uppercase tracking-wide text-teal-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 font-display text-heading-sm font-semibold text-white">{t(`stages.${s.key}.title`)}</h3>
              <p className="mt-2 text-body-sm text-navy-200">{t(`stages.${s.key}.body`)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
