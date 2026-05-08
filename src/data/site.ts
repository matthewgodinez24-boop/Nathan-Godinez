/**
 * SITE CONTENT — single source of truth for headline copy, links, contact info.
 *
 * Edit this file to change anything visible across the marketing pages.
 * Replace placeholder strings as real content arrives.
 */

export const site = {
  artist: {
    name: "Nathan Godinez",
    tagline: "Guitarist. Producer. Collaborator.",
    // Long-form intro — replace freely as Nathan provides real bio copy
    bio:
      "A guitarist building tone-driven instrumentals from the studio floor up. " +
      "Collaborates with vocalists, producers, and visual artists to ship records " +
      "that feel cinematic and lived-in.",
    location: "Los Angeles, CA",
    // Lead portrait used in the cinematic section. Drop a real file at this path.
    portrait: "/images/hero-nathan.jpg",
  },

  // Domain + branding
  domain: "https://example.com", // PLACEHOLDER — replace at launch
  brandColor: "#0a0a0a", // primary text color on light backgrounds; theme tweaks live in globals.css

  // Navigation
  nav: [
    { label: "Store", href: "/beats" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  // Hero — top of homepage
  hero: {
    eyebrow: "New release",
    headline: "Instrumentalist Producer Composer",
    sub:
      "Original instrumentals and guitar-led collaborations, built for artists who " +
      "care how a record sounds in the room.",
    primaryCta: { label: "Browse the catalog", href: "/beats" },
    secondaryCta: { label: "Hear the work", href: "#cinematic" },
  },

  // Cinematic media section — uses the lead portrait by default. Swap in real video later.
  cinematic: {
    headline: "Built around the guitar.",
    sub: "Live-tracked through analog signal chains, finished for streaming.",
    // Drop the lead photo at /public/images/hero-nathan.jpg — falls back to the SVG if missing.
    posterImage: "/images/hero-nathan.jpg",
    videoSrc: null as string | null, // e.g. "/videos/cinematic-hero.mp4"
  },

  // Collaboration section
  collaboration: {
    headline: "Built with other artists.",
    body:
      "Every release ships with credit and a transparent split. " +
      "If you sing, produce, or shape the record, you're on it.",
    bullets: [
      "Transparent collaborator credits on every beat.",
      "Splits stored alongside each track, ready for direct payout.",
      "Open to vocalists, producers, engineers, and visual artists.",
    ],
  },

  // Contact / booking
  contact: {
    headline: "Let's make something.",
    sub: "Booking, features, or syncs — reach out and I'll get back fast.",
    email: "nathancgodinez@gmail.com",
    phone: "562-394-7390",
    // Replace social hrefs with Nathan's real handles when ready
    socials: [
      { label: "Instagram", href: "https://instagram.com/" },
      { label: "YouTube", href: "https://youtube.com/" },
      { label: "Spotify", href: "https://open.spotify.com/" },
    ],
  },

  // Footer copy
  footer: {
    note: "Made with intention. Originals only.",
  },
} as const;

export type SiteContent = typeof site;
