"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PackagePlus, Warehouse, Boxes, Route, PackageCheck, ReceiptText } from "lucide-react";
import { Container } from "./ui/Container";

const STAGE_ICONS = [PackagePlus, Warehouse, Boxes, Route, PackageCheck, ReceiptText];
const STAGE_ORDER = ["reception", "warehouse", "palletizing", "route", "delivery", "billing"] as const;
const STAGES = STAGE_ORDER.length;

type Stage = { title: string; body: string; metric: string; metricLabel: string; image: string };

/**
 * Flagship scroll-storytelling section — light/editorial. The section pins while
 * the supply-chain journey advances with scroll: a CLEAN photo (no overlay)
 * cross-fades stage to stage in a rounded panel, while the copy + metric swap on
 * the left and a progress rail "connects the points". GSAP ScrollTrigger drives
 * it (synced to Lenis). Under prefers-reduced-motion it renders a static stack.
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
      panelRefs.current.forEach((el, i) => el && gsap.set(el, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 }));

      const st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * STAGES * 0.7}`,
        pin: pinRef.current,
        scrub: true,
        onUpdate: (self) => {
          const seg = self.progress * STAGES;
          const active = Math.min(STAGES - 1, Math.floor(seg));
          const frac = Math.min(1, seg - active);

          photoRefs.current.forEach((el, i) => {
            if (!el) return;
            let o = 0;
            if (i === active) o = 1 - frac;
            else if (i === active + 1) o = frac;
            gsap.set(el, { opacity: o });
          });
          panelRefs.current.forEach((el, i) => {
            if (!el) return;
            const on = i === active;
            gsap.set(el, { opacity: on ? 1 : 0, y: on ? 0 : 20 });
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
      <section className="bg-navy-50 py-20" aria-label={`${title} ${titleAccent}`}>
        <Container>
          <span className="eyebrow-dot mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-700">{eyebrow}</span>
          <h2 className="mb-12 max-w-2xl text-display-lg font-bold leading-[1.05] text-navy-900">
            {title} <span className="text-accent-strong">{titleAccent}</span>
          </h2>
          <div className="space-y-12">
            {stages.map((s, i) => (
              <div key={`fb-${i}`} className="grid gap-6 md:grid-cols-2 md:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-navy-100">
                  <Image src={s.image} alt={s.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-heading-xl font-bold text-accent-strong">{s.metric}</span>
                    <span className="text-caption uppercase tracking-wide text-navy-500">{s.metricLabel}</span>
                  </div>
                  <h3 className="mt-1 text-heading-md font-semibold text-navy-900">{s.title}</h3>
                  <p className="mt-1 text-body-md text-navy-600">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // ---- Animated (pinned, light) ----
  return (
    <section ref={wrapRef} aria-label={`${title} ${titleAccent}`}>
      <div ref={pinRef} className="relative grid h-screen overflow-hidden bg-navy-50 md:grid-cols-2">
        {/* Left: heading + swapping copy + rail (on clean surface) */}
        <div className="flex items-center">
          <Container className="w-full md:!mr-0 md:max-w-[640px] md:pl-8 md:pr-16">
            <span className="eyebrow-dot mb-4 inline-block text-overline font-semibold uppercase tracking-wide text-teal-700">{eyebrow}</span>
            <h2 className="max-w-xl text-heading-xl md:text-display-lg font-bold leading-[1.06] text-navy-900">
              {title} <span className="text-accent-strong">{titleAccent}</span>
            </h2>

            <div className="relative mt-8 h-40">
              {stages.map((s, i) => {
                const Icon = STAGE_ICONS[i] ?? Warehouse;
                return (
                  <div
                    key={`panel-${i}`}
                    ref={(el) => { panelRefs.current[i] = el; }}
                    className="absolute inset-0"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/12 text-teal-600 ring-1 ring-inset ring-teal-500/20">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-heading-xl font-bold text-accent-strong">{s.metric}</span>
                          <span className="text-caption uppercase tracking-wide text-navy-500">{s.metricLabel}</span>
                        </div>
                        <h3 className="mt-1 text-heading-md font-semibold text-navy-900">{s.title}</h3>
                        <p className="mt-1 max-w-md text-body-md text-navy-600">{s.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex max-w-md items-center gap-3">
              <div className="relative h-px flex-1 bg-navy-200">
                <span ref={railRef} className="absolute left-0 top-0 h-px w-full origin-left bg-teal-500" style={{ transform: "scaleX(0)" }} />
              </div>
              <div className="flex items-center gap-2">
                {stages.map((_, i) => (
                  <span
                    key={`dot-${i}`}
                    ref={(el) => { dotRefs.current[i] = el; }}
                    className="h-2 w-2 rounded-full bg-teal-500"
                    style={{ transform: i === 0 ? "scale(1)" : "scale(0.55)", opacity: i === 0 ? 1 : 0.4 }}
                  />
                ))}
              </div>
            </div>
          </Container>
        </div>

        {/* Right: full-bleed cross-fading photo (edge-to-edge, no frame) */}
        <div className="relative hidden md:block">
          {stages.map((s, i) => (
            <div
              key={`photo-${i}`}
              ref={(el) => { photoRefs.current[i] = el; }}
              className="absolute inset-0"
              style={{ opacity: i === 0 ? 1 : 0 }}
              aria-hidden={i !== 0}
            >
              <Image src={s.image} alt={s.title} fill priority={i === 0} sizes="50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
