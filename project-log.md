# Project Log

Append a new entry at the TOP for each work session. Read `CLAUDE.md` first for stable project context; this file is the running history.

Each entry should answer: **what changed, what's open, what's next, anything broken.** Keep it short.

---

## 2026-05-11 — Apple "Get the highlights" carousel + page-wide perf pass

### What shipped
- Homepage highlights section reworked to match Apple's "Get the highlights" carousel pattern:
  - Native CSS `scroll-snap` with `scroll-snap-stop: always` (browser inertia drives the gesture, same physics as macOS trackpad scroll).
  - Adjacent-card peek via matched `padding-inline` + `scroll-padding-inline`.
  - Custom `rAF` ease-out for auto-advance, dot-jumps, and drag-release snaps (snap-type briefly disabled during the JS animation so the browser doesn't fight the writes).
  - Mouse pointer-drag (`pointerdown`/`move`/`up`, gated to `pointerType === "mouse"`); trackpad and touch use native scroll unchanged.
  - Floating glass pill with pagination dots + play/pause, anchored to the bottom of the carousel viewport.
  - Active-dot fills left-to-right over the 6s dwell time via a CSS keyframe keyed on `${activeIndex}-${isPlaying}`.
- Page-wide scroll perf cleanup (driven by an external diagnostic):
  - Lenis kept for programmatic `scrollTo` only — `smoothWheel: false` so native wheel stays on the compositor.
  - Removed `html { scroll-behavior: smooth }` so there's only one smoothing system.
  - Reduced fixed-header backdrop blur from 20px to 8px and dropped `backdrop-filter` from the transitioned property list.
  - Removed per-card `translateZ(0)`/`backface-visibility`/`contain: paint` left over from the transform-based carousel — now overhead, not help, since the cards are inside a native scroll container.
  - Debounced the header scroll listener to fire `setState` only on threshold crossings, not every frame.

### Architecture decision (carousel)
The carousel went through several earlier iterations (scroll-jacked tall wrapper, ratcheted `MotionValue`, transform-based JS slider with velocity + dynamic duration). All failed to match Apple's feel because trying to imitate native trackpad inertia in JS is a losing game — the OS's scroll engine is on a thread JS can't touch. The final native scroll-snap implementation is much smaller, faster, and feels right.

### What's open
- Hero image (`public/images/hero-nathan.jpg`) is 6470×5301 / 7.5 MB and rendered via raw `<img>` with scroll-coupled transform. Should be resized to ~2400px WebP and switched to `next/image` with `priority` + `sizes="100vw"`. Largest remaining perf hit.
- Beat covers currently render as inline SVG silhouettes; real cover art is a content task for Nathan.
- No Stripe Connect; buy buttons disabled by design.
- No CMS yet; Sanity at `/studio` is a candidate for Phase 2.

### Nothing broke
Three checks (`lint`, `typecheck`, `build`) clean. Live at `https://nathan-godinez.vercel.app`.

---
