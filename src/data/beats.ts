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
    productType: "beat",
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
    productType: "beat",
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
    productType: "beat",
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
    productType: "beat",
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
    productType: "beat",
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
    productType: "beat",
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
    productType: "beat",
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
    productType: "beat",
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

  /* ---- LOOPS ---- */
  {
    slug: "warm-room-loop-pack",
    title: "Warm Room — Guitar Loops",
    productType: "loop",
    bpm: 86,
    key: "E minor",
    genre: "R&B",
    moods: ["Lush", "Mellow"],
    tags: ["guitar loops", "live", "tape"],
    priceFrom: 29,
    licenseOptions: STANDARD_LICENSES.slice(0, 2),
    splits: [{ collaboratorId: "self", payoutPercent: 100 }],
    coverImage: "/images/beats/warm-room-loop-pack.jpg",
    previewSrc: "/audio/warm-room-loop-pack-preview.mp3",
    releasedAt: "2026-04-26",
    durationSeconds: 96,
    description: "Twelve melodic guitar loops at 86 BPM. Tape-saturated, key-tagged.",
  },
  {
    slug: "drill-cuts-loop-pack",
    title: "Drill Cuts — Guitar Loops",
    productType: "loop",
    bpm: 142,
    key: "F# minor",
    genre: "Drill",
    moods: ["Dark", "Driving"],
    tags: ["loops", "distorted", "drill"],
    priceFrom: 29,
    licenseOptions: STANDARD_LICENSES.slice(0, 2),
    splits: [{ collaboratorId: "self", payoutPercent: 100 }],
    coverImage: "/images/beats/drill-cuts-loop-pack.jpg",
    previewSrc: "/audio/drill-cuts-loop-pack-preview.mp3",
    releasedAt: "2026-04-12",
    durationSeconds: 84,
    description: "Sixteen drill-ready guitar loops at 142 BPM with sliding 808 stems.",
  },

  /* ---- SONGS ---- */
  {
    slug: "long-hallways",
    title: "Long Hallways",
    productType: "song",
    bpm: 90,
    key: "B minor",
    genre: "R&B",
    moods: ["Cinematic", "Lush"],
    tags: ["finished record", "feature"],
    priceFrom: 199,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 60 },
      { collaboratorId: "vocalist-aria", payoutPercent: 30 },
      { collaboratorId: "engineer-jules", payoutPercent: 10 },
    ],
    coverImage: "/images/beats/long-hallways.jpg",
    previewSrc: "/audio/long-hallways-preview.mp3",
    releasedAt: "2026-04-04",
    durationSeconds: 218,
    description: "Finished record. Vocal feature included. Available for sync.",
  },

  /* ---- SCORES ---- */
  {
    slug: "first-light-cue",
    title: "First Light",
    productType: "score",
    bpm: 64,
    key: "D major",
    genre: "Score",
    moods: ["Cinematic", "Lush"],
    tags: ["score", "sync", "cue"],
    priceFrom: 149,
    licenseOptions: STANDARD_LICENSES,
    splits: [
      { collaboratorId: "self", payoutPercent: 75 },
      { collaboratorId: "engineer-jules", payoutPercent: 25 },
    ],
    coverImage: "/images/beats/first-light-cue.jpg",
    previewSrc: "/audio/first-light-cue-preview.mp3",
    releasedAt: "2026-03-18",
    durationSeconds: 144,
    description: "Slow-build cinematic cue. Strings, fingerpicked guitar, soft swell.",
  },
  {
    slug: "open-water-cue",
    title: "Open Water",
    productType: "score",
    bpm: 70,
    key: "A minor",
    genre: "Score",
    moods: ["Cinematic", "Nostalgic"],
    tags: ["score", "sync", "ambient"],
    priceFrom: 149,
    licenseOptions: STANDARD_LICENSES,
    splits: [{ collaboratorId: "self", payoutPercent: 100 }],
    coverImage: "/images/beats/open-water-cue.jpg",
    previewSrc: "/audio/open-water-cue-preview.mp3",
    releasedAt: "2026-02-22",
    durationSeconds: 168,
    description: "Ambient guitar score with bowed pads. Built for documentary or trailer.",
  },

  /* ---- KITS ---- */
  {
    slug: "studio-kit-vol-1",
    title: "NG Studio Kit · Vol. 1",
    productType: "kit",
    bpm: 0,
    key: "Various",
    genre: "Sample Kit",
    moods: ["Cinematic", "Lush", "Mellow"],
    tags: ["drums", "guitar one-shots", "tags", "WAV"],
    priceFrom: 39,
    licenseOptions: STANDARD_LICENSES.slice(0, 2),
    splits: [{ collaboratorId: "self", payoutPercent: 100 }],
    coverImage: "/images/beats/studio-kit-vol-1.jpg",
    previewSrc: "/audio/studio-kit-vol-1-preview.mp3",
    releasedAt: "2026-04-15",
    durationSeconds: 0,
    description: "60 drum hits, 30 guitar one-shots, and 10 producer tags. WAV, royalty-free.",
  },
  {
    slug: "studio-kit-vol-2",
    title: "NG Studio Kit · Vol. 2",
    productType: "kit",
    bpm: 0,
    key: "Various",
    genre: "Sample Kit",
    moods: ["Hard", "Driving"],
    tags: ["drums", "808s", "trap", "WAV"],
    priceFrom: 39,
    licenseOptions: STANDARD_LICENSES.slice(0, 2),
    splits: [{ collaboratorId: "self", payoutPercent: 100 }],
    coverImage: "/images/beats/studio-kit-vol-2.jpg",
    previewSrc: "/audio/studio-kit-vol-2-preview.mp3",
    releasedAt: "2026-03-08",
    durationSeconds: 0,
    description: "Hard-hitting 808 + drum bundle. 80 hits, 20 loops, key + BPM tagged.",
  },

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
    priceFrom: 49,
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
    priceFrom: 49,
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
