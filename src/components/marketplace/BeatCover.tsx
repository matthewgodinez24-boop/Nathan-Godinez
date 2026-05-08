"use client";

import type { Beat } from "@/data/beats";

/**
 * BeatCover — album-art-style silhouette renderer.
 *
 * If real cover art exists at /public/images/beats/<slug>.jpg, the image loads
 * over this canvas. If it 404s, the silhouette stays — high-contrast, saturated
 * background + dark blurred subject + serif title (Korven-inspired aesthetic).
 *
 * Each beat gets a deterministic palette + silhouette pair from its slug.
 */
export function BeatCover({ beat, className }: { beat: Beat; className?: string }) {
  const seed = hashCode(beat.slug);
  const palette = PALETTES[seed % PALETTES.length];
  const silhouette = SILHOUETTES[(seed >> 3) % SILHOUETTES.length];
  const id = `cover-${beat.slug}`;

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
          {/* Background — solid + subtle radial vignette + film grain */}
          <radialGradient id={`${id}-glow`} cx="0.5" cy="0.45" r="0.7">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.55" />
            <stop offset="60%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.85">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
          </radialGradient>
          <pattern
            id={`${id}-grain`}
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <rect width="3" height="3" fill="rgba(255,255,255,0.018)" />
            <rect width="1" height="3" fill="rgba(0,0,0,0.06)" />
          </pattern>
          {/* Soft blur for the subject — gives the photographic feel */}
          <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          {/* Halo behind the subject */}
          <filter id={`${id}-halo`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Saturated base */}
        <rect width="400" height="400" fill={palette.base} />
        <rect width="400" height="400" fill={`url(#${id}-glow)`} />
        <rect width="400" height="400" fill={`url(#${id}-vignette)`} />

        {/* Subject halo — soft glow behind silhouette */}
        <g filter={`url(#${id}-halo)`} opacity="0.55">
          <Silhouette type={silhouette} fill={palette.shadow} />
        </g>

        {/* Subject — slightly blurred dark silhouette */}
        <g filter={`url(#${id}-blur)`}>
          <Silhouette type={silhouette} fill={palette.subject} />
        </g>

        {/* Subtle grain over everything */}
        <rect width="400" height="400" fill={`url(#${id}-grain)`} opacity="0.7" />

        {/* Title — serif, letter-spaced, like an album mark */}
        <text
          x="200"
          y="92"
          fill={palette.ink}
          fontFamily="'Times New Roman', 'Cormorant Garamond', Georgia, serif"
          fontSize="22"
          letterSpacing="6"
          fontWeight="500"
          textAnchor="middle"
          opacity="0.9"
        >
          {beat.title.toUpperCase()}
        </text>

        {/* Tiny mark below — anchors the composition */}
        <g transform="translate(200, 360)" opacity="0.55">
          <circle r="2.2" fill={palette.ink} />
        </g>
      </svg>
    </div>
  );
}

/* ---- Silhouettes ---- */

type SilhouetteType = "butterfly" | "moth" | "rose" | "bird" | "hand" | "flame";

const SILHOUETTES: SilhouetteType[] = [
  "butterfly",
  "moth",
  "rose",
  "bird",
  "hand",
  "flame",
];

function Silhouette({ type, fill }: { type: SilhouetteType; fill: string }) {
  switch (type) {
    case "butterfly":
      return <ButterflySilhouette fill={fill} />;
    case "moth":
      return <MothSilhouette fill={fill} />;
    case "rose":
      return <RoseSilhouette fill={fill} />;
    case "bird":
      return <BirdSilhouette fill={fill} />;
    case "hand":
      return <HandSilhouette fill={fill} />;
    case "flame":
      return <FlameSilhouette fill={fill} />;
  }
}

function ButterflySilhouette({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      {/* Body */}
      <ellipse cx="0" cy="0" rx="3" ry="58" />
      {/* Antennae */}
      <path
        d="M -2 -54 C -10 -68, -20 -76, -30 -78 M 2 -54 C 10 -68, 20 -76, 30 -78"
        stroke={fill}
        strokeWidth="1.8"
        fill="none"
      />
      {/* Left upper wing */}
      <path d="M -3 -28 C -60 -90, -130 -78, -150 -30 C -132 -8, -90 0, -60 -8 C -30 -16, -10 -22, -3 -22 Z" />
      {/* Right upper wing */}
      <path d="M 3 -28 C 60 -90, 130 -78, 150 -30 C 132 -8, 90 0, 60 -8 C 30 -16, 10 -22, 3 -22 Z" />
      {/* Left lower wing */}
      <path d="M -3 0 C -50 18, -110 38, -120 78 C -90 80, -50 70, -25 50 C -10 38, -5 20, -3 8 Z" />
      {/* Right lower wing */}
      <path d="M 3 0 C 50 18, 110 38, 120 78 C 90 80, 50 70, 25 50 C 10 38, 5 20, 3 8 Z" />
    </g>
  );
}

function MothSilhouette({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      <ellipse cx="0" cy="0" rx="3.5" ry="50" />
      <path
        d="M -2 -50 C -8 -64, -16 -68, -24 -70 M 2 -50 C 8 -64, 16 -68, 24 -70"
        stroke={fill}
        strokeWidth="1.8"
        fill="none"
      />
      {/* Wings — broader and flatter than butterfly */}
      <path d="M -3 -20 C -90 -50, -140 -10, -130 30 C -100 40, -50 30, -20 10 C -10 0, -5 -10, -3 -16 Z" />
      <path d="M 3 -20 C 90 -50, 140 -10, 130 30 C 100 40, 50 30, 20 10 C 10 0, 5 -10, 3 -16 Z" />
      <path d="M -3 5 C -50 25, -90 45, -85 65 C -60 65, -25 50, -10 30 C -5 20, -3 12, -3 8 Z" />
      <path d="M 3 5 C 50 25, 90 45, 85 65 C 60 65, 25 50, 10 30 C 5 20, 3 12, 3 8 Z" />
    </g>
  );
}

