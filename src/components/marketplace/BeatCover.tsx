"use client";

import type { Beat } from "@/data/beats";

/**
 * BeatCover — renders the cover image if available, else a generated SVG placeholder
 * derived from the slug. Once real cover art is in /public/images/beats/, the placeholder
 * disappears automatically.
 *
 * Marked as a client component because it uses an onError handler to detect missing images.
 */
export function BeatCover({ beat, className }: { beat: Beat; className?: string }) {
  const hue = hashHue(beat.slug);
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beat.coverImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`bg-${beat.slug}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue} 30% 12%)`} />
            <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360} 35% 22%)`} />
          </linearGradient>
          <radialGradient id={`glow-${beat.slug}`} cx="0.7" cy="0.3" r="0.7">
            <stop offset="0%" stopColor={`hsl(${hue} 80% 70% / 0.35)`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill={`url(#bg-${beat.slug})`} />
        <rect width="400" height="400" fill={`url(#glow-${beat.slug})`} />
        <g
          transform="translate(200,210) rotate(-20)"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        >
          <ellipse cx="0" cy="0" rx="80" ry="55" />
          <ellipse cx="0" cy="0" rx="22" ry="22" />
          <rect x="74" y="-6" width="140" height="12" rx="3" />
          <line x1="-50" y1="-4" x2="214" y2="-4" />
          <line x1="-50" y1="0" x2="214" y2="0" />
          <line x1="-50" y1="4" x2="214" y2="4" />
        </g>
        <text
          x="24"
          y="46"
          fill="rgba(255,255,255,0.85)"
          fontFamily="system-ui, sans-serif"
          fontSize="14"
          fontWeight="500"
          letterSpacing="0.08em"
        >
          {beat.genre.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}
