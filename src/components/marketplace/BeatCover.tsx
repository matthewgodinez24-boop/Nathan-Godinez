"use client";

import type { Beat } from "@/data/beats";

/**
 * BeatCover — album-art-style placeholder.
 *
 * Real cover art at /public/images/beats/<slug>.jpg overrides the placeholder.
 * Each beat is hand-assigned a (silhouette + palette) pairing so the covers
 * feel art-directed instead of randomized. Only one beat (atlas-room) carries
 * the butterfly motif — the rest pull from a wider visual library.
 */

export function BeatCover({ beat, className }: { beat: Beat; className?: string }) {
  const art = COVER_ART[beat.slug] ?? FALLBACK_ART;
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
          <radialGradient id={`${id}-glow`} cx={art.glowCx} cy={art.glowCy} r="0.7">
            <stop offset="0%" stopColor={art.palette.glow} stopOpacity="0.55" />
            <stop offset="60%" stopColor={art.palette.glow} stopOpacity="0" />
          </radialGradient>
          {art.palette.baseGradient && (
            <linearGradient id={`${id}-base-grad`} x1="0" x2="0" y1="0" y2="1">
              {art.palette.baseGradient.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          )}
          <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.85">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
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
          <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={art.subjectBlur ?? 2.2} />
          </filter>
          <filter id={`${id}-halo`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Saturated base — solid, gradient, or split (top + accent bottom) */}
        <rect
          width="400"
          height="400"
          fill={art.palette.baseGradient ? `url(#${id}-base-grad)` : art.palette.base}
        />
        {art.palette.accent && (
          <rect width="400" height="200" y="200" fill={art.palette.accent} />
        )}
        <rect width="400" height="400" fill={`url(#${id}-glow)`} />
        <rect width="400" height="400" fill={`url(#${id}-vignette)`} />

        {/* Subject halo */}
        <g filter={`url(#${id}-halo)`} opacity="0.55">
          <Silhouette type={art.silhouette} fill={art.palette.shadow} />
        </g>
        {/* Subject — slightly blurred dark silhouette */}
        <g filter={`url(#${id}-blur)`}>
          <Silhouette type={art.silhouette} fill={art.palette.subject} />
        </g>

        {/* Grain over everything */}
        <rect width="400" height="400" fill={`url(#${id}-grain)`} opacity="0.7" />

        {/* Optional corner mark — small ornamental dot pattern */}
        {art.cornerMark && (
          <g opacity="0.5">
            <circle cx="22" cy="22" r="2" fill={art.palette.ink} />
            <circle cx="378" cy="22" r="2" fill={art.palette.ink} />
            <circle cx="22" cy="378" r="2" fill={art.palette.ink} />
            <circle cx="378" cy="378" r="2" fill={art.palette.ink} />
          </g>
        )}

        {/* Title — serif, letter-spaced, like an album mark */}
        <text
          x="200"
          y={art.titleY ?? 92}
          fill={art.palette.ink}
          fontFamily="'Times New Roman', 'Cormorant Garamond', Georgia, serif"
          fontSize="22"
          letterSpacing="6"
          fontWeight="500"
          textAnchor="middle"
          opacity="0.92"
        >
          {beat.title.toUpperCase()}
        </text>

        {/* Center anchor */}
        <g transform="translate(200, 360)" opacity="0.55">
          <circle r="2.2" fill={art.palette.ink} />
        </g>
      </svg>
    </div>
  );
}

/* ---------------- Cover art directory ---------------- */

type SilhouetteType =
  | "butterfly"
  | "moth"
  | "rose"
  | "bird"
  | "hand"
  | "flame"
  | "smoke"
  | "vinyl"
  | "mountain"
  | "tree"
  | "skull"
  | "eye"
  | "wave"
  | "lightning"
  | "leaf"
  | "palm"
  | "roycehall";

type Palette = {
  base: string;
  glow: string;
  subject: string;
  shadow: string;
  ink: string;
  /**
   * Optional second color painted as the bottom half of the cover, creating a
   * horizontal split (e.g. UCLA blue/gold). Leave undefined for solid covers.
   */
  accent?: string;
  /** Optional gradient stops for the base — used for "tropical" multi-stop fills. */
  baseGradient?: ReadonlyArray<{ readonly offset: string; readonly color: string }>;
};

