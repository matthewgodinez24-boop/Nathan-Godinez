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

const STANDARD_LICENSES: LicenseOption[] = [
  {
    tier: "Basic",
    price: 49,
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
    price: 99,
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
    price: 199,
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
    price: 299,
    blurb: "Non-exclusive, no caps.",
    rights: [
      "All file formats delivered",
      "Unlimited streams + videos",
      "Live + paid performances",
      "Beat remains available to other buyers",
    ],
  },
];

/**
 * PLACEHOLDER CATALOG.
 * Every cover/preview path points to a missing file — replace as media arrives.
 * Splits are illustrative; confirm with collaborators before launch.
 */
export const beats: Beat[] = [
  {
    slug: "atlas-room",
    title: "Atlas Room",
    bpm: 84,
    key: "F# minor",
    genre: "R&B",
    moods: ["Cinematic", "Lush"],
    tags: ["live guitar", "tape saturation", "808"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 70 },
      { collaboratorId: "vocalist-aria", payoutPercent: 20 },
      { collaboratorId: "engineer-jules", payoutPercent: 10 },
    ],
    coverImage: "/images/beats/atlas-room.jpg",
    previewSrc: "/audio/atlas-room-preview.mp3",
    releasedAt: "2026-04-22",
    durationSeconds: 192,
    description:
      "Wide, slow R&B with live guitar laid into tape. Built for vocalists who hold notes.",
    featured: true,
  },
  {
    slug: "north-room",
    title: "North Room",
    bpm: 92,
    key: "C minor",
    genre: "Hip-Hop",
    moods: ["Hard", "Driving"],
    tags: ["distorted guitar", "drum break"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 80 },
      { collaboratorId: "coprod-marek", payoutPercent: 20 },
    ],
    coverImage: "/images/beats/north-room.jpg",
    previewSrc: "/audio/north-room-preview.mp3",
    releasedAt: "2026-04-08",
    durationSeconds: 168,
    description:
      "A hard hip-hop instrumental built off a single distorted guitar loop and a swung break.",
    featured: true,
  },
  {
    slug: "evening-stretch",
    title: "Evening Stretch",
    bpm: 72,
    key: "A major",
    genre: "Soul",
    moods: ["Mellow", "Nostalgic"],
    tags: ["nylon guitar", "Rhodes", "warm"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 60 },
      { collaboratorId: "vocalist-aria", payoutPercent: 25 },
      { collaboratorId: "coprod-marek", payoutPercent: 15 },
    ],
    coverImage: "/images/beats/evening-stretch.jpg",
    previewSrc: "/audio/evening-stretch-preview.mp3",
    releasedAt: "2026-03-30",
    durationSeconds: 204,
    description:
      "Nylon guitar over Rhodes. Late-evening soul that sits behind a vocal without crowding it.",
    featured: true,
  },
  {
    slug: "lockstep",
    title: "Lockstep",
    bpm: 140,
    key: "E minor",
    genre: "Drill",
    moods: ["Dark", "Driving"],
    tags: ["sliding 808s", "guitar lead"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 100 },
    ],
    coverImage: "/images/beats/lockstep.jpg",
    previewSrc: "/audio/lockstep-preview.mp3",
    releasedAt: "2026-03-21",
    durationSeconds: 158,
    description: "A precise, locked-in drill instrumental led by a single guitar line.",
  },
  {
    slug: "skyway",
    title: "Skyway",
    bpm: 110,
    key: "D major",
    genre: "Pop",
    moods: ["Lush", "Cinematic"],
    tags: ["shimmer guitar", "synth pad"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 75 },
      { collaboratorId: "engineer-jules", payoutPercent: 25 },
    ],
    coverImage: "/images/beats/skyway.jpg",
    previewSrc: "/audio/skyway-preview.mp3",
    releasedAt: "2026-03-12",
    durationSeconds: 184,
    description: "Open, shimmering pop instrumental — built for lifts and choruses.",
  },
  {
    slug: "garden-tape",
    title: "Garden Tape",
    bpm: 88,
    key: "G major",
    genre: "Indie",
    moods: ["Nostalgic", "Mellow"],
    tags: ["tape hiss", "fingerpicked"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 65 },
      { collaboratorId: "vocalist-aria", payoutPercent: 20 },
      { collaboratorId: "engineer-jules", payoutPercent: 15 },
    ],
    coverImage: "/images/beats/garden-tape.jpg",
    previewSrc: "/audio/garden-tape-preview.mp3",
    releasedAt: "2026-02-28",
    durationSeconds: 212,
    description: "Fingerpicked acoustic over warm tape, indie-pop ready for a soft vocal.",
  },
  {
    slug: "hallway-light",
    title: "Hallway Light",
    bpm: 96,
    key: "B minor",
    genre: "R&B",
    moods: ["Lush", "Mellow"],
    tags: ["chorus guitar", "low strings"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 70 },
      { collaboratorId: "coprod-marek", payoutPercent: 30 },
    ],
    coverImage: "/images/beats/hallway-light.jpg",
    previewSrc: "/audio/hallway-light-preview.mp3",
    releasedAt: "2026-02-14",
    durationSeconds: 196,
    description: "Cinematic, low-lit R&B with a sustained chorus guitar and bowed strings.",
  },
  {
    slug: "border-town",
    title: "Border Town",
    bpm: 78,
    key: "E minor",
    genre: "Hip-Hop",
    moods: ["Cinematic", "Dark"],
    tags: ["spaghetti western", "tremolo"],
    priceFrom: 49,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 85 },
      { collaboratorId: "coprod-marek", payoutPercent: 15 },
    ],
    coverImage: "/images/beats/border-town.jpg",
    previewSrc: "/audio/border-town-preview.mp3",
    releasedAt: "2026-01-30",
    durationSeconds: 178,
    description: "Spaghetti-western tremolo guitar over a slow, heavy hip-hop drum.",
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
