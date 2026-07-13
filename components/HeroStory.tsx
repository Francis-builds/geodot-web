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

type Segment = {
  kind: "scene" | "bridge";
  sceneIndex: number; // for bridges: the UPCOMING scene index
  src: string | null;
  poster: string;
  w: number; // scroll budget in vh
};

/**
 * Terminal-style scrollytelling hero (md+): a sticky full-viewport screen
 * scrubs Veo-generated clips with scroll. v2 adopts the scrub mechanics of the
 * open-source scroll-world engine (MIT, oso95/scroll-world + cth9191 fork):
 *  - clips fetched as Blobs (always seekable, no byte-range dependency)
 *  - lerped seek target + never queue a seek while the decoder is `seeking`
 *  - coarser seek step + first-gesture video priming on touch devices
 *  - stills mode (posters only) for reduced-motion / data-saver / blocked video
 *  - optional CONNECTOR clips interleaved between scenes: camera-flight
 *    bridges generated frame-to-frame, so scene changes are continuous
 *    instead of hard cuts. A null connector = plain crossfade.
 * Mobile (<md) renders HomeHero from the page instead.
 */
const INTRO_VH = 100;
const SCENE_VH = 90;
const BRIDGE_VH = 45;
const XFADE_VH = 18; // seam dissolve, in vh of scroll

const BRACKETS = [
  "left-4 top-4 border-l-2 border-t-2 md:left-6 md:top-6",
  "right-4 top-4 border-r-2 border-t-2 md:right-6 md:top-6",
  "bottom-4 left-4 border-b-2 border-l-2 md:bottom-6 md:left-6",
  "bottom-4 right-4 border-b-2 border-r-2 md:bottom-6 md:right-6",
];

