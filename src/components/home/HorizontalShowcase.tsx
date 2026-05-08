"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * HorizontalShowcase — a single, predictable scroll-jacked horizontal pan.
 *
 * Earlier versions tried to be clever: scroll-jack on the first pass, then swap
 * to a flat snap-scroll row, with a `window.scrollTo` correction to mask the
 * resulting layout shift. That swap was the source of every reported bug —
 * "teleports forward," "jumps mid-section," "feels jumpy on rescroll." Codex
 * flagged it as fragile during review. So we drop it.
 *
 * One mode, every visit:
 * - The wrapper is `(N - 1) * 120 + 100` viewport-heights tall.
 * - A sticky inner container pins the panels to the screen for that span.
 * - Vertical scroll progress maps linearly to a horizontal translate on the
 *   panel track.
 * - Lenis (mounted in layout.tsx) lerps scroll velocity globally, so the
 *   transform reads from a continuous frame-perfect signal — no chunkiness.
 *
 * Trade-off: scrolling back up re-experiences the pan. With Lenis-smooth scroll
 * and a tighter wrapper height, that's a feature (it's brief, smooth, and the
 * content is short) rather than punishment. No swap means no layout shift, no
 * race conditions, no scrollTo, no edge cases.
 *
 * Reduced-motion users get a stacked vertical fallback — no jacking at all.
 */

type Panel = {
  eyebrow: string;
  title: string;
  body: string;
  background: string;
};

const panels: Panel[] = [
  {
    eyebrow: "01 — Tone",
    title: "Tracked through analog.",
    body: "Every guitar passes through tube amps, tape saturation, and a real room before it ever hits the DAW.",
    background:
      "radial-gradient(60% 60% at 30% 30%, rgba(126,87,194,0.55), transparent 60%), linear-gradient(135deg, #100912, #2a1336 65%, #4a1d4a)",
  },
  {
    eyebrow: "02 — Craft",
    title: "Written like a song.",
    body: "Beats, loops, and full instrumentals with structure. Verses, lifts, bridges — built so a vocal can live in them.",
    background:
      "radial-gradient(60% 60% at 70% 35%, rgba(255,154,0,0.4), transparent 60%), linear-gradient(135deg, #1a0e07, #3a1e0c 60%, #6b2f12)",
  },
  {
    eyebrow: "03 — Collaboration",
    title: "Built with other artists.",
    body: "Vocalists, co-producers, engineers, visual artists. Every release ships with credits and transparent splits.",
    background:
      "radial-gradient(60% 60% at 50% 30%, rgba(0,180,255,0.4), transparent 60%), linear-gradient(135deg, #051018, #0d2238 65%, #163c5a)",
  },
  {
    eyebrow: "04 — Finish",
    title: "Mixed for streaming.",
    body: "Loud where loud belongs, quiet where it counts. Masters checked across earbuds, monitors, and the car.",
    background:
      "radial-gradient(60% 60% at 40% 30%, rgba(255,210,140,0.3), transparent 60%), linear-gradient(135deg, #0f0f0f, #1f1c19 65%, #3a3128)",
  },
];

export function HorizontalShowcase() {
  const reduced = useReducedMotion();
  if (reduced) return <FallbackStack />;
  return <ScrollJackedShowcase />;
}

function ScrollJackedShowcase() {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const panelCount = panels.length;
  // Each additional panel adds 120vh of vertical scroll (a generous travel that
  // keeps the pan unhurried), plus 100vh for the resting first panel.
  const wrapperVh = (panelCount - 1) * 120 + 100;
  const translatePct = -((panelCount - 1) * 100);

  // Linear map. Lenis is doing all the smoothing upstream.
  // The 0.05 / 0.95 padding keeps the first and last panels resting fully on
  // screen at the section's edges.
  const x = useTransform(
    scrollYProgress,
    [0.05, 0.95],
    ["0%", `${translatePct}%`],
  );

  return (
    <section
      ref={wrapperRef}
      aria-label="What goes into a Nathan Godinez record"
      style={{ height: `${wrapperVh}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <motion.div
          style={{
            x,
            // GPU-composite hint — keeps the long horizontal track on its own
            // layer so wide translates don't trigger full repaints.
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
          className="flex h-full"
        >
          {panels.map((p, i) => (
            <PanelSlide key={p.title} panel={p} index={i} total={panelCount} />
          ))}
        </motion.div>

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2"
        >
          {panels.map((_, i) => (
            <ProgressDot
              key={i}
              index={i}
              total={panelCount}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute right-8 top-8 text-[11px] uppercase tracking-[0.25em] text-white/60">
          Scroll →
        </div>
      </div>
    </section>
  );
}

function FallbackStack() {
  return (
    <section
      aria-label="What goes into a Nathan Godinez record"
      className="section"
      style={{ background: "var(--bg-soft)" }}
    >
      <div className="container-x grid gap-8">
        {panels.map((p) => (
          <article
            key={p.title}
            className="overflow-hidden rounded-3xl p-10 text-white"
            style={{ background: p.background }}
          >
            <p className="text-[12px] uppercase tracking-[0.25em] opacity-75">
              {p.eyebrow}
            </p>
            <h3 className="display mt-3 text-[clamp(1.75rem,4vw,3rem)]">{p.title}</h3>
            <p className="mt-4 max-w-xl text-[15px] opacity-85">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PanelSlide({
  panel,
  index,
  total,
}: {
  panel: Panel;
  index: number;
  total: number;
}) {
  return (
    <div
      className="relative flex h-full w-screen shrink-0 items-center"
      style={{ background: panel.background }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 60%, transparent, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <div className="container-x relative z-10 grid gap-8 text-white md:grid-cols-12">
        <div className="md:col-span-7 md:col-start-2">
          <p className="text-[12px] uppercase tracking-[0.25em] opacity-75">
            {panel.eyebrow}
          </p>
          <h3 className="display mt-4 text-[clamp(2.5rem,7vw,5.5rem)]">
            {panel.title}
          </h3>
          <p className="mt-6 max-w-xl text-[clamp(1rem,1.5vw,1.25rem)] opacity-85">
            {panel.body}
          </p>
        </div>
        <div className="absolute bottom-8 right-8 text-[12px] uppercase tracking-[0.25em] opacity-60">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

function ProgressDot({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = (index - 0.4) / (total - 1);
  const end = (index + 0.4) / (total - 1);
  const opacity = useTransform(progress, [start, end, end + 0.0001], [0.3, 1, 0.3]);
  const scale = useTransform(progress, [start, end, end + 0.0001], [1, 1.4, 1]);
  return (
    <motion.span
      style={{ opacity, scale }}
      className="block h-1.5 w-6 rounded-full bg-white"
    />
  );
}
