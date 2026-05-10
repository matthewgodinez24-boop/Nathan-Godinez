"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * One-shot horizontal showcase.
 *
 * Behavior split into three render branches:
 * - prefers-reduced-motion → <FallbackStack> (vertical accessible stack).
 * - First entry per browser tab → <ScrollJackedShowcase> (sticky pin + horizontal pan
 *   driven by vertical scroll progress).
 * - After consumption → <PassThroughRow> (a normal 100vh block with the same
 *   panels arranged in a horizontal-snap strip the user can revisit at will).
 *
 * Consumption is persisted under STORAGE_KEY in sessionStorage, scoped per tab.
 *
 * Anti-teleport (the bug we're fixing):
 *   The earlier compensation was *relative*: capture wrapper height before the
 *   flip, subtract `wrapper.offsetHeight` after, scrollBy the delta. That drifts
 *   because the consume threshold doesn't fire at exactly the same scroll
 *   position every time — Framer Motion's `change` events fire at slightly
 *   different progress values depending on velocity.
 *
 *   Fix: anchor the post-flip scroll to an *absolute* Y, captured BEFORE the
 *   flip via `getBoundingClientRect().top + window.scrollY`. After commit, we
 *   scroll the window to that exact Y so the now-100vh section sits flush at
 *   the top of the viewport, regardless of where the threshold triggered.
 */

const STORAGE_KEY = "showcase-consumed";

function readStoredConsumed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

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
  // Lazy initializer reads sessionStorage on first client render. SSR returns
  // false (no window). On returning visits in the same tab, the component
  // hydrates straight to the PassThroughRow branch.
  const [consumed, setConsumed] = useState<boolean>(() => readStoredConsumed());
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Sync guard. State is async; this is sync. Without it, fast scroll bursts
  // could fire `markConsumed` more than once before React commits.
  const consumedRef = useRef<boolean>(consumed);
  // Absolute Y of the section's top, captured BEFORE the height flip. After
  // commit, we scroll to this exact value so the now-100vh section sits flush
  // at the top of the viewport — independent of where the threshold fired.
  const sectionTopRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (sectionTopRef.current == null) return;
    const target = sectionTopRef.current;
    sectionTopRef.current = null;
    // Prefer Lenis if it's running globally — using its `scrollTo` with
    // `immediate: true, force: true` updates Lenis's internal target AND the
    // actual scroll position together. Without that, Lenis's next RAF tick
    // can lerp back toward a stale (pre-flip) target and drag the user away
    // from the anchor we just set.
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(target, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
    }
  }, [consumed]);

  function markConsumed() {
    if (consumedRef.current || !containerRef.current) return;
    consumedRef.current = true;
    // Capture the section's absolute Y BEFORE the height flip. The wrapper is
    // about to shrink by ~360vh; we'll scroll the user to this exact Y after
    // commit so the new 100vh section sits flush at the top of the viewport.
    const rect = containerRef.current.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
    setConsumed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage may be blocked (private browsing, sandboxed iframes).
      // The runtime ref still locks the visual within this mount; only the
      // cross-mount memory is lost.
    }
  }

  if (reduced) return <FallbackStack />;

  return (
    <div ref={containerRef} suppressHydrationWarning>
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
  const panelCount = panels.length;
  const wrapperVh = (panelCount - 1) * 120 + 100;
  const translatePct = -((panelCount - 1) * 100);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0.05, 0.95],
    ["0%", `${translatePct}%`],
  );

  // Tighter threshold (0.999 instead of 0.985) so consumption fires at a
  // deterministic point near the very end of the pan. The `consumedRef` guard
  // inside `markConsumed` prevents re-entry, so a high threshold is safe.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.999) onConsumed();
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
        {panels.map((panel) => (
          <article
            key={panel.title}
            className="flex h-[78%] w-[min(86vw,640px)] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-3xl p-10 text-white"
            style={{ background: panel.background }}
          >
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-75">
              {panel.eyebrow}
            </p>
            <h3 className="display mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)]">
              {panel.title}
            </h3>
            <p className="mt-3 max-w-md text-[14px] opacity-80">{panel.body}</p>
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
