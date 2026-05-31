"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Warehouse, Boxes, Route, PackageCheck } from "lucide-react";
import { Container } from "./ui/Container";

const STAGE_ICONS = [Warehouse, Boxes, Route, PackageCheck];
const STAGE_ORDER = ["warehouse", "transport", "route", "delivery"] as const;
const STAGES = STAGE_ORDER.length;

type Stage = { title: string; body: string; metric: string; metricLabel: string; image: string };

/**
 * Flagship scroll-storytelling section. The section pins while the supply-chain
 * journey advances with scroll: full-bleed photos cross-fade stage to stage, the
 * copy + metric swap, and a progress rail "connects the points". GSAP
 * ScrollTrigger drives it (synced to Lenis via SmoothScroll). Under
 * prefers-reduced-motion it renders a static stacked sequence (no pin).
 */
export function JourneyScroll({
  eyebrow,
  title,
  titleAccent,
}: {
  eyebrow: string;
  title: string;
  titleAccent: string;
}) {
  const t = useTranslations("home.journey");
  const raw = t.raw("stages") as Record<string, Stage>;
  const stages = STAGE_ORDER.map((k) => raw[k]);

  const [reduced, setReduced] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReduced(true);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      photoRefs.current.forEach((el, i) => el && gsap.set(el, { opacity: i === 0 ? 1 : 0 }));
      panelRefs.current.forEach((el, i) => el && gsap.set(el, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 24 }));

      const st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * STAGES}`,
        pin: pinRef.current,
        scrub: true,
        onUpdate: (self) => {
          const seg = self.progress * STAGES;
          const active = Math.min(STAGES - 1, Math.floor(seg));
          const frac = Math.min(1, seg - active);

          photoRefs.current.forEach((el, i) => {
            if (!el) return;
            let o = 0;
            if (i === active) o = 1 - frac * 0.85;
            else if (i === active + 1) o = frac;
            gsap.set(el, { opacity: o });
          });
          panelRefs.current.forEach((el, i) => {
            if (!el) return;
            const on = i === active;
            gsap.set(el, { opacity: on ? 1 : 0, y: on ? 0 : 24 });
          });
          if (railRef.current) gsap.set(railRef.current, { scaleX: self.progress });
          dotRefs.current.forEach((d, i) => {
            if (d) gsap.set(d, { scale: i <= active ? 1 : 0.55, opacity: i <= active ? 1 : 0.4 });
          });
        },
      });

      return () => st.kill();
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  // ---- Static (reduced-motion) ----
  if (reduced) {
    return (
      <section className="bg-navy-950 py-20 text-white" aria-label={`${title} ${titleAccent}`}>
        <Container>
          <span className="eyebrow-dot mb-4 text-overline font-semibold uppercase tracking-wide text-teal-300">{eyebrow}</span>
          <h2 className="mb-12 max-w-2xl text-display-lg font-bold leading-[1.05]">
            {title} <span className="text-accent">{titleAccent}</span>
          </h2>
          <div className="space-y-12">
            {stages.map((s, i) => (
              <div key={`fb-${i}`} className="grid gap-6 md:grid-cols-2 md:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image src={s.image} alt={s.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-heading-xl font-bold text-accent">{s.metric}</span>
                    <span className="text-caption uppercase tracking-wide text-navy-300">{s.metricLabel}</span>
                  </div>
                  <h3 className="mt-1 text-heading-md font-semibold">{s.title}</h3>
                  <p className="mt-1 text-body-md text-navy-200">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // ---- Animated (pinned) ----
  return (
    <section ref={wrapRef} aria-label={`${title} ${titleAccent}`}>
      <div ref={pinRef} className="relative isolate grain h-screen overflow-hidden bg-navy-950 text-white">
        {stages.map((s, i) => (
          <div
            key={`photo-${i}`}
            ref={(el) => { photoRefs.current[i] = el; }}
            className="absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
            aria-hidden={i !== 0}
          >
            <Image src={s.image} alt={s.title} fill priority={i === 0} sizes="100vw" className="object-cover object-center opacity-70" />
          </div>
        ))}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/55" />
        <div aria-hidden className="absolute inset-0 glow-teal" style={{ ["--gx" as string]: "80%", ["--gy" as string]: "22%" }} />
        <div aria-hidden className="absolute inset-0 bg-dotgrid bg-dotgrid-fade text-white/[0.06]" />

        <Container className="relative z-[1] flex h-full flex-col justify-center">
          <span className="eyebrow-dot mb-4 text-overline font-semibold uppercase tracking-wide text-teal-300">{eyebrow}</span>
          <h2 className="max-w-2xl text-display-lg font-bold leading-[1.05]">
            {title} <span className="text-accent">{titleAccent}</span>
          </h2>

          <div className="relative mt-10 h-44 max-w-xl">
            {stages.map((s, i) => {
              const Icon = STAGE_ICONS[i] ?? Warehouse;
              return (
                <div
                  key={`panel-${i}`}
                  ref={(el) => { panelRefs.current[i] = el; }}
                  className="absolute inset-0"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <div className="flex items-start gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/25">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-heading-xl font-bold text-accent">{s.metric}</span>
                        <span className="text-caption uppercase tracking-wide text-navy-300">{s.metricLabel}</span>
                      </div>
                      <h3 className="mt-1 text-heading-md font-semibold text-white">{s.title}</h3>
                      <p className="mt-1 max-w-md text-body-md text-navy-200">{s.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex max-w-xl items-center gap-3">
            <div className="relative h-px flex-1 bg-white/15">
              <span ref={railRef} className="absolute left-0 top-0 h-px w-full origin-left bg-teal-400" style={{ transform: "scaleX(0)" }} />
            </div>
            <div className="flex items-center gap-2">
              {stages.map((_, i) => (
                <span
                  key={`dot-${i}`}
                  ref={(el) => { dotRefs.current[i] = el; }}
                  className="h-2 w-2 rounded-full bg-teal-400"
                  style={{ transform: i === 0 ? "scale(1)" : "scale(0.55)", opacity: i === 0 ? 1 : 0.4 }}
                />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
