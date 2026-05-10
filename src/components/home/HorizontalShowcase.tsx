"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Two-mode horizontal showcase, swap-based, per browser tab.
 *
 *   First visit (consumed === false):
 *     <ScrollJackedShowcase /> — tall wrapper (~460vh), sticky 100vh inner,
 *     panels translate horizontally as the user scrolls vertically. The user
 *     is "forced" to ride the cinematic once.
 *
 *   After consumption (consumed === true):
 *     <PassThroughRow /> — 100vh, horizontal-snap row of the same panels.
 *     Vertical scroll passes through normally; revisiting requires horizontal
 *     scroll inside the row.
 *
 *   prefers-reduced-motion (any state):
 *     <FallbackStack /> — vertical stack. Untouched. Scroll-snap rows are
 *     also motion; reduced-motion users get the most conservative layout.
 *
 * The teleport-on-swap problem and how this version avoids it:
 *
 *   When the wrapper shrinks from ~460vh to 100vh, document height drops by
 *   ~3700px. The browser auto-clamps window.scrollY before any of our React
 *   code runs, AND Lenis's RAF loop can lerp toward a stale pre-swap target
 *   on the next tick. Both effects combined moved the user unpredictably
 *   (sometimes far below, sometimes back to the top).
 *
 *   Fix:
 *     1. Capture target Y from LAYOUT-INVARIANT values, computed BEFORE the
 *        React state flip:
 *          sectionTop  = rect.top + window.scrollY
 *          targetY     = sectionTop + window.innerHeight   // bottom of new 100vh section
 *        Hero's height above the section never changes, so sectionTop is
 *        stable across the swap. We never read window.scrollY after the
 *        commit (where it's already been clamped).
 *
 *     2. Freeze Lenis before flipping state via lenis.stop(). This prevents
 *        any RAF tick during the swap from overriding our scroll target.
 *
 *     3. After commit, in useLayoutEffect:
 *          - window.scrollTo({ behavior: "instant" })  // direct browser scroll
 *          - lenis.resize()                             // refresh scrollHeight cache
 *          - lenis.scrollTo(target, { immediate, force }) // overwrite Lenis target
 *          - lenis.start()                              // resume RAF loop
 *
 *   This gives both the browser and Lenis a synchronous absolute anchor at a
 *   point that was computed from the unshrunken layout, no relative math.
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
  const reduced = useReducedMotion();
  // Reduced-motion users get the vertical stack, full stop. Scroll-snap rows
  // are also motion; this is the most accessibility-correct option and it's
  // already working — we don't trade it for fancier behavior.
  if (reduced) return <FallbackStack />;
  return <ConsumableShowcase />;
}

/* ---- consumable: handles the swap + scroll anchor ---- */

function ConsumableShowcase() {
  const consumed = useSyncExternalStore(
    subscribeConsumed,
    readConsumed,
    getServerConsumedSnapshot,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Pre-computed absolute Y where the user should land after the swap.
  // Captured in `handleConsumed`, applied in `useLayoutEffect` post-commit.
  const targetYRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const target = targetYRef.current;
    if (target == null) return;
    targetYRef.current = null;

    // Belt: command the browser to scroll directly, instantly.
    window.scrollTo({
      top: target,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });

    // Suspenders: sync Lenis. The document just shrunk by ~360vh, so Lenis's
    // cached scrollHeight is stale; resize() refreshes it. scrollTo with
    // immediate+force overwrites Lenis's internal target so its next RAF
    // tick doesn't lerp away from where we just put the user. start() resumes
    // the RAF loop after the freeze in handleConsumed.
    const lenis = window.__lenis;
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(target, { immediate: true, force: true });
      lenis.start();
    }
  }, [consumed]);

  function handleConsumed() {
    if (consumedRuntime || !containerRef.current) return;

    // Compute the post-swap anchor from layout-INVARIANT numbers. Hero's
    // height above doesn't change between modes, so this Y is stable.
    const rect = containerRef.current.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    // Land the user AT the top of the (now 100vh) snap row — they should see
    // the row they just unlocked, not be flung past it into Featured Music.
    targetYRef.current = sectionTop;

    // Freeze Lenis BEFORE the React commit. If we don't, a RAF tick can fire
    // between the DOM update and our useLayoutEffect and pull the user away
    // from the anchor we're about to set.
    window.__lenis?.stop();

    notifyConsumed();
  }

  return (
    <div ref={containerRef}>
      {consumed ? (
        <PassThroughRow />
      ) : (
        <ScrollJackedShowcase onConsumed={handleConsumed} />
      )}
    </div>
  );
}

/* ---- scroll-jacked first pass ---- */

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

  // Fire consumption near the very end of the pan. Lenis can plateau slightly
  // below 1.0, so 0.99 is a reliable trigger; the consumedRuntime guard inside
  // handleConsumed prevents repeat fires.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.99) onConsumed();
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
            // GPU compositing hints. NOTE: do NOT add `contain: paint` here.
            // The track is 100vw wide but its four 100vw children overflow to
            // 400vw. `contain: paint` clips painting to the track's box, which
            // turned the off-track panels invisible — only the panel sitting
            // inside the track's current bounding box would render. We rely
            // on per-panel `contain` (PanelSlide below) for paint isolation,
            // which is safe because each panel fully contains its own content.
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

/* ---- pass-through horizontal-snap row, after consumption ---- */

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

/* ---- reduced-motion fallback (UNCHANGED — accessibility) ---- */

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