type CoverArt = {
  silhouette: SilhouetteType;
  palette: Palette;
  glowCx?: string;
  glowCy?: string;
  titleY?: number;
  cornerMark?: boolean;
  subjectBlur?: number;
};

// Curated palettes — saturated, album-art quality
const PALETTE = {
  burningRed: {
    base: "#cf1d18",
    glow: "#ff5a3c",
    subject: "#160505",
    shadow: "#000000",
    ink: "#f6d8c4",
  },
  cobalt: {
    base: "#1d2c8f",
    glow: "#5da7ff",
    subject: "#040816",
    shadow: "#000000",
    ink: "#cfd9ff",
  },
  ember: {
    base: "#d65a1d",
    glow: "#ffb46a",
    subject: "#1a0a04",
    shadow: "#000000",
    ink: "#ffe6c8",
  },
  magenta: {
    base: "#a01e6b",
    glow: "#ff7ec3",
    subject: "#170518",
    shadow: "#000000",
    ink: "#ffd6ec",
  },
  forest: {
    base: "#1d5a3a",
    glow: "#5fd47a",
    subject: "#04140b",
    shadow: "#000000",
    ink: "#d6f5dd",
  },
  bone: {
    base: "#e8dfca",
    glow: "#ffffff",
    subject: "#0a0a0a",
    shadow: "#1a1a1a",
    ink: "#2a1c0e",
  },
  midnight: {
    base: "#0d111c",
    glow: "#3a5ad6",
    subject: "#000000",
    shadow: "#000000",
    ink: "#cfd9ff",
  },
  sage: {
    base: "#3a4a3a",
    glow: "#9ec79e",
    subject: "#0a120a",
    shadow: "#000000",
    ink: "#d8e3d0",
  },
  oxblood: {
    base: "#5a1a1f",
    glow: "#ff7a6b",
    subject: "#0a0405",
    shadow: "#000000",
    ink: "#f0c8c4",
  },
  parchment: {
    base: "#d8c8a4",
    glow: "#fff5d8",
    subject: "#1a1208",
    shadow: "#2a1c0e",
    ink: "#3a2c14",
  },
  amethyst: {
    base: "#3a1d6b",
    glow: "#a878ff",
    subject: "#0a0418",
    shadow: "#000000",
    ink: "#dccaff",
  },
  rust: {
    base: "#7a3a18",
    glow: "#e08a5a",
    subject: "#180804",
    shadow: "#000000",
    ink: "#f0d6c0",
  },
  smoke: {
    base: "#2a2a2e",
    glow: "#7a7a82",
    subject: "#08080a",
    shadow: "#000000",
    ink: "#dcdce0",
  },
  // Tropical green — vertical gradient (deep teal → emerald → bright lime).
  tropical: {
    base: "#0a3a2a", // fallback if gradient not used
    glow: "#5fffaa",
    subject: "#000000", // solid black silhouette per client
    shadow: "#000000",
    ink: "#e6fff0",
    baseGradient: [
      { offset: "0%", color: "#0d4a3a" },
      { offset: "55%", color: "#1f7a52" },
      { offset: "100%", color: "#3eba7a" },
    ],
  },
  // UCLA — top half UCLA blue, bottom half UCLA gold (split via accent field).
  ucla: {
    base: "#2774ae", // UCLA blue (top half)
    glow: "#5da7d6",
    subject: "#000000", // solid black Royce silhouette
    shadow: "#000000",
    ink: "#fff8d8",
    accent: "#ffd100", // UCLA gold (bottom half)
  },
} as const;

