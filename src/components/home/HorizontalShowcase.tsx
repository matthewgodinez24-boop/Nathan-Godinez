"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Highlights — Apple-style full-bleed carousel.
 *
 * Architecture: a single `track` <div> containing all cards side-by-side at
 * 100vw each. The track is positioned via `transform: translate3d(...)`.
 * Every transition — auto-advance, pagination dot click, drag-snap, wheel-
 * swipe — uses the SAME CSS transition (700ms, custom Apple cubic-bezier).
 * That's what gives the consistent, predictable feel.
 *
 * Three input methods, all converging on the same transition:
 *   1. Pointer drag       → onPointerDown/Move/Up. Card follows finger 1:1
 *                           during drag, snaps to next/prev on release if
 *                           dragged past 18% of viewport.
 *   2. Wheel (trackpad horizontal swipe) → non-passive wheel listener.
 *                           Captures only when deltaX dominates deltaY.
 *                           Single gesture advances one card max.
 *   3. Dot click / autoplay tick / play toggle → just updates `activeIndex`,
 *                           the same transition runs.
 *
 * Lenis is told to skip this section via `data-lenis-prevent` so it doesn't
 * eat the wheel events.
 */

type Highlight = {
  category: string;
  title: string;
  body: string;
  background: string;
  href: string;
  ctaLabel: string;
};

const highlights: Highlight[] = [
  {
    category: "Beats",
    title: "Full instrumentals.",
    body: "Tracked through tube amps and tape. Built for vocalists who want to live inside the song.",
    background:
      "radial-gradient(70% 60% at 30% 30%, rgba(255,90,60,0.5), transparent 65%), linear-gradient(140deg, #160505 0%, #58110d 55%, #cf1d18 100%)",
    href: "/beats",
    ctaLabel: "Browse beats",
  },
  {
    category: "Loops",
    title: "Tagged guitar loops.",
    body: "BPM- and key-tagged guitar and percussion loops. Royalty-free, drop them straight into your DAW.",
    background:
      "radial-gradient(70% 60% at 70% 30%, rgba(95,255,170,0.4), transparent 65%), linear-gradient(140deg, #04140b 0%, #0d3a25 55%, #1d5a3a 100%)",
    href: "/beats",
    ctaLabel: "Browse loops",
  },
  {
    category: "Songs",
    title: "Finished records.",
    body: "Co-produced features with vocalists, available for direct release or sync placement.",
    background:
      "radial-gradient(70% 60% at 50% 30%, rgba(255,126,195,0.45), transparent 65%), linear-gradient(140deg, #170518 0%, #511239 55%, #a01e6b 100%)",
    href: "/beats",
    ctaLabel: "Browse songs",
  },
  {
    category: "Scores",
    title: "Cinematic cues.",
    body: "Slow-build instrumentals for film, TV, trailer, and documentary scoring.",
    background:
      "radial-gradient(70% 60% at 40% 30%, rgba(93,167,214,0.45), transparent 65%), linear-gradient(140deg, #040816 0%, #102245 55%, #1d2c8f 100%)",
    href: "/beats",
    ctaLabel: "Browse scores",
  },
  {
    category: "Kits",
    title: "Sound kits.",
    body: "Curated drum, guitar, and texture bundles. WAV, key- and BPM-tagged, royalty-free.",
    background:
      "radial-gradient(70% 60% at 60% 30%, rgba(255,180,106,0.45), transparent 65%), linear-gradient(140deg, #1a0a04 0%, #6b2a10 55%, #d65a1d 100%)",
    href: "/beats",
    ctaLabel: "Browse kits",
  },
];

const AUTO_ADVANCE_MS = 6000;
const TRANSITION = "transform 700ms cubic-bezier(0.5, 0, 0.1, 1)";
const DRAG_THRESHOLD = 0.18;
// Accumulated wheel deltaX (px) needed to trigger one card advance.
const WHEEL_THRESHOLD = 50;

type DragState = { startX: number; offset: number; pointerId: number };

