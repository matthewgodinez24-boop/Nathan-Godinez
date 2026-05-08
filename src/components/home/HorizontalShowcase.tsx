"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";

/**
 * One-shot horizontal showcase.
 *
 * Behavior:
 * - First entry on a session: render a tall scroll-jacked wrapper that pins the
 *   panels and pans them horizontally as the user scrolls vertically. The user
 *   is "forced" to swipe through once.
 * - When the pan reaches its end, mark the section consumed and persist a flag
 *   in `sessionStorage`. The wrapper collapses to a flat 100vh row.
 * - Crucial: the moment we collapse, we capture the wrapper's old height and
 *   inside a `useLayoutEffect` (synchronous, runs *before* the browser paints
 *   the new layout) we call `window.scrollBy(0, -delta)`. The user's viewport
 *   ends up showing the same DOM content it was showing a frame earlier — no
 *   jump, no teleport, no reflow flash.
 * - After consumption, scrolling up or down through the section is a normal
 *   100vh block. No re-pinning, no re-trapping.
 *
 * Why sessionStorage (not just useState):
 * - Without persistence, the consumed flag resets every time the homepage
 *   remounts — e.g. user clicks Store, hits Back, returns to `/`. They'd be
 *   re-trapped on every round trip. sessionStorage scopes the flag to the
 *   browser tab, so the cinematic plays exactly once per session.
 * - sessionStorage clears when the tab closes, so a genuine new visit (new
 *   day, new tab) re-plays the cinematic — which is what the client wants.
 * - localStorage would be wrong: it would dismiss the cinematic *forever*
 *   across sessions, which isn't what was asked for.
 */

const STORAGE_KEY = "showcase-consumed";

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
  const [consumed, setConsumed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // A ref-based guard for the consumed transition. State is async; this is sync.
  // Without it, fast scroll bursts could fire `markConsumed` more than once
  // before React commits, double-capturing heights and breaking the math.
  const consumedRef = useRef(false);
  // Wrapper's pixel height captured immediately before the consumed flip during
  // user scroll. The next layout effect uses it to compute the exact compensation.
  const heightBeforeRef = useRef<number | null>(null);

  // Hydrate from sessionStorage on mount. useLayoutEffect runs synchronously
  // before the first browser paint, so a returning visitor lands directly on
  // the compact PassThroughRow with no flicker of the tall scroll-jack.
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        consumedRef.current = true;
        setConsumed(true);
      }
    } catch {
      // sessionStorage may be blocked (private browsing, sandboxed iframes, etc.).
      // Falling back to per-mount state is the right behavior — the user just
      // experiences the cinematic on each fresh load, no error path.
    }
  }, []);

  // Compensate scroll position when the wrapper height shrinks mid-page.
  // Runs synchronously after DOM commit, before the browser paints the new
  // layout — so the visible viewport stays exactly where it was.
  useLayoutEffect(() => {
    if (heightBeforeRef.current == null || !containerRef.current) return;
    const before = heightBeforeRef.current;
    const after = containerRef.current.offsetHeight;
    heightBeforeRef.current = null;
    const delta = before - after;
    // `scrollBy` with a relative value (not `scrollTo` to an absolute target)
    // means we're nudging by the exact amount the page reflowed under us. No
    // assumptions about Lenis, scroll restoration, or where the user was.
    if (delta > 0 && window.scrollY > 0) {
      window.scrollBy(0, -delta);
    }
  }, [consumed]);

  function markConsumed() {
    if (consumedRef.current || !containerRef.current) return;
    consumedRef.current = true;
    heightBeforeRef.current = containerRef.current.offsetHeight;
    setConsumed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — see hydration effect comment above.
    }
  }

  if (reduced) return <FallbackStack />;

  return (
    <div ref={containerRef}>
      {consumed ? (
        <PassThroughRow />
      ) : (
        <ScrollJackedShowcase onConsumed={markConsumed} />
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
  // Each additional panel adds 120vh of vertical scroll. Plus 100vh for the
  // resting first panel. Lenis smooths scroll velocity globally so the pan
  // reads from a continuous frame-perfect signal — no spring needed here.
  const wrapperVh = (panelCount - 1) * 120 + 100;
  const translatePct = -((panelCount - 1) * 100);

  const x = useTransform(
    scrollYProgress,
    [0.05, 0.95],
    ["0%", `${translatePct}%`],
  );

  // Fire `onConsumed` once the user has effectively reached the end of the pan.
  // The `markConsumed` closure on the parent guards against re-entry via its
  // own ref, so multiple updates here are safe.
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
        <motion.div
          style={{
            x,
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

/* ---------------- Pass-through row, after consumption ---------------- */

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