// Manual assignments — each beat curated rather than hash-randomized.
// Only ONE beat carries the butterfly. Edit this map to re-art-direct any beat.
const COVER_ART: Record<string, CoverArt> = {
  // The lone butterfly — the Korven-style hero of the catalog
  "atlas-room": {
    silhouette: "butterfly",
    palette: PALETTE.burningRed,
    cornerMark: true,
  },

  // Beats
  "north-room": {
    silhouette: "flame",
    palette: PALETTE.oxblood,
    glowCy: "0.65",
  },
  "evening-stretch": {
    silhouette: "rose",
    palette: PALETTE.parchment,
    cornerMark: true,
  },
  lockstep: {
    silhouette: "lightning",
    palette: PALETTE.midnight,
    titleY: 72,
  },
  skyway: {
    silhouette: "bird",
    palette: PALETTE.cobalt,
    glowCx: "0.5",
    glowCy: "0.3",
  },
  "garden-tape": {
    silhouette: "leaf",
    palette: PALETTE.sage,
    cornerMark: true,
  },
  "hallway-light": {
    silhouette: "hand",
    palette: PALETTE.amethyst,
  },
  "border-town": {
    silhouette: "tree",
    palette: PALETTE.rust,
    glowCy: "0.7",
  },

  // Loops
  "warm-room-loop-pack": {
    silhouette: "vinyl",
    palette: PALETTE.ember,
  },
  "drill-cuts-loop-pack": {
    silhouette: "lightning",
    palette: PALETTE.smoke,
  },

  // Songs
  "long-hallways": {
    silhouette: "smoke",
    palette: PALETTE.magenta,
    subjectBlur: 4,
  },

  // Scores
  "first-light-cue": {
    silhouette: "mountain",
    palette: PALETTE.bone,
    cornerMark: true,
  },
  "open-water-cue": {
    silhouette: "wave",
    palette: PALETTE.midnight,
  },

  // Kits
  "studio-kit-vol-1": {
    silhouette: "vinyl",
    palette: PALETTE.forest,
  },
  "studio-kit-vol-2": {
    silhouette: "eye",
    palette: PALETTE.smoke,
  },

  // Real uploads from Nathan's Drive — client-directed art:
  // Leaf — solid black leaf silhouette on a purple gradient
  leaf: {
    silhouette: "leaf",
    palette: PALETTE.amethyst,
    cornerMark: true,
  },
  // Vigo — solid black palm tree silhouette on a tropical green gradient
  vigo: {
    silhouette: "palm",
    palette: PALETTE.tropical,
    glowCy: "0.3",
    cornerMark: true,
  },
  // Ivy League — Royce Hall silhouette on UCLA blue (top) + gold (bottom) split
  "ivy-league": {
    silhouette: "roycehall",
    palette: PALETTE.ucla,
    cornerMark: true,
  },
};

const FALLBACK_ART: CoverArt = {
  silhouette: "moth",
  palette: PALETTE.smoke,
};

/* ---------------- Silhouette library ---------------- */

function Silhouette({ type, fill }: { type: SilhouetteType; fill: string }) {
  switch (type) {
    case "butterfly":
      return <ButterflySil fill={fill} />;
    case "moth":
      return <MothSil fill={fill} />;
    case "rose":
      return <RoseSil fill={fill} />;
    case "bird":
      return <BirdSil fill={fill} />;
    case "hand":
      return <HandSil fill={fill} />;
    case "flame":
      return <FlameSil fill={fill} />;
    case "smoke":
      return <SmokeSil fill={fill} />;
    case "vinyl":
      return <VinylSil fill={fill} />;
    case "mountain":
      return <MountainSil fill={fill} />;
    case "tree":
      return <TreeSil fill={fill} />;
    case "skull":
      return <SkullSil fill={fill} />;
    case "eye":
      return <EyeSil fill={fill} />;
    case "wave":
      return <WaveSil fill={fill} />;
    case "lightning":
      return <LightningSil fill={fill} />;
    case "leaf":
      return <LeafSil fill={fill} />;
    case "palm":
      return <PalmSil fill={fill} />;
    case "roycehall":
      return <RoyceHallSil fill={fill} />;
  }
}

