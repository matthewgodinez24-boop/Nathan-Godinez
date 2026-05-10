"use client";

import Link from "next/link";

/**
 * Highlights — a normal horizontal-scroll section.
 *
 * Pattern: Apple's "Get the highlights" carousel on the MacBook Pro page.
 * One card per product category. The user scrolls horizontally with their
 * trackpad / shift+wheel / drag, and the cards snap into place. Vertical
 * scroll passes through the page normally — there is no scroll-jacking,
 * no force-once logic, no sessionStorage, no Lenis interaction.
 *
 * If a category is added or removed, edit the `highlights` array below.
 */

type Highlight = {
  number: string;
  category: string;
  title: string;
  body: string;
  background: string;
  // Where this card's CTA sends the user. /beats is the catalog with the
  // appropriate type filter; the marketplace handles empty states honestly
  // (e.g. "No loops yet").
  href: string;
  ctaLabel: string;
};

const highlights: Highlight[] = [
  {
    number: "01",
    category: "Beats",
    title: "Full instrumentals.",
    body: "Tracked through tube amps and tape. Built for vocalists who want to live inside the song.",
    background:
      "radial-gradient(70% 60% at 30% 30%, rgba(255,90,60,0.45), transparent 65%), linear-gradient(140deg, #160505 0%, #58110d 55%, #cf1d18 100%)",
    href: "/beats",
    ctaLabel: "Browse beats",
  },
  {
    number: "02",
    category: "Loops",
    title: "Tagged guitar loops.",
    body: "BPM- and key-tagged guitar and percussion loops. Royalty-free, drop them straight into your DAW.",
    background:
      "radial-gradient(70% 60% at 70% 30%, rgba(95,255,170,0.35), transparent 65%), linear-gradient(140deg, #04140b 0%, #0d3a25 55%, #1d5a3a 100%)",
    href: "/beats",
    ctaLabel: "Browse loops",
  },
  {
    number: "03",
    category: "Songs",
    title: "Finished records.",
    body: "Co-produced features with vocalists, available for direct release or sync placement.",
    background:
      "radial-gradient(70% 60% at 50% 30%, rgba(255,126,195,0.4), transparent 65%), linear-gradient(140deg, #170518 0%, #511239 55%, #a01e6b 100%)",
    href: "/beats",
    ctaLabel: "Browse songs",
  },
  {
    number: "04",
    category: "Scores",
    title: "Cinematic cues.",
    body: "Slow-build instrumentals for film, TV, trailer, and documentary scoring.",
    background:
      "radial-gradient(70% 60% at 40% 30%, rgba(93,167,214,0.42), transparent 65%), linear-gradient(140deg, #040816 0%, #102245 55%, #1d2c8f 100%)",
    href: "/beats",
    ctaLabel: "Browse scores",
  },
  {
    number: "05",
    category: "Kits",
    title: "Sound kits.",
    body: "Curated drum, guitar, and texture bundles. WAV, key- and BPM-tagged, royalty-free.",
    background:
      "radial-gradient(70% 60% at 60% 30%, rgba(255,180,106,0.42), transparent 65%), linear-gradient(140deg, #1a0a04 0%, #6b2a10 55%, #d65a1d 100%)",
    href: "/beats",
    ctaLabel: "Browse kits",
  },
];

export function HorizontalShowcase() {
  return (
    <section
      className="py-24 md:py-32"
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
        <p
          className="mt-3 max-w-xl text-[clamp(1rem,1.3vw,1.15rem)]"
          style={{ color: "var(--fg-soft)" }}
        >
          Five things Nathan makes. Swipe through to see the catalog.
        </p>
      </div>

      {/* The scroller. overflow-x-auto + snap-x. No vertical scroll-jacking. */}
      <div
        className="mt-10 overflow-x-auto pb-6"
        style={{ scrollbarWidth: "none" }}
      >
        <ul
          className="flex snap-x snap-mandatory gap-6 px-[max(1.25rem,calc((100vw-1280px)/2+1.25rem))]"
          // The snap-padding ensures the first card aligns with the rest of
          // the page's horizontal padding instead of hugging the viewport edge.
          style={{ scrollPaddingLeft: "1.25rem" }}
        >
          {highlights.map((h) => (
            <HighlightCard key={h.category} highlight={h} />
          ))}
        </ul>
      </div>

      {/* Hide the horizontal scrollbar in webkit browsers. Scoped via the
          aria-label so it can't bleed into other sections. */}
      <style>{`
        section[aria-label="Catalog highlights"] .overflow-x-auto::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
  return (
    <li className="snap-start">
      <Link
        href={highlight.href}
        aria-label={`${highlight.category}: ${highlight.title}`}
        className="group relative flex h-[clamp(360px,52vh,520px)] w-[clamp(280px,80vw,520px)] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] p-8 text-white transition-transform duration-500 ease-out md:p-10"
        style={{ background: highlight.background }}
      >
        {/* Soft top-left vignette for depth. Pure CSS, no JS. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.45), transparent 60%)",
          }}
        />

        {/* Header: number + category */}
        <div className="relative z-10 flex items-baseline justify-between">
          <span className="text-[12px] uppercase tracking-[0.3em] opacity-70">
            {highlight.number}
          </span>
          <span className="text-[12px] uppercase tracking-[0.3em] opacity-70">
            {highlight.category}
          </span>
        </div>

        {/* Body — sits at the bottom of the card */}
        <div className="relative z-10">
          <h3 className="display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1]">
            {highlight.title}
          </h3>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed opacity-85">
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
    </li>
  );
}