export function HeroStory({
  intro, scenes, bridges = [], hint,
}: {
  intro: Intro; scenes: StoryScene[]; bridges?: (string | null)[]; hint: string;
}) {
  const reduced = useReducedMotion();
  const outerRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const segElRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Interleaved segment chain: scene0, bridge0?, scene1, bridge1?, …
  const segments: Segment[] = [];
  scenes.forEach((s, i) => {
    segments.push({ kind: "scene", sceneIndex: i, src: s.src, poster: s.poster, w: SCENE_VH });
    if (i < scenes.length - 1 && bridges[i]) {
      segments.push({ kind: "bridge", sceneIndex: i + 1, src: bridges[i], poster: scenes[i + 1].poster, w: BRIDGE_VH });
    }
  });
  const totalVh = INTRO_VH + segments.reduce((a, s) => a + s.w, 0);
  const nSeg = segments.length;
  const nScenes = scenes.length;

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    type State = { loading: boolean; ready: boolean; cur: number; target: number; visible: boolean; blobUrl?: string };
    const st: State[] = segments.map(() => ({ loading: false, ready: false, cur: 0, target: 0, visible: false }));
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    let stillsOnly = Boolean(conn?.saveData);
    const slowNet = /^(slow-2g|2g|3g)$/.test(conn?.effectiveType || "");
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    let userReady = false;

    // Segment scroll ranges (fractions of total progress)
    const spans: { start: number; end: number }[] = [];
    let off = INTRO_VH;
    for (const s of segments) { spans.push({ start: off / totalVh, end: (off + s.w) / totalVh }); off += s.w; }
    const introFrac = INTRO_VH / totalVh;
    const fadeFrac = XFADE_VH / totalVh;

    const enterStillsMode = () => {
      if (stillsOnly) return;
      stillsOnly = true;
      st.forEach((s, i) => {
        const v = videoRefs.current[i];
        if (v) { try { v.pause(); } catch {} v.removeAttribute("src"); v.load(); }
        if (s.blobUrl) { try { URL.revokeObjectURL(s.blobUrl); } catch {} }
        segElRefs.current[i]?.classList.remove("has-clip");
        s.ready = false; s.loading = false;
      });
    };

    const primeVideo = (v: HTMLVideoElement | null) => {
      if (!coarse || !v) return;
      try {
        const p = v.play();
        if (p?.then) p.then(() => { try { v.pause(); } catch {} }).catch(() => enterStillsMode());
      } catch {}
    };
    const onFirstGesture = () => {
      if (userReady) return;
      userReady = true;
      videoRefs.current.forEach(primeVideo);
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true, passive: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true, passive: true });

    const loadClip = (i: number) => {
      const s = st[i];
      const seg = segments[i];
      const v = videoRefs.current[i];
      if (stillsOnly || s.loading || s.ready || !seg.src || !v) return;
      s.loading = true;
      fetch(seg.src)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((blob) => {
          s.blobUrl = URL.createObjectURL(blob);
          v.src = s.blobUrl;
          v.addEventListener("loadedmetadata", () => { s.ready = true; });
          v.addEventListener("seeked", () => { segElRefs.current[i]?.classList.add("has-clip"); }, { once: true });
          v.addEventListener("loadeddata", () => { try { v.pause(); } catch {} if (userReady) primeVideo(v); });
          v.load();
        })
        .catch(() => { s.loading = false; });
    };
    loadClip(0);
    loadClip(1);

    const trigger = ScrollTrigger.create({
      trigger: outerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;

        const introOut = Math.min(1, p / (introFrac * 0.6));
        if (introRef.current) {
          introRef.current.style.opacity = String(1 - introOut);
          introRef.current.style.pointerEvents = introOut >= 1 ? "none" : "";
        }
        if (hintRef.current) hintRef.current.style.opacity = String(1 - introOut);

        const lookahead = (slowNet ? 0.4 : 1.6) * (SCENE_VH / totalVh);
        let activeScene = 0;

        for (let i = 0; i < nSeg; i++) {
          const { start, end } = spans[i];
          const s = st[i];
          if (p > start - lookahead && p < end + lookahead) loadClip(i);

          const local = Math.min(1, Math.max(0, (p - start) / (end - start)));
          s.target = local;

          // Seam dissolve: fade by distance outside the segment's range.
          let outside = 0;
          if (p < start) outside = start - p; else if (p > end) outside = p - end;
          let op = Math.max(0, 1 - outside / fadeFrac);
          op = op * op * (3 - 2 * op);
          if (p <= introFrac && i === 0) op = 1; // first scene backs the intro
          const el = segElRefs.current[i];
          if (el) {
            el.style.opacity = String(op);
            el.style.zIndex = p >= start && p <= end ? "20" : "10";
          }
          s.visible = op > 0.001;

          if (segments[i].kind === "scene" && p >= start && p <= end) activeScene = segments[i].sceneIndex;
          if (segments[i].kind === "bridge" && p >= start && p <= end) {
            activeScene = local > 0.5 ? segments[i].sceneIndex : segments[i].sceneIndex - 1;
          }

          const cap = captionRefs.current[i];
          if (cap) {
            let capO = 0;
            if (segments[i].kind === "scene" && p > introFrac && p >= start && p <= end) {
              capO = Math.min(1, local / 0.12) * Math.min(1, (1 - local) / 0.12);
            }
            cap.style.opacity = String(capO);
          }
        }

        dotRefs.current.forEach((dot, k) => {
          if (!dot) return;
          const on = p > introFrac && k <= activeScene;
          dot.style.opacity = on ? "1" : "0.35";
          dot.style.transform = on && k === activeScene ? "scale(1.4)" : "scale(1)";
        });
      },
    });

    // Seek loop: lerp toward target, never while the decoder is busy.
    let rafId = 0;
    const eps = coarse ? 0.02 : 0.008;
    const tick = () => {
      for (let i = 0; i < nSeg; i++) {
        const s = st[i];
        const v = videoRefs.current[i];
        if (!s.ready || !v || v.seeking) continue;
        if (!s.visible && Math.abs(s.cur - s.target) < 0.002) continue;
        s.cur += (s.target - s.cur) * 0.18;
        const dur = v.duration || 1;
        const t = Math.min(0.999, Math.max(0, s.cur)) * dur;
        if (Math.abs(v.currentTime - t) > eps) { try { v.currentTime = t; } catch {} }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      trigger.kill();
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      st.forEach((s) => { if (s.blobUrl) { try { URL.revokeObjectURL(s.blobUrl); } catch {} } });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, nSeg]);

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
      style={{ height: `${totalVh}vh` }}
      aria-label={`${intro.title} ${intro.rotatingWords[0]} ${intro.titleAfter}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-navy-950">
        {segments.map((seg, i) => (
          <div
            key={`seg-${i}`}
            ref={(el) => { segElRefs.current[i] = el; }}
            className="absolute inset-0 [&.has-clip>img]:opacity-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={seg.poster} alt="" decoding="async" loading={i < 2 ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" />
            {seg.src && (
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                muted
                playsInline
                preload="none"
                className="absolute inset-0 z-[1] h-full w-full object-cover"
              />
            )}
          </div>
        ))}

        {BRACKETS.map((c) => (
          <span key={c} aria-hidden className={`absolute z-30 h-8 w-8 border-teal-400 ${c}`} />
        ))}

        <div ref={introRef} className="absolute inset-0 z-30 flex items-center">
          <IntroCopy intro={intro} />
        </div>

        {segments.map((seg, i) =>
          seg.kind === "scene" ? (
            <div
              key={`cap-${i}`}
              ref={(el) => { captionRefs.current[i] = el; }}
              className="absolute bottom-14 left-6 z-30 max-w-2xl sm:left-8 md:left-12 lg:left-16"
              style={{ opacity: 0 }}
              aria-hidden
            >
              <p className="text-overline font-semibold uppercase tracking-wide text-teal-400">{scenes[seg.sceneIndex].kicker}</p>
              <p className="mt-2 text-balance text-display-lg font-medium text-white">{scenes[seg.sceneIndex].title}</p>
            </div>
          ) : null,
        )}

        <div ref={hintRef} className="absolute inset-x-0 bottom-6 z-30 flex justify-center">
          <p className="text-overline font-medium uppercase tracking-[0.2em] text-navy-300">{hint}</p>
        </div>

        <div className="absolute right-6 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5 md:right-8">
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
