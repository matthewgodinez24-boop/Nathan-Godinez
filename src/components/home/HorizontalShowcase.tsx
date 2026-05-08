"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * HorizontalShowcase — Apple-style scroll-jacked horizontal panel slider.
 *
 * The outer wrapper is tall (height = number-of-panels × 100vh). Inside, a sticky
 * viewport pins to the screen and translates a horizontal track left as the user
 * scrolls down. Scrolling back up reverses the slide. Honors prefers-reduced-motion.
 *
 * Edit content by changing the `panels` array below.
 */

type Panel = {
  eyebrow: string;
  title: string;
  body: string;
  // CSS background string applied to the panel (gradient by default; swap for an image)
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
    body: "Beats with structure. Verses, lifts, bridges — built so a vocal can live in them, not survive them.",
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
  const wrapperRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // The track holds N panels side by side. We translate it left across (N-1) widths.
  // Edges of the scroll range are snapped slightly so the first/last panels rest fully on screen.
  const panelCount = panels.length;
  const translatePct = -((panelCount - 1) * 100);
  const x = useTransform(
    scrollYProgress,
    [0.05, 0.95],
    reduced ? ["0%", "0%"] : ["0%", `${translatePct}%`],
  );

  return (
    <section
      ref={wrapperRef}
      aria-label="What goes into a Nathan Godinez record"
      // Total scroll height = N panels * 100vh — gives room for the horizontal pan.
      // Reduced-motion users get a single-screen tall section that just stacks vertically below.
      style={{ height: reduced ? "auto" : `${panelCount * 100}vh` }}
      className="relative"
    >
      {reduced ? (
        // Reduced-motion fallback: vertical stack, no scroll-jacking.
        <div className="container-x section grid gap-8">
          {panels.map((p) => (
            <PanelCard key={p.title} panel={p} />
          ))}
        </div>
      ) : (
        <div className="sticky top-0 h-dvh overflow-hidden">
          <motion.div
            style={{ x }}
            className="flex h-full"
          >
            {panels.map((p, i) => (
              <PanelSlide key={p.title} panel={p} index={i} total={panelCount} />
            ))}
          </motion.div>

          {/* Progress dots */}
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
        </div>
      )}
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
  // Subtle parallax: text slides in slightly lagged behind the track travel
  return (
    <div
      className="relative flex h-full w-screen shrink-0 items-center"
      style={{ background: panel.background }}
    >
      {/* Soft vignette */}
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

function PanelCard({ panel }: { panel: Panel }) {
  // Reduced-motion variant — same content, vertical card, no panning
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-10 text-white"
      style={{ background: panel.background }}
    >
      <p className="text-[12px] uppercase tracking-[0.25em] opacity-75">
        {panel.eyebrow}
      </p>
      <h3 className="display mt-3 text-[clamp(1.75rem,4vw,3rem)]">{panel.title}</h3>
      <p className="mt-4 max-w-xl text-[15px] opacity-85">{panel.body}</p>
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
  // Each dot lights up when the slider is on its panel
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
