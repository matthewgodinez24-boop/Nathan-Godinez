# STATUS — artist-simple-01 (Nathan Godinez)

> Read this once to onboard. Then `CLAUDE.md` for stable project conventions, `project-log.md` for the running session history, and `LICENSE.md` for repo terms.

**Generated:** 2026-05-11
**Repo:** https://github.com/matthewgodinez24-boop/Nathan-Godinez
**Live:** https://nathan-godinez.vercel.app

---

## 1. Project overview

- **Client:** Nathan Godinez — guitarist, producer, composer (LA). Matthew Godinez's brother.
- **Builder/operator:** Matthew Godinez (freelance web designer; one of six concurrent client projects).
- **Recurring collaborator:** Barragini — co-producer on every live beat (Leaf, Vigo, Ivy League).
- **Goal:** A premium Apple-inspired artist site + beat marketplace that Nathan is proud to share, with a path to real revenue from beat licenses.
- **Target launch:** No firm date. Milestone target proposed to Cowork: **first real sale 6–10 weeks out.**
- **Current state in one sentence:** **Phase 1 site shipped to production, security-audited, no payments wired, three real beats live; awaiting Cowork's Phase 2 plan before next coding work.**

---

## 2. Stack & architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5.7 · Tailwind CSS v4 · Framer Motion 11 · Lenis 1.3 · Vercel hosting · GitHub (public).

**Why:**
- Next.js App Router + Server Components for static-by-default rendering (the entire current site prerenders to static HTML; zero serverless cost in steady state).
- Tailwind v4 for design-token-driven styling, paired with hand-tuned CSS variables for light/dark theming.
- Framer Motion for scroll-coupled hero parallax + section reveals; deliberately *not* used for the carousel.
- Lenis for global smooth scroll, but with `smoothWheel: false` after a perf pass — the library is now kept only for programmatic `scrollTo` calls from the carousel autoplay/dot-jumps, so native wheel scrolling stays on the compositor.
- Vercel for zero-config deploys + automatic image optimization via `next/image`.

**Architecture decisions worth knowing:**
- **Theme:** `useSyncExternalStore` over an `<html>` class. Inline boot script in `app/layout.tsx` prevents flash. Default dark; toggle persisted in localStorage.
- **Catalog data:** Single source of truth in `src/data/{site,beats,collaborators}.ts`. No CMS yet (deferred to Phase 2 Studio).
- **Split math:** Centralized in `src/lib/payouts.ts` with a build-time validator that throws if any beat's collaborator splits don't sum to 100. Stripe-Connect-ready when payments land.
- **Highlights carousel** (`src/components/home/HorizontalShowcase.tsx`): native CSS `scroll-snap` with `scroll-snap-stop: always`. Browser inertia drives the gesture; JS handles only auto-advance, dot clicks (via a custom rAF ease-out `smoothScrollTo`), mouse pointer-drag, and a Lenis bypass for horizontal-dominant wheel events. **Do not reintroduce JS-driven transform sliders or scroll-jacking** — the carousel was rebuilt ~7 times before landing here.
- **Security headers:** baseline `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` set in `next.config.ts`. CSP intentionally not added yet (theme-boot inline script needs a hash/nonce strategy — separate session).

**Inherited from a previously-shipped artist site:** No direct evidence in this repo's git history of code inherited from a prior project. Sibling folders exist at `~/Desktop/client-sites/` (`artist-simple-02`, `artist-simple-03`, `beat-seller-site`, `filmmaker-site`, `tattoo-shop-site`) which may share patterns, but no shared code lives between them today. *Recommend confirming with Matthew before assuming inheritance.* See §7 for what *should* be promoted to a shared library.

---

## 3. DONE

### Pages (all live, all static-prerendered)
- `/` — home: Hero → Highlights carousel → Featured beats → Collaboration → CTA → Footer.
- `/beats` — marketplace grid with filters (type, genre, mood, key, BPM, sort).
- `/beats/[slug]` — beat detail with split breakdown + license tier selector. Static-generated for every slug.
- `/about` — bio + approach copy.
- `/contact` — email, phone, socials over a full-bleed background image.

### Features
- Dark/light theme toggle (default dark) with no-flash boot.
- Global smooth scroll (Lenis, programmatic only).
- Apple "Get the highlights"-style horizontal carousel — peek of adjacent cards, custom easing on programmatic scrolls, mouse drag, auto-advance with play/pause, floating glass pill control, active-dot progress fill.
- Hero with scroll-coupled scale + parallax (respects `prefers-reduced-motion`).
- Reduced-motion fallback for the carousel: static 2-column grid of the same cards.
- Filterable marketplace (type, genre, mood, key, BPM range, sort by featured/newest/price).
- Tagged audio preview player with a 10-second client-side cap.
- Collaborator split math validated at module load time (throws on bad data).
- Floating glass header that transitions from white-on-photo to glass-on-content past the hero.
- Baseline security headers in production (verified live).

