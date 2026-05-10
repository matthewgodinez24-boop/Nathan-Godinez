/**
 * BEATS — single source of truth for the catalog.
 *
 * To add a beat:
 *   1. Add an entry here. The `slug` becomes the URL: /beats/<slug>
 *   2. Add cover art at /public/images/beats/<slug>.jpg (or update `coverImage`)
 *   3. Add the tagged preview MP3 at /public/audio/<slug>-preview.mp3 (or update `previewSrc`)
 *   4. Reference collaborators by id from data/collaborators.ts and ensure splits sum to 100.
 *
 * License tiers and prices are placeholders — confirm with lawyer before launch.
 */

import type { Collaborator } from "./collaborators";

/**
 * Product types Nathan sells. The catalog page lets buyers filter on this.
 * - beat:  full instrumental, ready to write/record over
 * - loop:  short looped element (drums, guitar, hook) for producers to chop
 * - song:  finished record (sometimes a feature, sometimes a sync candidate)
 * - score: cue-style cinematic piece for film/TV/sync
 * - kit:   sample/sound kit — multiple files bundled (drums + tags + one-shots)
 */
export type ProductType = "beat" | "loop" | "song" | "score" | "kit";

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "beat", label: "Beats" },
  { value: "loop", label: "Loops" },
  { value: "song", label: "Songs" },
  { value: "score", label: "Scores" },
  { value: "kit", label: "Kits" },
];

export type LicenseTier = "Basic" | "Premium" | "Trackouts" | "Unlimited" | "Exclusive";

export type LicenseOption = {
  tier: LicenseTier;
  price: number; // USD, integer
  blurb: string; // one-line summary shown on the card
  rights: string[]; // bullet list shown on the detail page
};

export type Mood =
  | "Cinematic"
  | "Hard"
  | "Mellow"
  | "Driving"
  | "Lush"
  | "Nostalgic"
  | "Dark";

export type CollaboratorSplit = {
  collaboratorId: Collaborator["id"];
  payoutPercent: number; // sum of all splits per beat MUST equal 100
};

export type Beat = {
  slug: string;
  title: string;
  // Product type — drives label, filter, and (eventually) delivery package contents
  productType: ProductType;
  /**
   * Where in the source preview file to start the 10-second sample, in seconds.
   * Defaults to 0 (start at the beginning). The store always plays exactly 10s
   * starting from this point. Nathan picks the value per beat via the studio.
   */
  previewStartSec?: number;
  bpm: number;
  // Musical key, e.g. "F# minor"
  key: string;
  // Primary genre (used for filter)
  genre: string;
  // Mood/vibe tags (used for filter)
  moods: Mood[];
  // Free-form tags shown on the card
  tags: string[];
  // Default ("from") price shown on cards — should match the cheapest licenseOption
  priceFrom: number;
  // Available license tiers in display order
  licenseOptions: LicenseOption[];
  // Collaborators for this track. Splits must sum to 100.
  splits: CollaboratorSplit[];
  // Asset paths — replace with real files when delivered
  coverImage: string;
  previewSrc: string | null; // tagged preview MP3
  // Optional fields
  releasedAt: string; // ISO date, used for "newest" sort
  durationSeconds: number;
  description: string;
  // Marks the beat as featured on the homepage (set true on a few)
  featured?: boolean;
};

// Beat license tiers — Basic at $50, scaling up to Unlimited at $299.
const STANDARD_LICENSES: LicenseOption[] = [
  {
    tier: "Basic",
    price: 50,
    blurb: "MP3 lease for non-profit use.",
    rights: [
      "MP3 master delivered",
      "Up to 5,000 streams",
      "1 music video",
      "Non-profit performances only",
    ],
  },
  {
    tier: "Premium",
    price: 100,
    blurb: "WAV lease, broader use.",
    rights: [
      "MP3 + WAV master delivered",
      "Up to 100,000 streams",
      "1 music video",
      "Non-profit performances",
    ],
  },
  {
    tier: "Trackouts",
    price: 200,
    blurb: "Stems for full creative control.",
    rights: [
      "MP3 + WAV + stems delivered",
      "Up to 250,000 streams",
      "Unlimited music videos",
      "Live performances allowed",
    ],
  },
  {
    tier: "Unlimited",
    price: 300,
    blurb: "Non-exclusive, no caps.",
    rights: [
      "All file formats delivered",
      "Unlimited streams + videos",
      "Live + paid performances",
      "Beat remains available to other buyers",
    ],
  },
];

