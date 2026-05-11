# Project Log

Append a new entry at the TOP for each work session. Read `CLAUDE.md` first for stable project context; this file is the running history.

Each entry should answer: **what changed, what's open, what's next, anything broken.** Keep it short.

---

## 2026-05-10 / 11 — Session 1 (Cowork): production dashboard, perf diagnostic, carousel pivot

### What happened
- Built a production dashboard for the site: current site map, file map, launch blockers, UI polish list, content needed from Nathan, 90-minute plan, work queue (Q1–Q13).
- Identified the biggest launch blockers: 15 fake placeholder beats with fictional collaborators (Aria Vega, Marek Holt, Jules Park), explicit "placeholder rights" copy on beat detail pages, disabled Buy buttons, dead social links pointing to platform homepages, `.vercel.app` URL, and `// GUESS`-flagged metadata on the three real beats.
- Diagnosed and wrote a fix prompt for a scroll-jack teleport bug in the old `HorizontalShowcase` design (relative `scrollBy` compensation drifting based on `scrollYProgress` at consume time). Claude Code then refactored the whole component to a different design — see "Carousel pivot."
- Received and reviewed a performance diagnostic from Codex (`perf-diagnostic-codex.md` — NOT currently saved in the repo). Verdict: diagnostic is high-quality. Top issues are global Lenis on JS scroll thread, 7.5MB hero image being transformed every frame, and 20px backdrop blur on the fixed header.
- Wrote four staged prompts for Claude Code to address the perf + Apple-feel work:
  1. Hero image resize + `next/image` migration
  2. Lenis `smoothWheel: false` + remove carousel Lenis-bypass + remove per-card GPU layer hints + fix header scroll listener
  3. Header blur compromise (20px → 8px, remove backdrop-filter transition)
  4. Apple-style carousel polish (peek, pointer-drag, custom easing, floating pill control, active-dot progress fill)

### Key decisions
- **Carousel design pivot.** The "force the user through the horizontal scroll once, then release" mechanic is abandoned. Client wants it to feel as close as possible to apple.com/macbook-pro/'s "Get the highlights" carousel — always-on native scroll-snap, auto-advance with play/pause, pagination dots, peek of adjacent cards, drag-to-pan.
- **Perf approach.** Disable Lenis wheel smoothing (don't remove Lenis entirely — keep it available for programmatic scrollTo). This aligns with the Apple feel since Apple doesn't use a JS smooth-scroll library.
- **Header glass aesthetic.** Keep it, but reduce blur from 20px to 8px and remove the backdrop-filter transition. Compromise between Codex's "remove blur entirely" and the original premium feel.
- **Pass order.** Prompt 2 (perf cleanup) → Prompt 3 (header blur) → Prompt 1 (hero image) → Prompt 4 (carousel polish). Test after each. Revert per-prompt if anything breaks.

### What's open
- **None of the four prompts have been executed yet** — they're staged for the next coding session.
- 15 placeholder beats still in catalog. Q1 from the dashboard work queue (add a `published` flag or remove outright) is unresolved.
- Fake collaborators (Aria Vega, Marek Holt, Jules Park) still in `collaborators.ts`. Q2 is unresolved.
- All other dashboard work-queue items (Q3–Q13) are unresolved.
- Codex's diagnostic file `perf-diagnostic-codex.md` is NOT in the repo — it was shared via chat. Consider committing it for future reference.
- Hero image at `public/images/hero-nathan.jpg` is 6470×5301px, 7.5MB. Needs to be resized to ~2400px WebP. This is the dependency for Prompt 1.

### Next session
1. **Run the four perf/carousel prompts in order.** If the agent doesn't have an image-resize tool, ask Cowork to do the hero resize via shell — it has access.
2. After perf work is verified, return to the dashboard work queue and start picking off Q1 → Q5 (catalog hygiene, fake collaborator removal, license placeholder copy, mailto Buy button, social links).
3. Get Nathan to confirm/correct the `// GUESS` metadata on Leaf, Vigo, Ivy League (key, duration, splits with Barragini, descriptions, `previewStartSec`).

### Nothing broke
No edits committed this session. All work was advisory + planning + writing prompts.

---
