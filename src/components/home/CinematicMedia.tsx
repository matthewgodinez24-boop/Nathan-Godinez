"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { site } from "@/data/site";

export function CinematicMedia() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [1.08, 1, 1.02]);
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [60, -60]);

  return (
    <section
      id="cinematic"
      ref={ref}
      className="section relative"
      style={{ background: "var(--bg-soft)" }}
    >
      <div className="container-x">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="display max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)]"
          >
            {site.cinematic.headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="max-w-md text-[15px]"
            style={{ color: "var(--fg-soft)" }}
          >
            {site.cinematic.sub}
          </motion.p>
        </div>

        <motion.div
          style={{ y }}
          className="relative aspect-[16/9] overflow-hidden rounded-2xl"
        >
          <motion.div style={{ scale }} className="absolute inset-0">
            {site.cinematic.videoSrc ? (
              <video
                src={site.cinematic.videoSrc}
                poster={site.cinematic.posterImage}
                autoPlay
                muted
                playsInline
                loop
                className="h-full w-full object-cover"
              />
            ) : (
              <CinematicImage src={site.cinematic.posterImage} />
            )}
          </motion.div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgb(0 0 0 / 0.55), transparent 45%), linear-gradient(to bottom, rgb(0 0 0 / 0.15), transparent 35%)",
            }}
          />
          <div className="absolute bottom-6 left-6 max-w-sm text-white">
            <p className="display text-[clamp(1.25rem,2.2vw,1.75rem)]">
              {site.artist.name}
            </p>
            <p className="mt-1 text-[13px] opacity-80">{site.artist.tagline}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CinematicImage({ src }: { src: string }) {
  // If the file exists at /public/<src>, the img loads; if it 404s we fall through to PlaceholderArt.
  // Marked client-only via parent ("use client") so onError works.
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <PlaceholderArt />
    </>
  );
}

function PlaceholderArt() {
  return (
    <svg viewBox="0 0 1600 900" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cinematic-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="55%" stopColor="#1a1a1f" />
          <stop offset="100%" stopColor="#3a2f4a" />
        </linearGradient>
        <radialGradient id="cinematic-glow" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0%" stopColor="rgba(255, 220, 160, 0.32)" />
          <stop offset="100%" stopColor="rgba(255, 220, 160, 0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#cinematic-bg)" />
      <rect width="1600" height="900" fill="url(#cinematic-glow)" />
      {/* Stylized guitar silhouette */}
      <g
        transform="translate(820,470) rotate(-22)"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
      >
        <ellipse cx="0" cy="0" rx="180" ry="120" />
        <ellipse cx="0" cy="0" rx="55" ry="55" />
        <rect x="170" y="-12" width="320" height="24" rx="6" />
        <rect x="490" y="-26" width="60" height="52" rx="6" />
        <line x1="-110" y1="-10" x2="490" y2="-10" />
        <line x1="-110" y1="0" x2="490" y2="0" />
        <line x1="-110" y1="10" x2="490" y2="10" />
      </g>
    </svg>
  );
}