### Catalog (real)
- **3 real beats:** Leaf (120 BPM, A min, Hip-Hop, Nathan/Barragini 60/40), Vigo (98 BPM, F min, Afrobeats, 50/50), Ivy League (95 BPM, A min, Hip-Hop, 50/50).
- **2 real collaborators:** `self` (Nathan), `barragini`.

### Operational
- Repo public on GitHub with LICENSE (all rights reserved, view-only for portfolio review).
- Deployed to Vercel (`nathan-godinez.vercel.app`).
- Codex security audit completed — no Critical or High findings.

---

## 4. IN PROGRESS

No active in-flight code work. The most recent commits closed out a security audit follow-up + hero-image perf pass + a client-reported hero blur fix (re-resized to 3840px so retina displays render sharp).

The current active work surface is **planning, not coding:**
- Cowork has been formally engaged as PM/GTM/manager (mandate at `~/Desktop/client-sites/artist-simple-01/_cowork-mandate.md`, *not* in the public repo).
- Cowork's first three deliverables are queued: Phase 2 plan (Stripe vs Studio sequencing), asset provenance plan (Pinterest replacement + real cover art), and GTM v0 (audience, channels, launch story).
- Awaiting four operational decisions from Matthew before Cowork is fully operational: weekly hours, target launch date, budget caps, Nathan communication cadence.

---

## 5. NOT STARTED

### Code/features
- **Payments.** No Stripe integration. Buy buttons intentionally disabled. Plan: Stripe Connect (so each collaborator gets direct payouts). Sequenced as Phase 2a (test mode) → 2b (one beat live) → 2c (all beats live).
- **Studio (CMS).** No admin interface for Nathan to add/edit beats, pick `previewStartSec`, upload cover art, or see order history. Planned: Sanity Studio mounted at `/studio` with `Beat`, `Collaborator`, `SiteContent` schemas. ~4–6h of work. The audio-preview generation pipeline lives inside this.
- **Order persistence.** No database. Will be needed when payments land (record buyer email, license tier, delivery state). Candidates: Postgres on Neon, SQLite on Turso, Supabase.
- **Signed download URLs.** Untagged masters need to live in private object storage (R2 / S3 / Bunny). On successful payment webhook, generate a short-lived signed URL emailed to the buyer.
- **License PDF generation.** Per-buyer PDF on order completion with buyer name, beat title, tier, date.
- **Mailing list signup.** Nothing wired.
- **Analytics.** Nothing wired.
- **Custom domain.** Still on `.vercel.app`.
- **404 page.** Using Next.js default; no custom design.

### Content/assets the client hasn't given us yet
- Real cover art for the 3 live beats. Currently rendered as generated SVG silhouettes — placeholder, not for marketing.
- A licensed/owned replacement for `public/images/contact-background.jpg` (currently a Pinterest-sourced image — copyright risk on a public repo, flagged Medium in the Codex audit).
- Confirmation of `// GUESS`-flagged metadata on Leaf/Vigo/Ivy League: key, exact duration, splits with Barragini, longer descriptions, preferred `previewStartSec`.
- Real 10-second tagged preview MP3s. The currently-served `*-preview.mp3` files are 6–8 MB full tracks behind a JS-only 10s UI cap — anyone can download the master via the public URL. Deferred to Studio (Nathan will pick `previewStartSec` per beat in the admin UI; preview generation happens at ingest).
- Decision on whether Songs / Scores categories will produce real catalog or stay aspirational. Affects whether those highlight cards earn their slots.

---

## 6. Blockers

### Hard blockers (Phase 2a cannot start until these resolve)
- **Lawyer review of license language.** `STANDARD_LICENSES` and `LOOP_LICENSES` in `src/data/beats.ts` were drafted by the builder, not a lawyer. Must be reviewed (or replaced with a vetted template) before any real money flows. This is a precondition, not a coding task. Owner: Cowork to engage Nathan; Nathan to find lawyer or vetted template.
- **Cowork's Phase 2 plan.** Needs to land before any new technical scope is opened. Owner: Cowork.

### Decision blockers (Matthew needs to answer for Cowork)
- Weekly hours commitment to this project (suggested 3–5h/week).
- Target launch date for first real sale (suggested 6–10 weeks).
- Budget caps for lawyer / asset licensing / paid tools (suggested $0 default, item-by-item asks).
- Communication cadence with Nathan.