// Loop / kit license tiers — Basic at $15.
const LOOP_LICENSES: LicenseOption[] = [
  {
    tier: "Basic",
    price: 15,
    blurb: "MP3 loop lease, royalty-free.",
    rights: [
      "MP3 loop file delivered",
      "Up to 100,000 streams",
      "1 music video",
      "Non-profit performances",
    ],
  },
  {
    tier: "Premium",
    price: 35,
    blurb: "WAV + stems, broader use.",
    rights: [
      "WAV + stems delivered",
      "Unlimited streams + videos",
      "Live performances allowed",
      "Loop remains available to other buyers",
    ],
  },
];

/**
 * CATALOG — real, verifiable products only.
 *
 * Every entry below has:
 *   - A real audio file at /public/audio/<slug>-preview.mp3
 *   - Real collaborator splits (Nathan + Barragini)
 *
 * As Nathan delivers more tracks, add them here and drop the audio in.
 * Cover images at /public/images/beats/<slug>.jpg are optional — the
 * silhouette renderer in BeatCover.tsx handles missing files.
 */
export const beats: Beat[] = [
  /* ---- Real uploads from Nathan's Drive ---- */
  // BPM is from the filename. Key, mood, and genre are reasonable guesses based on
  // the "(gunna)" stylistic prefix — confirm and adjust here when Nathan weighs in.
  {
    slug: "leaf",
    title: "Leaf",
    productType: "beat",
    bpm: 120,
    key: "A minor", // GUESS — confirm with Nathan
    genre: "Hip-Hop",
    moods: ["Driving", "Cinematic"],
    tags: ["gunna type", "melodic trap", "808s", "co-prod barragini"],
    priceFrom: 50,
    licenseOptions: STANDARD_LICENSES,
    // GUESS — 60/40 split between Nathan and Barragini. Adjust once Nathan confirms.
    splits: [
      { collaboratorId: "self", payoutPercent: 60 },
      { collaboratorId: "barragini", payoutPercent: 40 },
    ],
    coverImage: "/images/beats/leaf.jpg",
    previewSrc: "/audio/leaf-preview.mp3",
    releasedAt: "2026-05-08",
    durationSeconds: 192, // GUESS — actual file is ~3:12 at 320kbps; confirm
    description:
      "Melodic 120 BPM hip-hop in the Gunna lane — bright lead, sliding 808s, room for a vocal to ride the pocket. Co-produced with Barragini.",
    featured: true,
  },
  // BPM from filename. "(afro)" prefix suggests Afrobeats/afro-fusion — guessed
  // genre and mood accordingly. Confirm with Nathan.
  {
    slug: "vigo",
    title: "Vigo",
    productType: "beat",
    bpm: 98,
    key: "F minor", // GUESS — confirm with Nathan
    genre: "Afrobeats",
    moods: ["Driving", "Lush"],
    tags: ["afro", "live percussion", "co-prod barragini"],
    priceFrom: 50,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 50 },
      { collaboratorId: "barragini", payoutPercent: 50 },
    ],
    coverImage: "/images/beats/vigo.jpg",
    previewSrc: "/audio/vigo-preview.mp3",
    releasedAt: "2026-05-08",
    durationSeconds: 198, // GUESS — confirm
    description:
      "Afrobeats instrumental at 98 BPM — warm guitar over live percussion. Built for a vocal hook to ride. Co-produced with Barragini.",
    featured: true,
  },
  // Filename was "Ivy League - 95bpm Am @barragini @nathan.mp3" — key is confirmed (A minor).
  {
    slug: "ivy-league",
    title: "Ivy League",
    productType: "beat",
    bpm: 95,
    key: "A minor",
    genre: "Hip-Hop",
    moods: ["Cinematic", "Lush"],
    tags: ["co-prod barragini", "smooth"],
    priceFrom: 50,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 50 },
      { collaboratorId: "barragini", payoutPercent: 50 },
    ],
    coverImage: "/images/beats/ivy-league.jpg",
    previewSrc: "/audio/ivy-league-preview.mp3",
    releasedAt: "2026-05-08",
    durationSeconds: 168, // GUESS — actual length around 2:48
    description:
      "95 BPM hip-hop in A minor — clean, collegiate vibe. Built for a verse that wants to feel literate. Co-produced with Barragini.",
    featured: true,
  },
];

export function getBeatBySlug(slug: string): Beat | undefined {
  return beats.find((b) => b.slug === slug);
}

export function getFeaturedBeats(): Beat[] {
  return beats.filter((b) => b.featured);
}

export const ALL_GENRES = Array.from(new Set(beats.map((b) => b.genre))).sort();
export const ALL_MOODS: Mood[] = [
  "Cinematic",
  "Hard",
  "Mellow",
  "Driving",
  "Lush",
  "Nostalgic",
  "Dark",
];
export const ALL_KEYS = Array.from(new Set(beats.map((b) => b.key))).sort();
