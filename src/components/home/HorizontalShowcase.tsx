"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Highlights — Apple "Get the highlights" carousel.
 *
 * Architecture: native horizontal scroll with CSS `scroll-snap`. Each card is
 * ~85vw (max 1100px) and the viewport has matched padding-inline +
 * scroll-padding-inline so the active card centers and the next card peeks
 * on either side. Auto-advance, dot-jumps, and drag-release snaps share a
 * custom rAF ease-out so transitions feel slower and more graceful than the
 * browser's default smooth scroll. Mouse users can also grab and drag the
 * track; trackpad and touch use native scroll-snap unchanged.
 *
 * Reduced motion: bypass the carousel entirely and render the same cards as
 * a static grid.
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
// Bigger card / smaller side padding so wide monitors don't show a slab of
// empty padding next to the active card. Peek is still ~5vw per side.
const CARD_VW = 0.9;
const CARD_MAX_PX = 1600;
const SCROLL_DURATION_MS = 700;

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function smoothScrollTo(
  viewport: HTMLElement,
  targetLeft: number,
  durationMs = SCROLL_DURATION_MS,
) {
  const startLeft = viewport.scrollLeft;
  const delta = targetLeft - startLeft;
  const startTime = performance.now();
  let cancelled = false;
  // CSS scroll-snap fights JS-driven scrollLeft writes on every frame
  // (the browser tries to snap mid-animation). Disable snap for the
  // duration of the animation; restore on completion or cancel.
  const prevSnap = viewport.style.scrollSnapType;
  viewport.style.scrollSnapType = "none";
  const restore = () => {
    viewport.style.scrollSnapType = prevSnap || "x mandatory";
  };
  const cancel = () => {
    cancelled = true;
    restore();
  };
  function frame(now: number) {
    if (cancelled) return;
    const t = Math.min(1, (now - startTime) / durationMs);
    viewport.scrollLeft = startLeft + delta * easeOutExpo(t);
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      restore();
    }
  }
  requestAnimationFrame(frame);
  return cancel;
}

// Width between snap points = width of one card. Mirrors the CSS
// `w-[85vw] max-w-[1100px]` exactly so JS-driven scrolling lands on the
// same positions the browser's scroll-snap would pick.
function getCardStride() {
  if (typeof window === "undefined") return 0;
  return Math.min(window.innerWidth * CARD_VW, CARD_MAX_PX);
}

