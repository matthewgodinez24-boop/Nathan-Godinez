# Artist Simple 01 — Premium Artist + Beat Marketplace

> **Live site:** https://nathan-godinez.vercel.app
> Portfolio piece by [Matthew Godinez](https://github.com/matthewgodinez24-boop). All rights reserved — see [LICENSE.md](./LICENSE.md).

A high-end Apple-inspired website for a guitarist/producer who collaborates and sells beats. Built for the artist Nathan Godinez (Phase 1).

**What's interesting in this codebase**
- Apple "Get the highlights"-style horizontal carousel built on native CSS scroll-snap (not a JS scroller), with peek, custom rAF easing for programmatic scrolls, mouse pointer-drag, and an auto-advance progress fill.
- Collaborator split math centralized in `src/lib/payouts.ts` with a load-time validator that throws if any beat's splits don't sum to 100% — Stripe Connect-ready.
- Single source of truth for all site copy (`src/data/site.ts`) and catalog (`src/data/beats.ts`).
- Theme system using `useSyncExternalStore` over an `<html>` class, with an inline boot script to prevent flash.
- Page-wide perf: Lenis kept for programmatic scrolls only (`smoothWheel: false`) so native wheel stays on the compositor.

Phase 1 deliverable: polished homepage, beat marketplace with filters, beat detail pages, collaborator split data structure, scroll animations, and a single-source-of-truth content model.

---

## 1. Run the site locally

You need **Node.js 20+** installed (Node is not currently on this machine — install it first).

```bash
# from this directory
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts:
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript without emitting

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lenis.

---

## 2. Where to edit artist info

All sitewide copy lives in **`src/data/site.ts`**. Replace placeholder strings with real content:

- `artist.name`, `artist.tagline`, `artist.bio`, `artist.location`
- `domain` — set the production URL before launch
- `nav` — page links shown in the header
- `hero.*` — headline, sub, CTAs on the homepage hero
- `cinematic.*` — middle-of-page cinematic media block (point `videoSrc` at a real `.mp4` when ready)
- `collaboration.*` — the "Built with other artists" section
- `contact.email`, `contact.socials` — contact page + footer links
- `footer.note` — small footer line

Anything marked `// PLACEHOLDER` is meant to be replaced.

---

## 3. Where to add beats

The catalog lives in **`src/data/beats.ts`**.

To add a beat:

1. Add a new entry to the `beats` array.
2. The `slug` becomes the URL: `/beats/<slug>`.
3. Drop cover art at `public/images/beats/<slug>.jpg` (or update `coverImage`). If the file is missing, the site falls back to a generated SVG placeholder colored by slug — the page still works.
4. Drop the **tagged preview MP3** at `public/audio/<slug>-preview.mp3` (or update `previewSrc`). If missing, the play button shows a "preview not yet uploaded" state.
5. Reference collaborators by `id` from `data/collaborators.ts` and ensure splits sum to 100. If they don't, the site throws on load with a clear error pointing at the offending slug.

Each beat has:
- `bpm`, `key`, `genre`, `moods`, `tags` — used by the marketplace filters
- `licenseOptions` — pricing tiers (defaults provided as `STANDARD_LICENSES`)
- `splits` — array of `{ collaboratorId, payoutPercent }` that MUST sum to 100
- `featured: true` — surfaces the beat in the homepage's "Featured" section

---

## 4. Where to add collaborators

The collaborator directory lives in **`src/data/collaborators.ts`**.

Add an entry with:
- `id` — kebab-case, used in `splits` references on beats
- `name`, `role` (e.g. "Vocals", "Co-production", "Engineer")
- `link` (optional) — social / artist URL
- `avatar` (optional) — drop a square image into `public/images/collaborators/`

---

## 5. Where to replace images / audio / media

| Asset | Path | Notes |
|---|---|---|
| Cinematic homepage video | `public/videos/cinematic-hero.mp4` | Set `site.cinematic.videoSrc` to point at it |
| Cinematic homepage poster | `public/images/cinematic-hero.jpg` | Set `site.cinematic.posterImage` to point at it |
| Beat covers | `public/images/beats/<slug>.jpg` | One per beat, square (≥ 1500×1500) |
| Beat preview MP3s | `public/audio/<slug>-preview.mp3` | Tagged previews only — not the master |
| Collaborator avatars | `public/images/collaborators/<id>.jpg` | Square |
| About page photos | `public/images/about/` | Then replace the placeholder grid block in `src/app/about/page.tsx` |
| Favicon | `public/favicon.ico` | (currently using Next.js default) |

The site does NOT ship any masters publicly — only tagged previews.

---

## 6. What still needs to be done before real payments

This site is a **structurally complete frontend with no payment processing wired up**. The Buy buttons are intentionally disabled.

To go live with real sales, you'll need to add:

1. **Commerce backend.** Recommended: Stripe Connect (so collaborators get direct payouts) or Lemon Squeezy as Merchant of Record (handles VAT/tax for you, but limits split flexibility).
2. **Connected accounts for every collaborator.** Each collaborator listed in `data/collaborators.ts` needs to onboard to the chosen payment platform and have their connected account ID stored alongside their record.
3. **Checkout API route.** A `POST /api/checkout` that:
   - reads the beat by slug + selected license tier
   - creates a Stripe Checkout Session (or LS checkout) with the gross amount
   - on success webhook → calls `computePayoutsCents(beat.splits, gross)` from `src/lib/payouts.ts` and issues transfers to each collaborator's connected account
4. **Order persistence.** A database (Postgres / SQLite via Turso / Supabase) to record orders, buyer email, license tier, file delivery state.
5. **Signed download URLs.** Untagged masters live in private object storage (S3/R2/Bunny). After successful payment, generate a short-lived signed URL emailed to the buyer.
6. **License PDF generation.** Render a per-buyer PDF on order completion with buyer name + beat title + tier + date.
7. **Lawyer review.** Have an entertainment lawyer review the license rights in `STANDARD_LICENSES` before any real money changes hands.
8. **Tax handling.** Stripe Tax or LS-as-MoR. Don't ignore this — selling to EU/UK customers without VAT compliance is a real liability.

The split math is already centralized — see `src/lib/payouts.ts`:
- `validateSplits(beat)` — throws if a beat's splits don't sum to 100
- `computePayoutsCents(splits, grossCents)` — returns `{ collaboratorId: cents }`, with rounding remainder allocated to the largest split holder so totals always reconcile to gross

---

## File map

```
src/
  app/
    layout.tsx              # root layout, header/footer, validates beat splits at load
    page.tsx                # home (Hero + Cinematic + Featured + Collaboration + CTA)
    globals.css             # Tailwind v4 + theme tokens + reduced-motion handling
    beats/page.tsx          # marketplace grid with filters
    beats/[slug]/page.tsx   # per-beat detail
    about/page.tsx          # bio + photo placeholder grid
    contact/page.tsx        # email + socials
  components/
    layout/                 # Header, Footer
    home/                   # Hero, CinematicMedia, FeaturedBeats, CollaborationSection, CTABrowse
    marketplace/            # BeatGrid, BeatCard, BeatCover, FilterBar, AudioPreview, BeatDetail
    motion/                 # ScrollReveal, Parallax (both respect prefers-reduced-motion)
  data/
    site.ts                 # all artist/site copy
    beats.ts                # catalog
    collaborators.ts        # collaborator directory
  lib/
    payouts.ts              # split validation + payout math (Stripe Connect-ready)
    utils.ts                # cn(), formatPrice(), formatDuration()
public/
  images/beats/             # per-beat cover art (drop here)
  images/placeholder-cinematic.svg
  audio/                    # per-beat preview MP3s (drop here)
```

---

## Design intent

- Apple-inspired premium minimalism — generous spacing, large display typography (SF Pro stack), tight tracking, hairline dividers
- Sticky glass nav that fades in on scroll
- Hero scales + blurs as you leave it (product-page feel)
- Section reveals via `<ScrollReveal>` — fade + 32px slide on intersection
- Parallax cover via `<Parallax>` — subtle, never showy
- Marketplace cards lift on hover with a soft drop shadow
- Layout-animated grid when filters change (Framer Motion `<AnimatePresence mode="popLayout">`)
- Light + dark via `prefers-color-scheme`
- `prefers-reduced-motion` is respected globally — all transitions and parallax travel collapse to instant
- Mobile-first; the hero, marketplace grid, and detail page all flow naturally down to 375px
