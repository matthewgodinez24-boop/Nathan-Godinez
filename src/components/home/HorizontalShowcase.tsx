"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
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
 * Behavior the client asked for:
 * - First time the user enters this section, force them to right-swipe through
 *   the four panels via vertical scroll (the scroll-jacked, pinned mode).
 * - The moment they finish that swipe once, the section becomes a normal
 *   100vh block. Scrolling up and back down through it never re-traps them.
 *
 * Implementation notes:
 * - The "consumed" flag lives in a *module-level* store, exposed to React via
 *   `useSyncExternalStore`. That's the lint-safe primitive for "external state
 *   that may differ between server and client" — it avoids the
 *   react-hooks/set-state-in-effect rule and gives a clean SSR/hydration story.
 * - The flag is also mirrored to `sessionStorage` so the experience plays
 *   exactly once per browser tab. localStorage would dismiss it forever; bare
 *   useState would re-trap on every navigation back to `/`.
 * - When the wrapper shrinks mid-scroll, we compensate scroll position via
 *   Lenis's own `scrollTo({ immediate: true })` (when Lenis is running).
 *   Falling back to `window.scrollTo` if Lenis is absent. Using Lenis's API
 *   means the smooth-scroll target and the actual scroll position update
 *   together — no fight, no oscillation.
 */

const STORAGE_KEY = "showcase-consumed";

/* ---- module-level external store for the consumed flag ---- */

let consumedRuntime = false;
let consumedHydrated = false;
const consumedSubscribers = new Set<() => void>();

function readConsumed(): boolean {
  // Lazily hydrate from sessionStorage on the first client read.
  if (!consumedHydrated) {
    consumedHydrated = true;
    try {
      consumedRuntime = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // sessionStorage may be blocked (private browsing, sandboxed iframes).
      // The runtime override below still works for the lifetime of this tab.
    }
  }
  return consumedRuntime;
}

function markConsumedExternal(): void {
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
  // Subscribe to the module-level store. SSR returns false (no flicker); client
  // first render reads sessionStorage. React handles the snapshot mismatch
  // without a hydration warning — useSyncExternalStore is built for this.
  const consumed = useSyncExternalStore(
    subscribeConsumed,
    readConsumed,
    getServerConsumedSnapshot,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Captured at the moment the user finishes the pan, used by the layout
  // effect below to compute the exact pixel compensation needed.
  const heightBeforeRef = useRef<number | null>(null);

  // After `consumed` flips true mid-scroll, the wrapper has shrunk from the
  // tall scroll-jacked height (~4.6× viewport) down to 100vh. The browser
  // auto-clamps window.scrollY whenever document height shrinks below the
  // current scroll position — which happens before this layout effect runs.
  // Reading window.scrollY here would give a *post-clamp* value that's already
  // 3700-ish pixels smaller than where the user actually was; subtracting
  // delta from that lands us at scrollY=0 (the previous teleport-to-top bug).
  //
  // Fix: compute the target position from the container's *known* layout
  // (`offsetTop + after`). That is the bottom edge of the now-compressed
  // showcase — i.e. the natural reading position for the start of the next
  // section. No dependency on whatever scrollY ended up at after the clamp.
  useLayoutEffect(() => {
    if (heightBeforeRef.current == null || !containerRef.current) return;
    const before = heightBeforeRef.current;
    const after = containerRef.current.offsetHeight;
    heightBeforeRef.current = null;
    if (before <= after) return;

    const target = containerRef.current.offsetTop + after;

    const lenis = window.__lenis;
    if (lenis) {
      // Resize first so Lenis's cached scrollHeight matches the new layout —
      // otherwise its next RAF tick can lerp toward a stale target.
      lenis.resize();
      lenis.scrollTo(target, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
    }
  }, [consumed]);

  function handleConsumed() {
    if (consumedRuntime || !containerRef.current) return;
    // Capture height *before* the store update; the store update synchronously
    // notifies subscribers, which schedules a re-render to PassThroughRow.
    heightBeforeRef.current = containerRef.current.offsetHeight;
    markConsumedExternal();
  }

  if (reduced) return <FallbackStack />;

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
