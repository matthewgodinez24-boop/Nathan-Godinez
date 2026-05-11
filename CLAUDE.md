# Nathan Godinez — Artist Site + Beat Marketplace

> Read this file before doing anything. Then read `project-log.md` for the most recent session's decisions.
> When ending a session, append a short entry to `project-log.md` capturing what changed, what's open, and what to pick up next.

---

## Who this is for

- **Client:** Nathan Godinez — guitarist, producer, composer. Lives in LA. Builds tone-driven instrumentals.
- **Builder/operator:** Matthew Godinez (Nathan's brother). Designer. Hands the prompts to coding agents; not editing code directly.
- **Recurring collaborator:** Barragini — co-producer on every real beat currently live (Leaf, Vigo, Ivy League).

## Product

Premium artist site + beat marketplace, Apple-inspired UI.

Five catalog product types: **beats, loops, songs, scores, kits.** Three real beats live (Leaf, Vigo, Ivy League, all co-produced with Barragini).

Per-beat collaborator splits are modeled in code and validated to sum to 100% at module load. License tiers (Basic $50 / Premium $100 / Trackouts $200 / Unlimited $300 for beats; $15 / $35 for loops) are defined as data in `src/data/beats.ts`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Framer Motion · Lenis (smooth scroll). Deployed on Vercel at `nathan-godinez.vercel.app`. No GitHub remote yet. No custom domain yet.

## Routes

- `/` — home (Hero photo → horizontal showcase carousel → Featured beats → Collaboration → Browse CTA)
- `/beats` — catalog with filter bar
- `/beats/[slug]` — per-beat detail page (static-generated for every slug)
- `/about` — bio + approach
- `/contact` — email + phone + socials over background photo
- 404 — Next default (no custom not-found page yet)

## File map (where to look first)

```
src/
  app/
    layout.tsx              # mounts Header, Footer, SmoothScroll; validates beat splits at load
    page.tsx                # home composition
    globals.css             # Tailwind v4 + CSS vars for light/dark + utility classes
    beats/page.tsx          # catalog
    beats/[slug]/page.tsx   # detail (static params from beats array)
    about/page.tsx
    contact/page.tsx
  components/
    layout/Header.tsx       # floating glass nav, theme-aware
    layout/Footer.tsx
    layout/ThemeToggle.tsx
    home/Hero.tsx           # full-bleed photo with parallax (scroll-coupled scale + y)
    home/HorizontalShowcase.tsx  # carousel — see "Carousel design intent" below
    home/FeaturedBeats.tsx
    home/CollaborationSection.tsx
    home/CTABrowse.tsx
    home/ScrollToTopOnLoad.tsx
    marketplace/BeatGrid.tsx, BeatCard.tsx, BeatCover.tsx, FilterBar.tsx, AudioPreview.tsx, BeatDetail.tsx
    motion/ScrollReveal.tsx, Parallax.tsx
    SmoothScroll.tsx        # Lenis init — see "Scroll architecture" below
  data/
    site.ts                 # ALL site copy (artist info, nav, hero, contact, footer) — edit here
    beats.ts                # catalog data (types + STANDARD_LICENSES + LOOP_LICENSES + beats[])
    collaborators.ts        # collaborator directory referenced by beat splits
  lib/
    payouts.ts              # validateSplits, computePayoutsCents — Stripe-Connect-ready math
    utils.ts                # cn, formatPrice, formatDuration
public/
  images/                   # hero-nathan.jpg/webp, contact-background.jpg, beats/*
  audio/                    # tagged preview MP3s per beat (only leaf, vigo, ivy-league exist now)
```

## Data conventions

- **Edit copy in `src/data/site.ts`.** Anything visible across the marketing pages comes from here. Replace placeholders, don't hardcode strings in components.
- **Add a beat by editing `src/data/beats.ts`.** The `slug` becomes `/beats/<slug>`. Cover art at `public/images/beats/<slug>.jpg`. Tagged preview at `public/audio/<slug>-preview.mp3`. Splits MUST sum to 100 — the validator throws at module load if they don't.
- **Add a collaborator in `src/data/collaborators.ts`.** Use kebab-case IDs. Reference by ID in `beats[].splits`.
- Tier copy in `STANDARD_LICENSES` and `LOOP_LICENSES` is the canonical source; migrate to CMS when one is added.

## Design intent

Apple-inspired premium minimalism. Generous spacing, large display type (SF Pro stack), tight tracking, hairline dividers. Sticky glass nav. Hero scales as you leave it. Section reveals via `<ScrollReveal>`. Marketplace cards lift on hover. Light + dark via explicit `.dark` / `.light` classes on `<html>` (toggle persisted in localStorage; default dark). `prefers-reduced-motion` respected globally.

## Carousel design intent (`HorizontalShowcase.tsx`)

The client now wants this to feel as close as possible to apple.com/macbook-pro/'s "Get the highlights" carousel. **The previous "force user through it once, then release" mechanic is abandoned** — current design is always-on native scroll-snap with auto-advance, play/pause, and pagination dots. Apple-feel polish (card peek, pointer-drag, custom easing, floating pill control, active-dot progress fill) is being added in a dedicated pass — see `project-log.md` for status.

## Scroll architecture

Global Lenis (`SmoothScroll.tsx`) is mounted in `app/layout.tsx`. It exposes `window.__lenis` so any component can call `lenis.scrollTo(...)` programmatically. As of the in-progress perf pass, `smoothWheel` is being set to `false` so native wheel scrolling stays on the compositor — Lenis remains available only for programmatic scrolls. Check `SmoothScroll.tsx` for current config.

## Status — what's real, what's not

**Real:**
- Routing, layout, theme toggle, beat catalog scaffolding
- Three real beats (Leaf, Vigo, Ivy League) with real preview MP3s
- Split math + validation at build time
- Marketplace filters (type, genre, mood, key, BPM, price, sort)
- Beat detail pages with tier selector

**Out of scope for Phase 1:**
- Payments (Stripe Connect planned, not wired). Buy buttons are intentionally disabled.
- CMS — content edits happen in code, by design for Phase 1.
- Cover artwork is generated SVG; real artwork is a future content task.
- Custom domain — still on `.vercel.app`.
- Mailing list signup.
- Analytics.

## For Claude agents working on this repo

- Always read `project-log.md` immediately after this file, so you know the most recent session's decisions and any in-flight work.
- When finishing a session, append a dated entry to `project-log.md` with: what changed, what's open, what to do next, anything that broke.
- Prefer editing the data files (`site.ts`, `beats.ts`, `collaborators.ts`) over hardcoding strings in components.
- Don't introduce new dependencies without flagging it in the log.
- Run `npm run build` and `npm run typecheck` after non-trivial edits.
- The split validator throws on bad data — if a beat is added or edited, ensure its splits sum to 100.
