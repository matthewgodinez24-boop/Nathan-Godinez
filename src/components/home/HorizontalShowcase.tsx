"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Horizontal showcase — three render branches, no mid-mount layout shifts.
 *
 *   prefers-reduced-motion (any state) → <FallbackStack />
 *     Vertical accessible stack. Untouched.
 *
 *   First visit per browser tab (consumed === false) → <ScrollJackedShowcase />
 *     Tall wrapper (~460vh), sticky 100vh inner, panels translate horizontally
 *     as the user scrolls vertically. Lenis (mounted globally) smooths input.
 *     When the user reaches the end ONCE, sessionStorage flag is written and
 *     the panel track *locks* on panel 4. The wrapper does NOT collapse and
 *     we do NOT call window.scrollTo or lenis.scrollTo — the section stays
 *     mounted at its full height for the rest of this page view. Scrolling
 *     back up does not replay the swipe animation; panel 4 stays put.
 *
 *   Future visit in same tab (consumed === true on mount) → <CompactGrid />
 *     A normal vertical grid of the same content. No scroll-jack, no sticky,
 *     no Lenis interaction. The decision happens at mount time, so there's
 *     no mid-page swap to coordinate.
 *
 * The previous architectures swapped the wrapper from ~460vh to 100vh while
 * the user was inside it, then tried to compensate scroll with window.scrollTo
 * and lenis.scrollTo. Every variant of that had failure modes (browser
 * auto-clamping scrollY before our compensation ran, Lenis lerping toward
 * a stale target, etc.). This version eliminates the swap entirely; the
 * "locked panel 4" state is implemented at the data layer via a ratcheted
 * MotionValue, not at the layout layer.
 */

/* ---- module-level external store for the consumed flag ---- */

const STORAGE_KEY = "showcase-consumed";

let consumedRuntime = false;
let consumedHydrated = false;
const consumedSubscribers = new Set<() => void>();

function readConsumed(): boolean {
  if (!consumedHydrated) {
    consumedHydrated = true;
    try {
      consumedRuntime = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // sessionStorage may be blocked (private browsing, sandboxed iframes).
      // Runtime override below still works for the lifetime of the tab.
    }
  }
  return consumedRuntime;
}

function notifyConsumed(): void {
  if (consumedRuntime) return;
  consumedRuntime = true;
  consumedHydrated = true;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore — runtime flag still gives correct behavior for this tab.
  }
  consumedSubscribers.forEach((cb) => cb());
}

function subscribeConsumed(cb: () => void): () => void {
  consumedSubscribers.add(cb);
  return () => {
    consumedSubscribers.delete(cb);
  };
}

const getServerConsumedSnapshot = () => false;

/* ---- panels ---- */

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

/* ---- root: route between three modes ---- */

export function HorizontalShowcase() {
  // Both hooks always called — no conditional hooks. Branching happens after.
  const reduced = useReducedMotion();
  const consumed = useSyncExternalStore(
    subscribeConsumed,
    readConsumed,
    getServerConsumedSnapshot,
  );

  // Reduced-motion users always get the vertical stack — full stop. Don't
  // trade it for fancier behavior they didn't ask for.
  if (reduced) return <FallbackStack />;
  // Future visit in this tab — render the compact grid directly. The decision
  // happens once at mount time; we never swap during the page view.
  if (consumed) return <CompactGrid />;
  return <ScrollJackedShowcase />;
}

/* ---- scroll-jacked first pass with in-mount lock ---- */

function ScrollJackedShowcase() {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const panelCount = panels.length;
  const wrapperVh = (panelCount - 1) * 120 + 100;
  const translatePct = -((panelCount - 1) * 100);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  /**
   * Ratchet — a MotionValue that mirrors scrollYProgress on the way up but
   * never decreases. Both the panel translate and the progress dots key off
   * this single value. Effects:
   *   - Forward scroll: panels pan smoothly.
   *   - Backward scroll: panels stay where they ended up. No re-pan.
   *   - At >= 0.99: ratchet is pinned to 1.0, sessionStorage is written.
   *
   * No layout change. No conditional render. No prop-type swap on x. The
   * wrapper stays at its full height for the entire mount.
   */
  const ratchet = useMotionValue(0);
  const lastProgressRef = useRef(0);
  const completionFiredRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value > lastProgressRef.current) {
      lastProgressRef.current = value;
      ratchet.set(value);
    }
    if (!completionFiredRef.current && value >= 0.99) {
      completionFiredRef.current = true;
      ratchet.set(1); // pin to absolute end so x lands at translatePct exactly
      notifyConsumed(); // persists for future mounts
    }
  });

  // Map ratcheted progress → horizontal translate. The 0.05 / 0.95 padding
  // gives the first and last panels a moment of "rest" at the edges of the
  // sticky range — they sit fully on screen rather than half-arrived.
  const x = useTransform(
    ratchet,
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
            // GPU compositing hints. Note: NO `contain: paint` here — the
            // four 100vw panels overflow the 100vw track, and contain:paint
            // would clip the off-track ones invisible.
            willChange: "transform",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
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
              progress={ratchet}
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

/* ---- compact grid (future-mount mode) ---- */
/* Replaces the previous horizontal-snap PassThroughRow per spec — once the
   user has consumed the cinematic, give them a normal vertical/grid section
   so they can maneuver naturally, not another scroll-snap thing. */

function CompactGrid() {
  return (
    <section
      aria-label="What goes into a Nathan Godinez record"
      className="section"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 35%, #1a1614 0%, #0c0a09 60%, #060504 100%)",
      }}
    >
      <div className="container-x">
        <div className="mb-10 max-w-2xl text-white">
          <p className="text-[12px] uppercase tracking-[0.25em] text-white/55">
            The process
          </p>
          <h2 className="display mt-3 text-[clamp(2rem,5vw,4rem)]">
            What goes into a record.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {panels.map((panel) => (
            <article
              key={panel.title}
              className="flex min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl p-8 text-white"
              style={{ background: panel.background }}
            >
              <p className="text-[11px] uppercase tracking-[0.25em] opacity-75">
                {panel.eyebrow}
              </p>
              <h3 className="display mt-3 text-[clamp(1.65rem,3vw,2.35rem)]">
                {panel.title}
              </h3>
              <p className="mt-3 max-w-md text-[14px] opacity-80">{panel.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- reduced-motion fallback (UNCHANGED) ---- */

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

/* ---- sub-components ---- */

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
        // Per-panel paint containment is safe: each panel's content fits
        // within its 100vw box, so paint clipping has nothing to clip away.
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
  progress: MotionValue<number>;
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