export function HorizontalShowcase() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const isDragging = drag !== null;

  /* ---- auto-advance ---- */
  useEffect(() => {
    if (!isPlaying || isDragging) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlights.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPlaying, isDragging]);

  /* ---- wheel: trackpad horizontal swipe ---- */
  // React's onWheel registers passive listeners which can't preventDefault.
  // We need a native non-passive listener so the page doesn't scroll
  // sideways/vertically when the gesture is clearly horizontal.
  //
  // Gesture detection via TIME GAPS, not timers. Trackpad inertia fires wheel
  // events continuously for 1+ seconds after the active swipe, with small
  // gaps (16-50ms) between them. A new gesture is identified by a
  // significantly larger gap (>120ms of silence). The `gestureAdvanced` flag
  // is scoped to one gesture and resets the moment a new gesture starts —
  // no setTimeout, nothing to leak, nothing for inertia to extend.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let accum = 0;
    let lastEventTime = 0;
    let gestureAdvanced = false;
    const NEW_GESTURE_GAP_MS = 120;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      const now = performance.now();
      if (now - lastEventTime > NEW_GESTURE_GAP_MS) {
        // It's been quiet for >120ms → this is a new gesture. Reset.
        accum = 0;
        gestureAdvanced = false;
      }
      lastEventTime = now;

      // Already advanced once this gesture — eat the rest of the inertia tail.
      if (gestureAdvanced) return;

      accum += e.deltaX;

      if (accum >= WHEEL_THRESHOLD) {
        setActiveIndex((i) => Math.min(i + 1, highlights.length - 1));
        gestureAdvanced = true;
        accum = 0;
      } else if (accum <= -WHEEL_THRESHOLD) {
        setActiveIndex((i) => Math.max(i - 1, 0));
        gestureAdvanced = true;
        accum = 0;
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  function jumpTo(index: number) {
    setActiveIndex(index);
  }

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  /* ---- pointer drag ---- */

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDrag({ startX: e.clientX, offset: 0, pointerId: e.pointerId });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    setDrag({ ...drag, offset: e.clientX - drag.startX });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const offset = e.clientX - drag.startX;
    const threshold = window.innerWidth * DRAG_THRESHOLD;
    let next = activeIndex;
    if (offset < -threshold && activeIndex < highlights.length - 1) {
      next = activeIndex + 1;
    } else if (offset > threshold && activeIndex > 0) {
      next = activeIndex - 1;
    }
    setActiveIndex(next);
    setDrag(null);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  /* ---- transform composition ---- */

  const trackStyle: React.CSSProperties = {
    transform: `translate3d(calc(${-activeIndex} * 100vw + ${
      drag?.offset ?? 0
    }px), 0, 0)`,
    transition: isDragging ? "none" : TRANSITION,
    willChange: "transform",
    backfaceVisibility: "hidden",
    touchAction: "pan-y",
    userSelect: isDragging ? "none" : undefined,
  };

  return (
    <section className="py-20 md:py-28" aria-label="Catalog highlights">
      <div className="container-x">
        <p
          className="text-[12px] uppercase tracking-[0.25em]"
          style={{ color: "var(--fg-mute)" }}
        >
          The catalog
        </p>
        <h2 className="display mt-3 max-w-3xl text-[clamp(2rem,5vw,3.5rem)]">
          Get the highlights.
        </h2>
      </div>

      {/* Viewport — captures wheel events, hosts the translating track */}
      <div
        ref={viewportRef}
        className="mt-10 overflow-hidden"
        data-lenis-prevent
      >
        <div
          className="flex"
          style={trackStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {highlights.map((h) => (
            <div
              key={h.category}
              className="w-screen shrink-0 px-3 sm:px-5 md:px-6"
            >
              <HighlightCard highlight={h} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls — bottom-center under the carousel, the way Apple does it */}
      <div className="container-x mt-8 flex items-center justify-center gap-4">
        <PaginationDots
          count={highlights.length}
          active={activeIndex}
          onPick={jumpTo}
        />
        <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />
      </div>
    </section>
  );
}

/* ---- card ---- */

function HighlightCard({ highlight }: { highlight: Highlight }) {
  return (
    <Link
      href={highlight.href}
      aria-label={`${highlight.category}: ${highlight.title}`}
      // Tall, near-full-screen ratio. clamp(560px, 82vh, 820px) keeps the
      // card cinematic on desktop without breaking small phones.
      className="group relative flex h-[clamp(560px,82vh,820px)] w-full flex-col justify-between overflow-hidden rounded-[28px] p-8 text-white md:p-14"
      style={{ background: highlight.background }}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.45), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex items-baseline">
        <span className="text-[12px] uppercase tracking-[0.3em] opacity-70">
          {highlight.category}
        </span>
      </div>

      <div className="relative z-10">
        <h3 className="display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05]">
          {highlight.title}
        </h3>
        <p className="mt-5 max-w-xl text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed opacity-85">
          {highlight.body}
        </p>
        <span className="mt-7 inline-flex items-center gap-2 text-[15px] font-medium opacity-90 transition-opacity group-hover:opacity-100">
          {highlight.ctaLabel}
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/* ---- pagination dots ---- */

function PaginationDots({
  count,
  active,
  onPick,
}: {
  count: number;
  active: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            aria-label={`Go to highlight ${i + 1} of ${count}`}
            aria-current={isActive ? "true" : undefined}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: isActive ? "26px" : "6px",
              background: isActive ? "var(--fg)" : "var(--fg-mute)",
              opacity: isActive ? 1 : 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---- play / pause button ---- */

function PlayPauseButton({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? "Pause auto-advance" : "Play auto-advance"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition hover:opacity-80"
      style={{ borderColor: "var(--line)", color: "var(--fg)" }}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
