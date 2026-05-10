"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Highlights — Apple-style full-bleed carousel.
 *
 * Architecture: a single `track` <div> containing all cards side-by-side at
 * 100vw each. The track is positioned via `transform: translate3d(...)` and
 * driven by a `--active` CSS variable. Every transition — auto-advance,
 * pagination dot click, and the snap after a drag — uses the SAME CSS
 * transition (700ms, custom Apple-flavored cubic-bezier). That's what gives
 * the consistent, predictable feel the previous native-scroll version
 * couldn't deliver.
 *
 * Why not native scroll-snap:
 *   - `scrollTo({ behavior: "smooth" })` has implementation-defined timing
 *     (different on Chrome vs. Safari vs. mobile). Inconsistent feel.
 *   - `snap-mandatory` competes with smooth scroll mid-flight, producing the
 *     "chunky" jitter that prompted this rewrite.
 *   - Lenis was eating wheel events globally — even `data-lenis-prevent`
 *     wasn't enough because trackpad horizontal-swipe goes through wheel.
 *
 * What this gives us instead:
 *   - GPU-composited transform on the track; one transition per slide change.
 *   - Identical timing for autoplay, dot click, and drag-snap. Every advance
 *     "feels the same."
 *   - Drag/swipe support via pointer events with elastic-free snap on release.
 *   - Vertical page scroll passes through naturally — `touch-action: pan-y`
 *     on the track lets the OS handle vertical gestures.
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
// Apple-flavored easing — slower start, quick middle, gentle settle.
const TRANSITION = "transform 700ms cubic-bezier(0.5, 0, 0.1, 1)";
// How far the user has to drag (as a fraction of viewport width) for the
// release to advance to the next/prev card. Below this threshold, snap back.
const DRAG_THRESHOLD = 0.18;

type DragState = { startX: number; offset: number; pointerId: number };

export function HorizontalShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const isDragging = drag !== null;

  /**
   * Auto-advance loop. Pauses while the user is mid-drag (otherwise the
   * track would jump under their finger). Stays running across releases —
   * if the user drags to slide 2, the next tick advances to 3 from there.
   */
  useEffect(() => {
    if (!isPlaying || isDragging) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlights.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPlaying, isDragging]);

  function jumpTo(index: number) {
    setActiveIndex(index);
  }

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  /* ---- pointer-driven drag-to-swipe ---- */

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only respond to primary mouse button or touch/pen.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDrag({ startX: e.clientX, offset: 0, pointerId: e.pointerId });
    // Capture so subsequent move/up events come to this element even if the
    // pointer leaves it. Critical for fast flicks.
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

  // Base offset: -activeIndex * 100vw (each card is one viewport wide).
  // Drag offset (px): added to the base so the track follows the finger.
  // No transition during drag → finger-tight tracking. Transition snaps in
  // on release / state change.
  const trackStyle: React.CSSProperties = {
    transform: `translate3d(calc(${-activeIndex} * 100vw + ${
      drag?.offset ?? 0
    }px), 0, 0)`,
    transition: isDragging ? "none" : TRANSITION,
    willChange: "transform",
    backfaceVisibility: "hidden",
    // Allow vertical page scroll to pass through; capture horizontal gestures
    // for our pointer handler.
    touchAction: "pan-y",
    userSelect: isDragging ? "none" : undefined,
  };

  return (
    <section className="py-24 md:py-32" aria-label="Catalog highlights">
      <div className="container-x">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
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

          <div className="flex items-center gap-4">
            <PaginationDots
              count={highlights.length}
              active={activeIndex}
              onPick={jumpTo}
            />
            <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />
          </div>
        </div>
      </div>

      {/* Viewport — one card visible at a time */}
      <div
        className="mt-10 overflow-hidden"
        // data-lenis-prevent here too as a defensive measure; the transform
        // approach doesn't depend on native scroll, but if a future change
        // ever introduces an inner scroller, this keeps Lenis off it.
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
              className="w-screen shrink-0 px-4 sm:px-8 md:px-12"
              // The wrapper provides side padding so the card isn't flush to
              // the viewport edge. The card itself fills the remaining space.
            >
              <HighlightCard highlight={h} />
            </div>
          ))}
        </div>
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
      // Card fills the viewport-padded slot. Tall enough to feel cinematic
      // without forcing the user to scroll past a wall.
      className="group relative flex h-[clamp(440px,60vh,560px)] w-full flex-col justify-between overflow-hidden rounded-[28px] p-8 text-white md:p-12"
      style={{ background: highlight.background }}
      // The card is a Link — it shouldn't fight the parent's pointer-drag.
      // `draggable={false}` prevents the browser's native image-drag from
      // initiating during a swipe.
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
        <h3 className="display text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
          {highlight.title}
        </h3>
        <p className="mt-4 max-w-md text-[clamp(0.95rem,1.2vw,1.05rem)] leading-relaxed opacity-85">
          {highlight.body}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium opacity-90 transition-opacity group-hover:opacity-100">
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
              width: isActive ? "24px" : "6px",
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