### Asset blockers (waiting on Nathan, Cowork to chase)
- Licensed replacement for `contact-background.jpg`.
- Real cover art for the 3 live beats.
- Confirmed beat metadata (replace `// GUESS` markers).

### Watching, not blocking
- **postcss CVE through Next.js** (GHSA-qx2v-qp2m-jg93, Medium). Not exploitable here (no user input → CSS). Don't `npm audit fix --force`. Track Next.js patch releases.

---

## 7. Reuse from the previous artist site

**Direct code inheritance:** No evidence in git history of this repo being forked or copied from a prior project. Earliest commits are scaffolds, not imports.

**What sibling folders exist** (at `~/Desktop/client-sites/`): `artist-simple-02`, `artist-simple-03`, `beat-seller-site`, `filmmaker-site`, `tattoo-shop-site`. Whether any of these share patterns with `artist-simple-01` is unverified from this repo's perspective. **Recommend asking Matthew directly.**

**What should be promoted to a shared foundation library** (if Matthew is going to build more artist/musician sites — which the folder structure suggests):

1. **Theme system.** The `useSyncExternalStore` + `<html>` class + inline boot script pattern is reusable across any dark/light marketing site.
2. **Smooth scroll wiring.** The `SmoothScroll.tsx` Lenis setup with `smoothWheel: false` + `window.__lenis` exposure is reusable.
3. **`ScrollReveal` / motion primitives.** Standard fade+slide on intersection; respects reduced-motion. Generic.
4. **Apple-style highlights carousel.** `HorizontalShowcase.tsx` is the longest-iterated piece of this site (~7 redesigns). Should be extracted as a configurable component for reuse on future artist sites. Worth a refactor pass before promotion.
5. **Split math** (`src/lib/payouts.ts`). Stripe-Connect-ready payout calc with rounding-to-largest-holder. Generic — works for any collaborator-driven marketplace.
6. **Tagged audio preview player** (`AudioPreview.tsx`). The 10s-cap pattern + ref-based player coordination (once built) belong in a beat-marketplace foundation.
7. **Glass nav** + theme-aware floating-vs-glass transition pattern (`Header.tsx`). Generic.

**What should *not* be promoted yet:**
- `BeatCover.tsx` silhouette renderer is too Nathan-specific until the placeholder-art strategy is decided across sites.
- Catalog data shape (`Beat` type) — the design review noted it should be renamed `Product` if it's going to be reused. Defer until reuse is committed.

This is a Cowork conversation, not a tonight conversation: *is Matthew building a "musician marketplace template" business, or six bespoke client sites?* That answer drives whether to extract a shared library now or stay project-by-project.

---

## 8. File structure (top 3 levels)

```
03-website/
├── CLAUDE.md                  # stable project context (for AI agents)
├── LICENSE.md                 # all-rights-reserved, view-only
├── README.md                  # human-facing project doc
├── STATUS.md                  # this file
├── project-log.md             # running session history
├── package.json
├── package-lock.json
├── next.config.ts             # security headers + image config
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── .claude/
│   └── launch.json            # local dev server config (for Claude Code preview)
├── public/
│   ├── audio/                 # 3 *-preview.mp3 files (full tracks; needs Studio)
│   └── images/
│       ├── beats/             # cover art slot (currently SVG-generated, no files)
│       ├── contact-background.jpg  # Pinterest-sourced — TO REPLACE
│       └── hero-nathan.jpg    # 3840px JPEG, 87% smaller than original
└── src/
    ├── app/
    │   ├── layout.tsx         # mounts Header/Footer/SmoothScroll; validates splits
    │   ├── page.tsx           # home composition
    │   ├── globals.css        # Tailwind v4 + CSS vars + reduced-motion handling
    │   ├── about/
    │   ├── beats/
    │   └── contact/
    ├── components/
    │   ├── SmoothScroll.tsx   # Lenis init
    │   ├── home/              # Hero, HorizontalShowcase, FeaturedBeats, etc.
    │   ├── layout/            # Header, Footer, ThemeToggle
    │   ├── marketplace/       # BeatGrid, BeatCard, BeatCover, FilterBar, AudioPreview, BeatDetail
    │   ├── motion/            # ScrollReveal
    │   └── ui/                # (reserved, currently empty)
    ├── data/
    │   ├── site.ts            # all sitewide copy (single source of truth)
    │   ├── beats.ts           # catalog + license tier definitions
    │   └── collaborators.ts   # collaborator directory
    ├── lib/
    │   ├── payouts.ts         # validateSplits, computePayoutsCents
    │   └── utils.ts           # cn, formatPrice, formatDuration
    └── styles/                # (currently empty, reserved)
```

