"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pedal, type PedalConfig } from "./Pedal";

/**
 * HorizontalShowcase — pedalboard, displayed as a single-viewport horizontal scroller.
 *
 * One section, one screen tall. User swipes / horizontal-scrolls through pedals.
 * No scroll-jacking — once you scroll past the section, you're past it for good.
 *
 * Design: precise pedalboard frame (charcoal cabinet, hairline rule, leather-grain undertone),
 * four pedals with consistent enclosure, varying finish + knob layout per theme.
 */

const pedals: PedalConfig[] = [
  {
    id: "tone",
    index: "01",
    label: "TONE",
    headline: "Tracked through analog.",
    body: "Tube amps, tape saturation, a real room. The signal chain is the song.",
    finish: "amber",
    layout: "single",
    knobs: [{ label: "TONE", angle: 35 }, { label: "GAIN", angle: -22 }],
    ledColor: "#ff5a3c",
    sublabel: "ANALOG SIGNAL CHAIN",
  },
  {
    id: "craft",
    index: "02",
    label: "CRAFT",
    headline: "Written like a song.",
    body: "Verses, lifts, bridges, drops. Beats with structure so a vocal can live in them.",
    finish: "ivory",
    layout: "quad",
    knobs: [
      { label: "VERSE", angle: -45 },
      { label: "LIFT", angle: 20 },
      { label: "BRIDGE", angle: 60 },
      { label: "DROP", angle: -10 },
    ],
    ledColor: "#5fd47a",
    sublabel: "STRUCTURE FIRST",
  },
  {
    id: "collab",
    index: "03",
    label: "COLLAB",
    headline: "Built with other artists.",
    body: "Vocalists, co-producers, engineers. Every release ships with credits and transparent splits.",
    finish: "cobalt",
    layout: "dual-channel",
    knobs: [
      { label: "VOX", angle: 30 },
      { label: "PROD", angle: -10 },
    ],
    ledColor: "#5ab8ff",
    sublabel: "TWO CHANNELS, ONE RECORD",
  },
  {
    id: "finish",
    index: "04",
    label: "FINISH",
    headline: "Mixed for streaming.",
    body: "Loud where loud belongs, quiet where it counts. Checked across earbuds, monitors, and the car.",
    finish: "midnight",
    layout: "vu-meter",
    knobs: [
      { label: "OUT", angle: 15 },
      { label: "GAIN", angle: -30 },
    ],
    ledColor: "#ffb84a",
    sublabel: "MASTERED FOR LOUD AND QUIET",
  },
];

export function HorizontalShowcase() {
  const reduced = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      aria-label="What goes into a Nathan Godinez record"
      className="relative isolate overflow-hidden"
      style={{
        // Pedalboard cabinet — deep charcoal with a soft warm spotlight
        background:
          "radial-gradient(80% 60% at 50% 35%, #1a1614 0%, #0c0a09 60%, #060504 100%)",
      }}
    >
      {/* Hairline rules — the wooden rails of a real pedalboard */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-12 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-12 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)",
        }}
      />

      {/* Subtle film grain over the cabinet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>")`,
        }}
      />

      {/* Section header */}
      <div className="container-x pb-8 pt-24 text-white">
        <p className="text-[12px] uppercase tracking-[0.25em] opacity-60">
          The Signal Chain
        </p>
        <h2 className="display mt-3 max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)]">
          Four stages, one record.
        </h2>
        <p className="mt-3 max-w-md text-[14px] opacity-70">
          Swipe through the pedals — tone, craft, collaboration, finish.
        </p>
      </div>

      {/* The scroller */}
      <div className="relative">
        <motion.div
          ref={scrollerRef}
          initial={reduced ? false : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-20 pl-[max(2.5rem,calc((100vw-1280px)/2+1.25rem))] pr-[max(2.5rem,calc((100vw-1280px)/2+1.25rem))]"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {pedals.map((p, i) => (
            <PedalPanel key={p.id} pedal={p} index={i} reduced={!!reduced} />
          ))}
        </motion.div>

        {/* Edge fades */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24"
          style={{
            background: "linear-gradient(to right, #060504, transparent)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24"
          style={{
            background: "linear-gradient(to left, #060504, transparent)",
          }}
        />
      </div>

      {/* Bottom rail w/ counter */}
      <div className="container-x flex items-center justify-between pb-16 text-[11px] uppercase tracking-[0.25em] text-white/45">
        <span>Drag · swipe · arrows</span>
        <span>{pedals.length} pedals</span>
      </div>

      {/* Hide horizontal scrollbar */}
      <style>{`
        section [class*="snap-x"]::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

function PedalPanel({
  pedal,
  index,
  reduced,
}: {
  pedal: PedalConfig;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        delay: reduced ? 0 : index * 0.08,
      }}
      className="flex w-[min(86vw,640px)] shrink-0 snap-center flex-col items-center text-center text-white md:w-[min(70vw,540px)]"
    >
      <Pedal config={pedal} className="w-[min(72vw,360px)]" />

      <p className="mt-8 text-[11px] uppercase tracking-[0.3em] opacity-60">
        {pedal.index} — {pedal.label}
      </p>
      <h3 className="display mt-4 max-w-md text-[clamp(1.75rem,3vw,2.5rem)]">
        {pedal.headline}
      </h3>
      <p className="mt-4 max-w-sm text-[14px] leading-relaxed opacity-75">
        {pedal.body}
      </p>
    </motion.article>
  );
}
