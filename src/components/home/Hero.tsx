"use client";

import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import { site } from "@/data/site";

/**
 * Hero — full-bleed photo with overlaid headline.
 *
 * Photo lives at site.artist.portrait (default /images/hero-nathan.jpg).
 * On scroll: image scales (Apple iPhone hero pattern), text fades + lifts out.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [1, 1] : [1.05, 1.18],
  );
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [0, -40],
  );

  return (
    <section
      ref={ref}
      className="relative h-[100dvh] min-h-[640px] overflow-hidden"
      aria-label={`${site.artist.name} — ${site.artist.tagline}`}
    >
      {/* Photo — fills the viewport */}
      <motion.div
        style={{ scale: imgScale, y: imgY }}
        className="absolute inset-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={site.artist.portrait}
          alt={`${site.artist.name} in the studio`}
          className="h-full w-full object-cover"
          // High priority — this is the largest contentful paint
          fetchPriority="high"
          decoding="async"
        />
      </motion.div>

      {/* Legibility gradients — strong at bottom for the headline, soft at top for nav */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, rgb(0 0 0 / 0.65) 0%, rgb(0 0 0 / 0.25) 35%, transparent 60%),
            linear-gradient(to bottom, rgb(0 0 0 / 0.25), transparent 25%)
          `,
        }}
      />

      {/* Overlaid copy */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 flex h-full items-end"
      >
        <div className="container-x w-full pb-[clamp(2.5rem,7vh,5rem)] text-white">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12px] uppercase tracking-[0.25em] opacity-85"
          >
            {site.artist.name}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="display mt-4 max-w-3xl text-[clamp(2.75rem,8vw,6rem)]"
          >
            {site.hero.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="mt-5 max-w-xl text-[clamp(1rem,1.4vw,1.2rem)] opacity-90"
          >
            {site.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3 text-[15px]"
          >
            <Link
              href={site.hero.primaryCta.href}
              className="rounded-full bg-white px-5 py-2.5 text-black transition-opacity hover:opacity-90"
            >
              {site.hero.primaryCta.label} →
            </Link>
            <Link
              href={site.hero.secondaryCta.href}
              className="rounded-full px-5 py-2.5 underline-offset-4 hover:underline"
              style={{ color: "#7ab8ff" }}
            >
              {site.hero.secondaryCta.label} →
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white"
      >
        <span>Scroll</span>
        <span aria-hidden className="block h-[1px] w-8 bg-white/60" />
      </motion.div>
    </section>
  );
}
