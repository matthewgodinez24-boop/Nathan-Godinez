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
 * Smooth one-shot horizontal showcase.
 *
 * Architecture (the standard scroll-linked pattern):
 *   1. Tall outer wrapper (~5.5x the viewport).
 *   2. A 100vh sticky child that pins to the screen for the wrapper's full
 *      vertical span.
 *   3. Inside the sticky child, a flex "track" of panels (each w-screen).
 *   4. The vertical scroll progress through the wrapper (0..1) maps to the
 *      track's translateX. The browser (with Lenis smoothing in our case)
 *      drives the actual scroll; Framer Motion just maps the value to a
 *      transform. No wheel interception, no per-frame React state, no
 *      collapsing of the wrapper while the user is inside it.
 *
 * One-shot lock — the tricky part:
 *   The earlier versions toggled the `x` style between a MotionValue and a
 *   static string at completion. That re-binding is what felt choppy at the
 *   transition. The fix here is a *ratcheted* MotionValue: scrollYProgress
 *   feeds into a derived value that ONLY ever increases. Once the user has
 *   reached a given progress, scrolling back up doesn't decrement it. The
 *   panels never un-pan, and we never have to swap the source of `x`.
 *
 *   Side benefit: the same ratchet visually locks the panels at the final
 *   frame after completion, without an explicit "completed" branch on the
 *   render path. The pan is always one continuous motion value, top to
 *   bottom, hydration to unmount.
 *
 * Persistence:
 *   When `scrollYProgress` reaches the end the first time, we write
 *   `showcase-consumed=1` to sessionStorage. On future mounts in the same
 *   browser tab — back navigation, refresh — `useSyncExternalStore` reads
 *   the flag and we render `PassThroughGrid` instead. Cinematic plays once.
 *
 *   sessionStorage was chosen deliberately: localStorage would dismiss the
 *   cinematic forever; bare React state would re-trap users on every nav
 *   roundtrip. sessionStorage = "once per browser tab" — exactly the spec.
 */

const STORAGE_KEY = "showcase-consumed";
const COMPLETION_THRESHOLD = 0.985;

function getStoredConsumed() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeToStorage(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

function storeConsumed() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // sessionStorage may be blocked (private browsing, sandboxed iframes).
    // The ratchet still locks the visual within this mount; only the
    // cross-mount memory is lost in that case.
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
  const consumed = useSyncExternalStore(
    subscribeToStorage,
    getStoredConsumed,
    () => false,
  );

  if (reduced || consumed) return <PassThroughGrid />;
  return <SmoothScrollShowcase onComplete={storeConsumed} />;
}

function SmoothScrollShowcase({ onComplete }: { onComplete: () => void }) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const panelCount = panels.length;
  // 150vh of vertical scroll runway per panel transition. More runway = each
  // wheel/trackpad event produces a smaller horizontal step = smoother feel.
  const wrapperVh = (panelCount - 1) * 150 + 100;
  // Translate units in vw (explicit, GPU-friendly, no parent-width inference).
  const translateMaxVw = (panelCount - 1) * -100;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Ratchet: a MotionValue that mirrors scrollYProgress on the way up but
  // never decreases. Both the visual lock and the completion check key off
  // this single value, so there's never a moment where the pan source changes.
  const ratchet = useMotionValue(0);
  const lastProgressRef = useRef(0);
  const completionFiredRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value > lastProgressRef.current) {
      lastProgressRef.current = value;
      ratchet.set(value);
    }
    if (!completionFiredRef.current && value >= COMPLETION_THRESHOLD) {
      completionFiredRef.current = true;
      onComplete();
    }
  });

  // Map ratcheted progress -> horizontal translate. The 0.05 / 0.95 padding
  // gives the first and last panels a moment of "rest" at the edges of the
  // sticky range — they sit fully on screen rather than half-arrived.
  const x = useTransform(
    ratchet,
    [0.05, 0.95],
    ["0vw", `${translateMaxVw}vw`],
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
            // Promote the panel track to its own GPU layer so the long
            // horizontal translates don't trigger main-thread repaints.
            willChange: "transform",
            translateZ: 0,
            backfaceVisibility: "hidden",
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

function PassThroughGrid() {
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
