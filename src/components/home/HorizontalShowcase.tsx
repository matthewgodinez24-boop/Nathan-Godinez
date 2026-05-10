"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * HorizontalShowcase — single-mode scroll-linked horizontal pan.
 *
 * Design: the section is a tall wrapper (~5x viewport) with a sticky 100vh
 * inner container. Vertical scroll progress through the wrapper (0..1) maps
 * to the panel track's translateX. Lenis (mounted in layout.tsx) smooths the
 * scroll input so the pan reads from a continuous, frame-perfect signal.
 *
 * No "consumed" flag, no sessionStorage, no layout swap. Every time the user
 * scrolls into the section, the pan plays. This is how Apple's iPhone product
 * pages, Vercel's marketing pages, and Linear's landing handle scroll-linked
 * horizontal sections — they don't try to disable themselves on revisit.
 *
 * Earlier iterations of this file tried to swap to a flat "PassThroughRow"
 * after one pan, then compensate the resulting layout shift with a manual
 * window.scrollTo. Every variation of that approach drifted in some edge case
 * (consumption fires at slightly different scroll progress depending on
 * velocity; document height changes auto-clamp scrollY before our compensation
 * runs; Lenis lerps back to a stale target). Dropping the swap eliminates the
 * whole class of bugs.
 *
 * `prefers-reduced-motion` users still get a stacked vertical fallback — no
 * scroll-jacking, no Lenis interaction.
 */

type Panel = {
  eyebrow: string;
  title: string;
  body: string;
  background: string;
};

const panels: Panel[] = [
  {
    eyebrow: "01 - Tone",
    title: "Tracked through analog.",
    body: "Every guitar passes through tube amps, tape saturation, and a real room before it ever hits the DAW.",
    background:
      "radial-gradient(60% 60% at 30% 30%, rgba(126,87,194,0.55), transparent 60%), linear-gradient(135deg, #100912, #2a1336 65%, #4a1d4a)",
  },
  {
    eyebrow: "02 - Craft",
    title: "Written like a song.",
    body: "Beats, loops, and full instrumentals with structure. Verses, lifts, bridges - built so a vocal can live in them.",
    background:
      "radial-gradient(60% 60% at 70% 35%, rgba(255,154,0,0.4), transparent 60%), linear-gradient(135deg, #1a0e07, #3a1e0c 60%, #6b2f12)",
  },
  {
    eyebrow: "03 - Collaboration",
    title: "Built with other artists.",
    body: "Vocalists, co-producers, engineers, visual artists. Every release ships with credits and transparent splits.",
    background:
      "radial-gradient(60% 60% at 50% 30%, rgba(0,180,255,0.4), transparent 60%), linear-gradient(135deg, #051018, #0d2238 65%, #163c5a)",
  },
  {
    eyebrow: "04 - Finish",
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
  const panelCount = panels.length;
  // 120vh of vertical scroll runway per panel transition + 100vh resting
  // height = 460vh total wrapper for 4 panels. Generous enough that each
  // wheel/trackpad event produces a small horizontal step.
  const wrapperVh = (panelCount - 1) * 120 + 100;
  const translatePct = -((panelCount - 1) * 100);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Linear map. Lenis is doing all the smoothing upstream.
  // The 0.05 / 0.95 padding leaves the first and last panels resting fully on
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
            // Promote the panel track to its own GPU layer and contain its
            // paint. The track is ~5760px wide on a 1440px viewport; without
            // these hints, scroll-velocity spikes can re-rasterize on the main
            // thread and visibly stutter.
            willChange: "transform",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
            contain: "layout paint",
          }}
          className="flex h-full"
        >
          {panels.map((panel, index) => (
            <PanelSlide
              key={panel.title}
              panel={panel}
              index={index}
              total={panelCount}
            />
          ))}
        </motion.div>

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2"
        >
          {panels.map((_, index) => (
            <ProgressDot
              key={index}
              index={index}
              total={panelCount}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute right-8 top-8 text-[11px] uppercase tracking-[0.25em] text-white/60">
          Scroll
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
        {panels.map((panel) => (
          <article
            key={panel.title}
            className="overflow-hidden rounded-3xl p-10 text-white"
            style={{ background: panel.background }}
          >
            <p className="text-[12px] uppercase tracking-[0.25em] opacity-75">
              {panel.eyebrow}
            </p>
            <h3 className="display mt-3 text-[clamp(1.75rem,4vw,3rem)]">
              {panel.title}
            </h3>
            <p className="mt-4 max-w-xl text-[15px] opacity-85">{panel.body}</p>
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
      style={{
        background: panel.background,
        // Each panel paints independently — prevents one panel's repaint from
        // invalidating the rest of the track during fast scroll.
        contain: "layout paint",
      }}
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
  const opacity = useTransform(
    progress,
    [start, end, end + 0.0001],
    [0.3, 1, 0.3],
  );
  const scale = useTransform(
    progress,
    [start, end, end + 0.0001],
    [1, 1.4, 1],
  );

  return (
    <motion.span
      style={{ opacity, scale }}
      className="block h-1.5 w-6 rounded-full bg-white"
    />
  );
}
