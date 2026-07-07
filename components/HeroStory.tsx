"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "./ui/Button";
import { Container } from "./ui/Container";
import { RotatingWord } from "./ui/RotatingWord";
import { Link } from "@/i18n/navigation";

export type StoryScene = { src: string; poster: string; kicker: string; title: string };

type Intro = {
  eyebrow: string; title: string; rotatingWords: string[]; titleAfter: string; subtitle: string;
  primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string };
};

/**
 * Terminal-style scrollytelling hero (md+). The outer section is tall; a
 * sticky full-viewport "screen" plays Veo-generated all-intra clips scrubbed
 * by scroll (currentTime <- scroll progress), with hard cuts between scenes
 * and per-scene captions. The intro (headline + rotating word + CTAs) fades
 * out as scrubbing starts. Desktop only — the page renders HomeHero on <md.
 * Reduced motion: static poster + intro copy, no pin, no scrubbing.
 */
const INTRO_VH = 100; // scroll budget for the intro
const SCENE_VH = 90; // scroll budget per scene
const XFADE = 0.12; // fraction of a scene used to crossfade at its start

const BRACKETS = [
  "left-4 top-4 border-l-2 border-t-2 md:left-6 md:top-6",
  "right-4 top-4 border-r-2 border-t-2 md:right-6 md:top-6",
  "bottom-4 left-4 border-b-2 border-l-2 md:bottom-6 md:left-6",
  "bottom-4 right-4 border-b-2 border-r-2 md:bottom-6 md:right-6",
];

export function HeroStory({ intro, scenes, hint }: { intro: Intro; scenes: StoryScene[]; hint: string }) {
  const reduced = useReducedMotion();
  const outerRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const loadedRef = useRef<Set<number>>(new Set());

  const n = scenes.length;

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const introFrac = INTRO_VH / (INTRO_VH + n * SCENE_VH);
    const sceneFrac = (1 - introFrac) / n;

    const ensureLoaded = (i: number) => {
      const v = videoRefs.current[i];
      if (!v || loadedRef.current.has(i)) return;
      loadedRef.current.add(i);
      v.preload = "auto";
      v.load();
    };
    ensureLoaded(0);
    ensureLoaded(1);

    const st = ScrollTrigger.create({
      trigger: outerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;

        // Intro copy + hint fade out over the first 60% of the intro budget.
        const introOut = Math.min(1, p / (introFrac * 0.6));
        if (introRef.current) {
          introRef.current.style.opacity = String(1 - introOut);
          introRef.current.style.pointerEvents = introOut >= 1 ? "none" : "";
        }
        if (hintRef.current) hintRef.current.style.opacity = String(1 - introOut);

        const sp = Math.max(0, p - introFrac); // scroll consumed by scenes
        const active = Math.min(n - 1, Math.floor(sp / sceneFrac));
        const intra = Math.min(1, Math.max(0, sp / sceneFrac - active));

        ensureLoaded(active);
        ensureLoaded(active + 1);

        for (let i = 0; i < n; i++) {
          const v = videoRefs.current[i];
          const cap = captionRefs.current[i];
          const dot = dotRefs.current[i];
          let opacity = 0;
          if (i === active) opacity = 1;
          else if (i === active + 1 && intra > 1 - XFADE) opacity = (intra - (1 - XFADE)) / XFADE;
          else if (i === active - 1 && intra < XFADE && p > introFrac) opacity = 1; // keep prev under the fade-in

          if (v) {
            v.style.opacity = String(p <= introFrac && i === 0 ? 1 : opacity);
            if (i === active && v.readyState >= 1 && Number.isFinite(v.duration)) {
              v.currentTime = Math.max(0, Math.min(v.duration - 0.05, v.duration * intra));
            }
          }
          if (cap) {
            // Caption visible inside its scene, with soft edges.
            let capO = 0;
            if (i === active && p > introFrac) {
              capO = Math.min(1, intra / 0.12) * Math.min(1, (1 - intra) / 0.12);
            }
            cap.style.opacity = String(capO);
          }
          if (dot) {
            const on = p > introFrac && i <= active;
            dot.style.opacity = on ? "1" : "0.35";
            dot.style.transform = on && i === active ? "scale(1.4)" : "scale(1)";
          }
        }
      },
    });

    return () => st.kill();
  }, [reduced, n]);

  // ---- Reduced motion: static frame, no pin ----
  if (reduced) {
    return (
      <section className="relative hidden min-h-[calc(100svh-72px)] items-center overflow-hidden bg-navy-950 md:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scenes[1]?.poster ?? scenes[0].poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <IntroCopy intro={intro} />
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      className="relative hidden md:block"
      style={{ height: `${INTRO_VH + n * SCENE_VH}vh` }}
      aria-label={`${intro.title} ${intro.rotatingWords[0]} ${intro.titleAfter}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-navy-950">
        {scenes.map((s, i) => (
          <video
            key={s.src}
            ref={(el) => { videoRefs.current[i] = el; }}
            src={s.src}
            poster={s.poster}
            muted
            playsInline
            preload={i < 2 ? "auto" : "none"}
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover transition-none"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}

        {BRACKETS.map((c) => (
          <span key={c} aria-hidden className={`absolute z-20 h-8 w-8 border-teal-400 ${c}`} />
        ))}

        {/* Intro copy */}
        <div ref={introRef} className="absolute inset-0 z-10 flex items-center">
          <IntroCopy intro={intro} />
        </div>

        {/* Scene captions */}
        {scenes.map((s, i) => (
          <div
            key={`cap-${i}`}
            ref={(el) => { captionRefs.current[i] = el; }}
            className="absolute bottom-14 left-6 z-10 max-w-2xl sm:left-8 md:left-12 lg:left-16"
            style={{ opacity: 0 }}
            aria-hidden
          >
            <p className="text-overline font-semibold uppercase tracking-wide text-teal-400">{s.kicker}</p>
            <p className="mt-2 text-balance text-display-lg font-medium text-white">{s.title}</p>
          </div>
        ))}

        {/* Scroll hint */}
        <div ref={hintRef} className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <p className="text-overline font-medium uppercase tracking-[0.2em] text-navy-300">{hint}</p>
        </div>

        {/* Progress rail */}
        <div className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5 md:right-8">
          {scenes.map((_, i) => (
            <span
              key={`dot-${i}`}
              ref={(el) => { dotRefs.current[i] = el; }}
              className="h-1.5 w-1.5 rounded-full bg-teal-400 transition-[opacity,transform] duration-300"
              style={{ opacity: 0.35 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function IntroCopy({ intro }: { intro: Intro }) {
  return (
    <Container className="relative z-10 w-full pt-16">
      <p className="mb-6 text-body-sm font-medium text-navy-300">{intro.eyebrow}</p>
      <h1 className="text-display-2xl font-medium text-white">
        {intro.title}
        <br />
        <RotatingWord words={intro.rotatingWords} className="text-teal-400" />
        <br />
        {intro.titleAfter}
      </h1>
      <p className="mt-6 max-w-xl text-pretty text-body-lg text-navy-300">{intro.subtitle}</p>
      <div className="mt-9 flex flex-wrap items-center gap-6">
        <Button href={intro.primaryCta.href} variant="primary">{intro.primaryCta.label}</Button>
        <Link
          href={intro.secondaryCta.href}
          className="inline-flex min-h-11 items-center gap-1.5 text-body-md font-semibold text-teal-400 transition-colors hover:text-teal-300"
        >
          {intro.secondaryCta.label}
          <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </Container>
  );
}
