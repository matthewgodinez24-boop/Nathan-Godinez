"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Highlights — modeled on Apple's "Get the highlights" carousel
 * (apple.com/macbook-pro). Behavior:
 *
 *   - Header row: title on the left, pagination dots + play/pause on the right.
 *   - Cards in a horizontal scroller with scroll-snap-x.
 *   - Auto-advance toggles via the play button. Default is paused.
 *   - Clicking a dot jumps to that card and pauses auto-advance.
 *   - Manually swiping/scrolling updates the active dot in real time.
 *   - Vertical page scroll passes through normally; this section never
 *     intercepts scroll.
 *
 * No scroll-jacking, no sessionStorage, no Lenis interaction. The carousel
 * is a self-contained component — its only DOM contact is its own scroller
 * div via `scrollerRef`.
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

export function HorizontalShowcase() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Default: paused. User has to click play to enable auto-advance —
  // matches Apple's default and avoids surprising motion on page load.
  const [isPlaying, setIsPlaying] = useState(false);

  // Smooth-scroll the carousel so the card at `index` is centered.
  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = scroller.querySelectorAll<HTMLElement>("[data-card]");
    const card = cards[index];
    if (!card) return;
    // Center the card within the scroller's viewport.
    const target =
      card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2;
    scroller.scrollTo({
      left: Math.max(0, target),
      behavior: "smooth",
    });
  }, []);

  // Auto-advance loop. Inside the interval callback (an async, browser-
  // scheduled task), we call setActiveIndex with a function updater so we
  // always read the latest current value without it being a stale closure.
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlights.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // When the active index changes (auto-advance, dot click, etc.) ensure the
  // scroller is synced. This effect doesn't call setState, only scrollTo —
  // so the lint rule `react-hooks/set-state-in-effect` isn't triggered.
  useEffect(() => {
    scrollToIndex(activeIndex);
  }, [activeIndex, scrollToIndex]);

  // Track the user's manual scroll so the active dot follows their finger.
  // The setState inside this RAF-scheduled callback runs in an async task,
  // not in an effect body — it's a normal event-handler-style update.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let rafId = 0;
    const updateActive = () => {
      const cards = scroller.querySelectorAll<HTMLElement>("[data-card]");
      if (cards.length === 0) return;

      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });
      setActiveIndex((current) =>
        current === closestIdx ? current : closestIdx,
      );
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActive);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  function jumpTo(index: number) {
    setIsPlaying(false);
    setActiveIndex(index);
  }

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
            <PlayPauseButton
              isPlaying={isPlaying}
              onToggle={() => setIsPlaying((p) => !p)}
            />
          </div>
        </div>
      </div>

      {/* Horizontal scroller */}
      <div
        ref={scrollerRef}
        className="mt-10 overflow-x-auto pb-6"
        style={{ scrollbarWidth: "none" }}
      >
        <ul
          className="flex snap-x snap-mandatory gap-5 px-[max(1.25rem,calc((100vw-1280px)/2+1.25rem))]"
        >
          {highlights.map((h) => (
            <li key={h.category} className="snap-center">
              <HighlightCard highlight={h} />
            </li>
          ))}
        </ul>
      </div>

      {/* Hide the horizontal scrollbar in webkit browsers, scoped to this section */}
      <style>{`
        section[aria-label="Catalog highlights"] .overflow-x-auto::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

/* ---- card ---- */

function HighlightCard({ highlight }: { highlight: Highlight }) {
  return (
    <Link
      href={highlight.href}
      data-card
      aria-label={`${highlight.category}: ${highlight.title}`}
      className="group relative flex h-[clamp(420px,58vh,540px)] w-[clamp(280px,80vw,720px)] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] p-8 text-white md:p-12"
      style={{ background: highlight.background }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.45), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex items-baseline justify-between">
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