function RoseSilhouette({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      {/* Stem */}
      <rect x="-2" y="40" width="4" height="120" />
      {/* Leaves */}
      <path d="M 0 110 C -32 100, -42 86, -36 72 C -22 78, -8 92, 0 110 Z" />
      <path d="M 0 80 C 28 70, 38 56, 32 42 C 18 48, 6 62, 0 80 Z" />
      {/* Bloom — concentric petals */}
      <path d="M 0 -10 C -55 -10, -80 30, -60 60 C -40 75, -20 70, 0 60 C 20 70, 40 75, 60 60 C 80 30, 55 -10, 0 -10 Z" />
      <path
        d="M 0 5 C -38 5, -55 30, -42 50 C -28 60, -14 56, 0 48 C 14 56, 28 60, 42 50 C 55 30, 38 5, 0 5 Z"
        opacity="0.85"
      />
      <path
        d="M 0 18 C -22 18, -32 36, -24 48 C -14 54, -6 52, 0 46 C 6 52, 14 54, 24 48 C 32 36, 22 18, 0 18 Z"
        opacity="0.7"
      />
    </g>
  );
}

function BirdSilhouette({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 210)" fill={fill}>
      {/* Body */}
      <path d="M -10 0 C -10 -12, 10 -12, 10 0 C 10 14, 4 24, 0 26 C -4 24, -10 14, -10 0 Z" />
      {/* Head */}
      <circle cx="0" cy="-16" r="9" />
      {/* Beak */}
      <path d="M 8 -16 L 22 -14 L 8 -10 Z" />
      {/* Spread wings */}
      <path d="M -8 -4 C -50 -30, -110 -28, -150 -2 C -120 2, -80 4, -50 6 C -30 6, -16 4, -8 4 Z" />
      <path d="M 8 -4 C 50 -30, 110 -28, 150 -2 C 120 2, 80 4, 50 6 C 30 6, 16 4, 8 4 Z" />
      {/* Tail */}
      <path d="M -6 24 L 0 60 L 6 24 Z" />
    </g>
  );
}

function HandSilhouette({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 240)" fill={fill}>
      {/* Palm */}
      <path d="M -38 0 C -42 -30, -36 -50, -22 -54 C -8 -56, 8 -56, 22 -54 C 36 -50, 42 -30, 38 0 C 38 30, 28 60, 0 70 C -28 60, -38 30, -38 0 Z" />
      {/* Thumb */}
      <path d="M -38 -10 C -54 -20, -64 -42, -54 -58 C -44 -68, -34 -58, -32 -42 C -32 -28, -36 -16, -38 -10 Z" />
      {/* Four fingers — pointing up */}
      <rect x="-22" y="-92" width="9" height="42" rx="4" />
      <rect x="-9" y="-100" width="9" height="50" rx="4" />
      <rect x="4" y="-100" width="9" height="50" rx="4" />
      <rect x="17" y="-92" width="9" height="42" rx="4" />
    </g>
  );
}

function FlameSilhouette({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 230)" fill={fill}>
      {/* Outer flame */}
      <path d="M 0 -100 C -10 -70, -50 -30, -50 10 C -50 60, -20 90, 0 90 C 20 90, 50 60, 50 10 C 50 -30, 30 -50, 20 -70 C 14 -84, 8 -90, 0 -100 Z" />
      {/* Inner flame */}
      <path
        d="M 0 -50 C -8 -30, -22 -10, -22 14 C -22 44, -8 60, 0 60 C 8 60, 22 44, 22 14 C 22 -10, 12 -20, 8 -32 C 4 -42, 4 -46, 0 -50 Z"
        opacity="0.6"
      />
    </g>
  );
}

/* ---- Palettes — saturated, album-art ---- */

type Palette = {
  base: string; // primary background
  glow: string; // radial highlight color
  subject: string; // silhouette fill
  shadow: string; // halo behind silhouette
  ink: string; // title color
};

const PALETTES: Palette[] = [
  // Burning red — the Korven reference
  {
    base: "#cf1d18",
    glow: "#ff5a3c",
    subject: "#1a0606",
    shadow: "#000000",
    ink: "#f6d8c4",
  },
  // Cobalt
  {
    base: "#1d2c8f",
    glow: "#5da7ff",
    subject: "#040816",
    shadow: "#000000",
    ink: "#cfd9ff",
  },
  // Sunset orange
  {
    base: "#d65a1d",
    glow: "#ffb46a",
    subject: "#1a0a04",
    shadow: "#000000",
    ink: "#ffe6c8",
  },
  // Deep magenta
  {
    base: "#a01e6b",
    glow: "#ff7ec3",
    subject: "#170518",
    shadow: "#000000",
    ink: "#ffd6ec",
  },
  // Forest
  {
    base: "#1d5a3a",
    glow: "#5fd47a",
    subject: "#04140b",
    shadow: "#000000",
    ink: "#d6f5dd",
  },
  // Bone
  {
    base: "#e8dfca",
    glow: "#ffffff",
    subject: "#0a0a0a",
    shadow: "#1a1a1a",
    ink: "#2a1c0e",
  },
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}