**Cowork-side files** (in the parent folder `~/Desktop/client-sites/artist-simple-01/`, *not* in this repo):
- `_cowork-mandate.md` — Cowork's operating contract.
- `_cowork-handoff.md` — original engagement brief (2026-05-10).
- `_cowork-forwards/` — time-stamped forwards to Cowork (Codex audit, marketplace planning, etc.).

---

## 9. Last 5–10 significant changes (plain English)

Most recent first.

1. **Re-resized hero image to 3840px** (commit `37d8d74`). The 2400px version had visible blur on retina displays at 100vw; bumped source resolution while keeping `next/image` to handle responsive srcset generation.
2. **Logged late-session audit follow-up + marketplace planning forward to Cowork** (`a050c57`). Updated `project-log.md`.
3. **Hero image perf: 7.8 MB → 1.0 MB and switched to `next/image`** (`b70be80`). Resized JPEG source from 6470×5301 to 2400px (later bumped to 3840 — see #1). Replaced raw `<img>` with `<Image>` using `fill`, `priority`, `sizes="100vw"`.
4. **Security audit follow-up: baseline headers + README polish + stale-note fix** (`0df3757`). Added 4 security headers in `next.config.ts`; rewrote README with live link, correct stack version, "what's interesting" portfolio framing; corrected CLAUDE.md "no GitHub remote yet" line.
5. **Portfolio prep: scrubbed working-state from docs; added LICENSE** (`715cd58`). Removed admissions about placeholder catalog and unreviewed license language from `CLAUDE.md` and `project-log.md` before flipping the repo public. Added `LICENSE.md`.
6. **Stopped tracking `tsconfig.tsbuildinfo`** (`064f40b`). Build artifact had been committed despite `.gitignore` rule; `git rm --cached` to untrack.
7. **Apple-style carousel polish + perf cleanup + project memory files** (`d949de9`). Card peek (~85vw→90vw), pointer-drag for mouse, custom rAF ease-out scroll, floating glass pill control, active-dot progress fill. Page-wide perf: Lenis `smoothWheel: false`, removed `html { scroll-behavior: smooth }`, halved header backdrop blur 20px→8px, debounced header scroll listener. First commit of `CLAUDE.md` and `project-log.md`.
8. **Wheel-swipe freeze fix** (`af58c58`). Carousel froze after a single trackpad swipe because trackpad inertia kept resetting an unlock timer; replaced with 120ms time-gap gesture detection. (This was in the pre-native-scroll-snap era of the carousel.)
9. **Full-bleed 82vh cards + controls bottom-center + non-passive wheel listener** (`22ca24d`). Earlier carousel iteration.
10. **Transform-based slider with pointer drag** (`6022394`). Earliest of the carousel rewrites still in history; superseded twice over since.

For a more detailed running log including the architectural reasoning behind the carousel pivots, see `project-log.md`.

---

## 10. Recommended next steps

In priority order, if Matthew were to keep going right now:

1. **Wait for Cowork.** Cowork's first three deliverables (Phase 2 plan, asset provenance plan, GTM v0) are queued and will arrive next session. Don't pre-empt them.
2. **Once Cowork's Phase 2 plan lands, write the technical spec for Phase 2a (Stripe Connect test mode).** This is Claude Code's job, not Cowork's. The spec should cover: which beat goes first, the checkout API route shape, the webhook signature verification, server-computed pricing, Stripe Connect onboarding flow for Nathan + Barragini, and the test-card verification matrix.
3. **Studio (CMS) decision.** Sanity vs. a lightweight admin route written in Next.js. The decision affects whether Studio happens before or in parallel with Stripe. Cowork should sequence this in the Phase 2 plan.
4. **Asset ingestion.** Once Nathan delivers real photos and cover art (chased by Cowork), swap them in. 5-minute job per asset; should not block on this — it's a content task.
5. **Custom domain.** Cheap to do, unlocks marketing. Cowork should include this in launch checklist.
6. **Analytics + email signup.** Both nice-to-have for launch but not blockers for first sale.
7. **`ASSETS.md` in repo.** Record provenance of every image/audio file as it lands. Codex flagged this as a "larger investment" worth doing.
8. **Studio + asset coordination** could justify extracting a "musician marketplace foundation" library (see §7) IF Matthew commits to more artist-site clients. This is a Cowork-level conversation about the operator's business shape, not just this project.

---

## Single most important next action

**Matthew answers Cowork's four operational questions** (weekly hours, target launch date, budget caps, Nathan cadence). Without those, Cowork can produce drafts but can't commit to a phased plan with concrete dates. Everything else queued behind this.