export function HorizontalShowcase() {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const cancelScrollRef = useRef<(() => void) | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startScrollLeft: number;
  }>({ active: false, startX: 0, startScrollLeft: 0 });

  /* ---- mirror scroll position into activeIndex ---- */
  useEffect(() => {
    if (reducedMotion) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const stride = getCardStride();
        if (stride === 0) return;
        const idx = Math.round(viewport.scrollLeft / stride);
        const clamped = Math.max(0, Math.min(highlights.length - 1, idx));
        setActiveIndex((prev) => (prev === clamped ? prev : clamped));
      });
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  /* ---- auto-advance ---- */
  useEffect(() => {
    if (reducedMotion || !isPlaying) return;
    const interval = setInterval(() => {
      if (dragRef.current.active) return;
      const viewport = viewportRef.current;
      if (!viewport) return;
      const stride = getCardStride();
      if (stride === 0) return;
      const current = Math.round(viewport.scrollLeft / stride);
      const next = (current + 1) % highlights.length;
      cancelScrollRef.current?.();
      cancelScrollRef.current = smoothScrollTo(viewport, next * stride);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPlaying, reducedMotion]);

  function jumpTo(i: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const stride = getCardStride();
    if (stride === 0) return;
    cancelScrollRef.current?.();
    cancelScrollRef.current = smoothScrollTo(viewport, i * stride);
  }

  /* ---- pointer drag (mouse only — trackpad/touch use native scroll) ---- */
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Cancel any in-flight scroll animation before the user grabs control.
    cancelScrollRef.current?.();
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: viewport.scrollLeft,
    };
    viewport.setPointerCapture(e.pointerId);
    viewport.style.cursor = "grabbing";
    // Turn off snap during drag so the browser doesn't fight imperative
    // scrollLeft writes. Restored on pointer up/cancel.
    viewport.style.scrollSnapType = "none";
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft =
      dragRef.current.startScrollLeft - (e.clientX - dragRef.current.startX);
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current.active = false;
    viewport.style.cursor = "grab";
    viewport.style.scrollSnapType = "x mandatory";
    try {
      viewport.releasePointerCapture(e.pointerId);
    } catch {
      // releasePointerCapture throws if already released
    }
    const stride = getCardStride();
    if (stride === 0) return;
    const idx = Math.max(
      0,
      Math.min(highlights.length - 1, Math.round(viewport.scrollLeft / stride)),
    );
    cancelScrollRef.current?.();
    cancelScrollRef.current = smoothScrollTo(viewport, idx * stride);
  }

  /* ---- reduced-motion fallback ---- */

  if (reducedMotion) {
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
        <div className="container-x mt-10 grid gap-6 md:grid-cols-2">
          {highlights.map((h) => (
            <HighlightCard key={h.category} highlight={h} />
          ))}
        </div>
      </section>
    );
  }

  // Centers the active card in the viewport by padding the scroll container
  // (and scroll-padding) by half the remaining viewport width. Mirrors the
  // CSS card width `w-[85vw] max-w-[1100px]` exactly.
  const inlinePad = `calc((100vw - min(${CARD_VW * 100}vw, ${CARD_MAX_PX}px)) / 2)`;

  return (
    <section
      className="relative py-20 md:py-28"
      aria-label="Catalog highlights"
    >
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

      {/* Wrapper anchors the floating pill to the bottom of the carousel
          itself (not the section), so the pill is always visible the moment
          the cards enter the viewport — no waiting on the section's
          bottom padding. */}
      <div className="relative mt-10">
        {/* Viewport — native horizontal overflow with scroll-snap. Mouse
            users can also grab and drag via the pointer handlers. */}
        <div
          ref={viewportRef}
          className="flex cursor-grab select-none overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            touchAction: "pan-x pinch-zoom",
            overscrollBehaviorX: "contain",
            paddingInline: inlinePad,
            scrollPaddingInline: inlinePad,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          {highlights.map((h) => (
            <div
              key={h.category}
              className="w-[90vw] max-w-[1600px] shrink-0 px-3 sm:px-5 md:px-6"
              style={{
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
              }}
            >
              <HighlightCard highlight={h} />
            </div>
          ))}
        </div>

        {/* Floating pill — dots + play/pause, anchored to the bottom of the
            carousel viewport so it lands over the bottom edge of the active
            card. */}
        <div
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2"
          style={{
            background: "rgba(20, 20, 24, 0.6)",
            backdropFilter: "saturate(160%) blur(6px)",
            WebkitBackdropFilter: "saturate(160%) blur(6px)",
          }}
        >
          <PaginationDots
            count={highlights.length}
            active={activeIndex}
            onPick={jumpTo}
            isPlaying={isPlaying}
          />
          <PlayPauseButton
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying((p) => !p)}
          />
        </div>
      </div>
    </section>
  );
}

/* ---- card ----
   Memoized so the per-frame scroll → activeIndex update doesn't re-render
   all 5 cards (and re-evaluate their gradient styles) on every scroll tick. */

const HighlightCard = memo(function HighlightCard({
  highlight,
}: {
  highlight: Highlight;
}) {
  return (
    <Link
      href={highlight.href}
      aria-label={`${highlight.category}: ${highlight.title}`}
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
});

/* ---- pagination dots ---- */

function PaginationDots({
  count,
  active,
  onPick,
  isPlaying,
}: {
  count: number;
  active: number;
  onPick: (index: number) => void;
  isPlaying: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        if (isActive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(i)}
              aria-label={`Highlight ${i + 1} of ${count}`}
              aria-current="true"
              className="h-2 w-9 overflow-hidden rounded-full bg-white/25"
            >
              <span
                key={`${active}-${isPlaying}`}
                className="block h-full bg-white"
                style={{
                  animation: isPlaying
                    ? `fill ${AUTO_ADVANCE_MS}ms linear forwards`
                    : "none",
                  width: isPlaying ? "0%" : "100%",
                }}
              />
            </button>
          );
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            aria-label={`Go to highlight ${i + 1} of ${count}`}
            className="h-2 w-2 rounded-full bg-white/45 transition hover:bg-white/70"
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
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-80"
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
