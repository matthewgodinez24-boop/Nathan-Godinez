"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from "framer-motion";

/**
 * HorizontalShowcase — scroll-jacked horizontal panel slider, ONE-SHOT per page load.
 *
 * Behavior:
 * - First time the user scrolls through it on this page load: section is pinned,
 *   panels pan horizontally as the user scrolls vertically.
 * - Once the user reaches the end of the pan, the section flips to a flat
 *   horizontal-snap row for the rest of this page view — they can scroll up
 *   without getting re-trapped.
 * - On hard refresh / new visit: the consumed flag resets. The user is required
 *   to scroll through it once again. (Client requested: "Doesn't require first
 *   scroll-through on the modules when u refresh.")
 *
 * No persistent storage. State is component-local — resets on every mount.
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
  // Per-mount only — no persistence. Refresh resets the experience.
  const [consumed, setConsumed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Bug the client reported: "After the part where it swipes right, when it
   * ends the swiping it teleports to the featured beats portion."
   *
   * Cause: the scroll-jacked wrapper is ~3× viewport tall. When we collapse it
   * to the 100vh PassThroughRow, the page reflows and everything below jumps
   * up by ~2 viewports — the user is suddenly in FeaturedBeats.
   *
   * Fix: when the swap happens, immediately scroll the user to the bottom of
   * the new compact section. They land exactly where they expected: just past
   * the showcase, ready to scroll into FeaturedBeats normally.
   */
  useEffect(() => {
    if (!consumed || !containerRef.current) return;
    const top = containerRef.current.offsetTop;
    window.scrollTo({ top: top + window.innerHeight, behavior: "auto" });
  }, [consumed]);

  if (reduced) return <FallbackStack />;

  return (
    <div ref={containerRef}>
      {consumed ? (
        <PassThroughRow />
      ) : (
        <ScrollJackedShowcase onConsumed={() => setConsumed(true)} />
      )}
    </div>
  );
}

/* ---------------- Scroll-jacked first pass ---------------- */

function ScrollJackedShowcase({ onConsumed }: { onConsumed: () => void }) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const panelCount = panels.length;
  // Slightly tighter than before — less scroll required per panel.
  const wrapperVh = (panelCount - 1) * 100 + 100; // total height in vh
  const translatePct = -((panelCount - 1) * 100);
  const xRaw = useTransform(
    scrollYProgress,
    [0.05, 0.95],
    ["0%", `${translatePct}%`],
  );
  // Smooth the raw mapped value with a spring — kills the chunky 1:1 stutter that
  // happens when scroll deltas are large (trackpad flicks, mouse wheel jumps).
  const x = useSpring(xRaw, {
    stiffness: 90,
    damping: 26,
    mass: 0.6,
    restDelta: 0.001,
  });

  // Mark consumed once the user reaches the end of the horizontal pan.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.985) onConsumed();
  });

  return (
    <section
      ref={wrapperRef}
      aria-label="What goes into a Nathan Godinez record"
      style={{ height: `${wrapperVh}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <motion.div style={{ x }} className="flex h-full">
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

        {/* Scroll cue */}
        <div className="pointer-events-none absolute right-8 top-8 text-[11px] uppercase tracking-[0.25em] text-white/60">
          Scroll →
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pass-through, after first consumption ---------------- */

function PassThroughRow() {
  return (
    <section
      aria-label="What goes into a Nathan Godinez record"
      className="relative isolate h-dvh overflow-hidden"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 35%, #1a1614 0%, #0c0a09 60%, #060504 100%)",
      }}
    >
      <div
        className="flex h-full snap-x snap-mandatory items-center gap-6 overflow-x-auto px-[max(2.5rem,calc((100vw-1280px)/2+1.25rem))] pb-8"
        style={{ scrollbarWidth: "none" }}
      >
        {panels.map((p) => (
          <article
            key={p.title}
            className="flex h-[78%] w-[min(86vw,640px)] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-3xl p-10 text-white"
            style={{ background: p.background }}
          >
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-75">
              {p.eyebrow}
            </p>
            <h3 className="display mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)]">
              {p.title}
            </h3>
            <p className="mt-3 max-w-md text-[14px] opacity-80">{p.body}</p>
          </article>
        ))}
      </div>

      <style>{`
        section[aria-label="What goes into a Nathan Godinez record"] [class*="snap-x"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

/* ---------------- Reduced-motion fallback ---------------- */

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

/* ---------------- Sub-components ---------------- */

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