function ButterflySil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      <ellipse cx="0" cy="0" rx="3" ry="58" />
      <path
        d="M -2 -54 C -10 -68, -20 -76, -30 -78 M 2 -54 C 10 -68, 20 -76, 30 -78"
        stroke={fill}
        strokeWidth="1.8"
        fill="none"
      />
      <path d="M -3 -28 C -60 -90, -130 -78, -150 -30 C -132 -8, -90 0, -60 -8 C -30 -16, -10 -22, -3 -22 Z" />
      <path d="M 3 -28 C 60 -90, 130 -78, 150 -30 C 132 -8, 90 0, 60 -8 C 30 -16, 10 -22, 3 -22 Z" />
      <path d="M -3 0 C -50 18, -110 38, -120 78 C -90 80, -50 70, -25 50 C -10 38, -5 20, -3 8 Z" />
      <path d="M 3 0 C 50 18, 110 38, 120 78 C 90 80, 50 70, 25 50 C 10 38, 5 20, 3 8 Z" />
    </g>
  );
}

function MothSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      <ellipse cx="0" cy="0" rx="3.5" ry="50" />
      <path d="M -3 -20 C -90 -50, -140 -10, -130 30 C -100 40, -50 30, -20 10 C -10 0, -5 -10, -3 -16 Z" />
      <path d="M 3 -20 C 90 -50, 140 -10, 130 30 C 100 40, 50 30, 20 10 C 10 0, 5 -10, 3 -16 Z" />
      <path d="M -3 5 C -50 25, -90 45, -85 65 C -60 65, -25 50, -10 30 C -5 20, -3 12, -3 8 Z" />
      <path d="M 3 5 C 50 25, 90 45, 85 65 C 60 65, 25 50, 10 30 C 5 20, 3 12, 3 8 Z" />
    </g>
  );
}

function RoseSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      <rect x="-2" y="40" width="4" height="120" />
      <path d="M 0 110 C -32 100, -42 86, -36 72 C -22 78, -8 92, 0 110 Z" />
      <path d="M 0 80 C 28 70, 38 56, 32 42 C 18 48, 6 62, 0 80 Z" />
      <path d="M 0 -10 C -55 -10, -80 30, -60 60 C -40 75, -20 70, 0 60 C 20 70, 40 75, 60 60 C 80 30, 55 -10, 0 -10 Z" />
      <path d="M 0 5 C -38 5, -55 30, -42 50 C -28 60, -14 56, 0 48 C 14 56, 28 60, 42 50 C 55 30, 38 5, 0 5 Z" opacity="0.85" />
      <path d="M 0 18 C -22 18, -32 36, -24 48 C -14 54, -6 52, 0 46 C 6 52, 14 54, 24 48 C 32 36, 22 18, 0 18 Z" opacity="0.7" />
    </g>
  );
}

function BirdSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 210)" fill={fill}>
      <path d="M -10 0 C -10 -12, 10 -12, 10 0 C 10 14, 4 24, 0 26 C -4 24, -10 14, -10 0 Z" />
      <circle cx="0" cy="-16" r="9" />
      <path d="M 8 -16 L 22 -14 L 8 -10 Z" />
      <path d="M -8 -4 C -50 -30, -110 -28, -150 -2 C -120 2, -80 4, -50 6 C -30 6, -16 4, -8 4 Z" />
      <path d="M 8 -4 C 50 -30, 110 -28, 150 -2 C 120 2, 80 4, 50 6 C 30 6, 16 4, 8 4 Z" />
      <path d="M -6 24 L 0 60 L 6 24 Z" />
    </g>
  );
}

function HandSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 240)" fill={fill}>
      <path d="M -38 0 C -42 -30, -36 -50, -22 -54 C -8 -56, 8 -56, 22 -54 C 36 -50, 42 -30, 38 0 C 38 30, 28 60, 0 70 C -28 60, -38 30, -38 0 Z" />
      <path d="M -38 -10 C -54 -20, -64 -42, -54 -58 C -44 -68, -34 -58, -32 -42 C -32 -28, -36 -16, -38 -10 Z" />
      <rect x="-22" y="-92" width="9" height="42" rx="4" />
      <rect x="-9" y="-100" width="9" height="50" rx="4" />
      <rect x="4" y="-100" width="9" height="50" rx="4" />
      <rect x="17" y="-92" width="9" height="42" rx="4" />
    </g>
  );
}

function FlameSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 230)" fill={fill}>
      <path d="M 0 -100 C -10 -70, -50 -30, -50 10 C -50 60, -20 90, 0 90 C 20 90, 50 60, 50 10 C 50 -30, 30 -50, 20 -70 C 14 -84, 8 -90, 0 -100 Z" />
      <path d="M 0 -50 C -8 -30, -22 -10, -22 14 C -22 44, -8 60, 0 60 C 8 60, 22 44, 22 14 C 22 -10, 12 -20, 8 -32 C 4 -42, 4 -46, 0 -50 Z" opacity="0.6" />
    </g>
  );
}

function SmokeSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 230)" fill={fill}>
      {/* Stacked irregular blobs — smoke billowing up */}
      <path d="M -90 80 C -110 60, -120 30, -100 10 C -110 -10, -90 -20, -70 -10 C -60 -40, -30 -50, -10 -30 C 10 -60, 50 -60, 60 -30 C 90 -40, 110 -10, 90 20 C 110 40, 100 70, 70 70 C 60 90, 30 100, 10 90 C -10 110, -50 100, -70 90 C -80 100, -100 95, -90 80 Z" />
      <ellipse cx="0" cy="-90" rx="22" ry="18" opacity="0.55" />
      <ellipse cx="-30" cy="-110" rx="14" ry="12" opacity="0.4" />
      <ellipse cx="20" cy="-130" rx="10" ry="8" opacity="0.3" />
    </g>
  );
}

function VinylSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      {/* Disc */}
      <circle r="115" />
      {/* Concentric grooves (visible in halo + blur) */}
      <circle r="95" fill="none" stroke={fill} strokeWidth="0.6" opacity="0.55" />
      <circle r="75" fill="none" stroke={fill} strokeWidth="0.6" opacity="0.5" />
      <circle r="58" fill="none" stroke={fill} strokeWidth="0.6" opacity="0.45" />
      <circle r="42" fill="none" stroke={fill} strokeWidth="0.6" opacity="0.4" />
      {/* Center label */}
      <circle r="32" fill={fill} opacity="0.7" />
      <circle r="3" fill="none" stroke={fill} strokeWidth="1.5" />
    </g>
  );
}

function MountainSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      {/* Foreground peak */}
      <path d="M -150 100 L -40 -80 L 30 30 L 90 -40 L 150 100 Z" />
      {/* Distant ridge */}
      <path
        d="M -150 100 L -100 50 L -60 70 L -20 30 L 30 60 L 80 20 L 130 80 L 150 100 Z"
        opacity="0.55"
      />
      {/* Thin moon */}
      <circle cx="60" cy="-90" r="14" fill="none" stroke={fill} strokeWidth="2" opacity="0.5" />
    </g>
  );
}

function TreeSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 240)" fill={fill}>
      <rect x="-4" y="0" width="8" height="120" />
      {/* Branches */}
      <path d="M 0 -10 L -50 -90 M 0 -10 L 50 -100 M -8 30 L -80 -20 M 8 30 L 90 -10" stroke={fill} strokeWidth="3" fill="none" />
      <path d="M -50 -90 L -80 -120 M -50 -90 L -40 -130" stroke={fill} strokeWidth="2" fill="none" />
      <path d="M 50 -100 L 70 -140 M 50 -100 L 30 -140" stroke={fill} strokeWidth="2" fill="none" />
      <path d="M -80 -20 L -120 -40 M -80 -20 L -90 -60" stroke={fill} strokeWidth="2" fill="none" />
      <path d="M 90 -10 L 130 -30 M 90 -10 L 110 -50" stroke={fill} strokeWidth="2" fill="none" />
    </g>
  );
}

function SkullSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      <path d="M -55 -20 C -55 -70, 55 -70, 55 -20 C 55 10, 50 30, 35 40 L 35 60 L 15 60 L 15 50 L -15 50 L -15 60 L -35 60 L -35 40 C -50 30, -55 10, -55 -20 Z" />
      {/* Eye sockets */}
      <ellipse cx="-22" cy="-15" rx="12" ry="14" fill="#000" />
      <ellipse cx="22" cy="-15" rx="12" ry="14" fill="#000" />
      {/* Nose */}
      <path d="M 0 5 L -6 22 L 0 26 L 6 22 Z" fill="#000" />
    </g>
  );
}

function EyeSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      {/* Outer almond */}
      <path d="M -120 0 C -80 -50, 80 -50, 120 0 C 80 50, -80 50, -120 0 Z" />
      {/* Iris */}
      <circle r="32" fill="#000" />
      <circle r="22" fill={fill} opacity="0.55" />
      {/* Pupil */}
      <circle r="10" fill="#000" />
      {/* Catchlight */}
      <circle cx="-6" cy="-8" r="3" fill={fill} opacity="0.85" />
    </g>
  );
}

function WaveSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 230)" fill={fill}>
      {/* Crest */}
      <path d="M -150 60 C -120 -40, -40 -90, 30 -50 C 90 -20, 110 30, 150 30 L 150 100 L -150 100 Z" />
      {/* Curl detail */}
      <path
        d="M -50 -30 C -20 -55, 30 -65, 70 -45"
        stroke={fill}
        strokeWidth="2.5"
        fill="none"
        opacity="0.55"
      />
      {/* Foam dots */}
      <circle cx="-10" cy="-20" r="3" fill={fill} opacity="0.65" />
      <circle cx="20" cy="-10" r="2" fill={fill} opacity="0.5" />
      <circle cx="-30" cy="-5" r="2" fill={fill} opacity="0.5" />
    </g>
  );
}

function LightningSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      <path d="M 10 -120 L -45 0 L -5 0 L -30 110 L 50 -10 L 5 -10 L 35 -120 Z" />
    </g>
  );
}

function PalmSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 250)" fill={fill}>
      {/* Curved leaning trunk — bottom right to top center, banana-curve */}
      <path
        d="M 16 130
           C 8 80, -2 30, -8 -20
           C -12 -60, -10 -100, -8 -130
           L 4 -130
           C 8 -100, 12 -60, 18 -20
           C 26 30, 32 80, 36 130 Z"
      />
      {/* Trunk ring details */}
      <ellipse cx="-2" cy="-50" rx="14" ry="3" opacity="0.55" />
      <ellipse cx="0" cy="-20" rx="16" ry="3" opacity="0.55" />
      <ellipse cx="6" cy="20" rx="18" ry="3" opacity="0.55" />
      <ellipse cx="14" cy="60" rx="20" ry="3" opacity="0.55" />
      <ellipse cx="22" cy="100" rx="22" ry="3" opacity="0.55" />

      {/* Coconuts at the crown */}
      <circle cx="-4" cy="-128" r="6" />
      <circle cx="8" cy="-132" r="6" />
      <circle cx="-12" cy="-122" r="5" opacity="0.85" />

      {/* Fronds — long, curved, in all directions from the crown */}
      {/* Upper-left arching frond */}
      <path
        d="M -6 -130
           C -40 -150, -90 -150, -140 -130
           C -110 -148, -70 -160, -30 -158
           C -16 -154, -10 -144, -4 -136 Z"
      />
      {/* Upper-right arching frond */}
      <path
        d="M 4 -130
           C 40 -150, 90 -150, 140 -130
           C 110 -150, 70 -160, 30 -160
           C 16 -156, 8 -144, 6 -136 Z"
      />
      {/* Top vertical frond */}
      <path
        d="M -2 -130
           C -10 -170, -2 -200, 14 -200
           C 14 -180, 10 -160, 4 -136 Z"
      />
      {/* Mid-left curving frond */}
      <path
        d="M -8 -126
           C -60 -110, -120 -90, -150 -50
           C -120 -80, -80 -110, -40 -120
           C -22 -124, -12 -126, -8 -128 Z"
      />
      {/* Mid-right curving frond */}
      <path
        d="M 6 -126
           C 60 -110, 120 -90, 160 -60
           C 130 -90, 90 -116, 50 -126
           C 30 -128, 14 -130, 8 -130 Z"
      />
      {/* Lower-left frond drooping */}
      <path
        d="M -10 -118
           C -50 -90, -100 -80, -130 -50
           C -110 -90, -70 -110, -30 -120
           C -18 -122, -14 -120, -10 -120 Z"
        opacity="0.85"
      />
      {/* Lower-right frond drooping */}
      <path
        d="M 8 -118
           C 50 -90, 100 -80, 130 -50
           C 110 -90, 70 -110, 30 -120
           C 18 -122, 12 -120, 8 -120 Z"
        opacity="0.85"
      />
    </g>
  );
}

function RoyceHallSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 240)" fill={fill}>
      {/* Foundation / base */}
      <rect x="-150" y="60" width="300" height="14" />

      {/* Main facade body */}
      <rect x="-120" y="-30" width="240" height="90" />

      {/* Triangular gable / pediment between towers */}
      <path d="M -80 -30 L 0 -90 L 80 -30 Z" />

      {/* Large central archway */}
      <path
        d="M -28 60 L -28 -10 C -28 -28, 28 -28, 28 -10 L 28 60 Z"
        fill="rgba(0,0,0,0.6)"
      />

      {/* Side arch windows (smaller) */}
      <path
        d="M -90 60 L -90 8 C -90 -2, -64 -2, -64 8 L -64 60 Z"
        fill="rgba(0,0,0,0.55)"
      />
      <path
        d="M 64 60 L 64 8 C 64 -2, 90 -2, 90 8 L 90 60 Z"
        fill="rgba(0,0,0,0.55)"
      />

      {/* LEFT TOWER */}
      <rect x="-160" y="-80" width="44" height="150" />
      {/* Tower windows (3 stacked) */}
      <rect x="-150" y="-66" width="24" height="18" fill="rgba(0,0,0,0.55)" />
      <rect x="-150" y="-38" width="24" height="18" fill="rgba(0,0,0,0.55)" />
      <rect x="-150" y="-10" width="24" height="18" fill="rgba(0,0,0,0.55)" />
      {/* Tower crown */}
      <rect x="-164" y="-92" width="52" height="14" />
      {/* Tower spire/cap */}
      <rect x="-150" y="-110" width="24" height="20" />
      <path d="M -148 -110 L -138 -130 L -128 -110 Z" />

      {/* RIGHT TOWER (mirror) */}
      <rect x="116" y="-80" width="44" height="150" />
      <rect x="126" y="-66" width="24" height="18" fill="rgba(0,0,0,0.55)" />
      <rect x="126" y="-38" width="24" height="18" fill="rgba(0,0,0,0.55)" />
      <rect x="126" y="-10" width="24" height="18" fill="rgba(0,0,0,0.55)" />
      <rect x="112" y="-92" width="52" height="14" />
      <rect x="126" y="-110" width="24" height="20" />
      <path d="M 128 -110 L 138 -130 L 148 -110 Z" />
    </g>
  );
}

function LeafSil({ fill }: { fill: string }) {
  return (
    <g transform="translate(200, 220)" fill={fill}>
      {/* Single elongated leaf */}
      <path d="M 0 -120 C -55 -90, -85 -30, -70 30 C -50 80, -20 100, 0 110 C 20 100, 50 80, 70 30 C 85 -30, 55 -90, 0 -120 Z" />
      {/* Central vein */}
      <path d="M 0 -120 L 0 110" stroke={fill} strokeWidth="1.5" fill="none" opacity="0.45" />
      {/* Side veins */}
      <path d="M 0 -80 C 20 -70, 35 -55, 45 -35 M 0 -80 C -20 -70, -35 -55, -45 -35" stroke={fill} strokeWidth="1" fill="none" opacity="0.45" />
      <path d="M 0 -30 C 22 -22, 40 -8, 52 12 M 0 -30 C -22 -22, -40 -8, -52 12" stroke={fill} strokeWidth="1" fill="none" opacity="0.45" />
      <path d="M 0 30 C 18 38, 32 50, 40 65 M 0 30 C -18 38, -32 50, -40 65" stroke={fill} strokeWidth="1" fill="none" opacity="0.45" />
    </g>
  );
}
