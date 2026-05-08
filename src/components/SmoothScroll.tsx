"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll — initializes Lenis to smooth the page's scroll velocity.
 *
 * What this does, concretely:
 * - User triggers a scroll event (wheel, trackpad, touch). Native scroll input
 *   arrives in chunks — that's why mapping scrollY 1:1 to a transform feels
 *   "chunky" or "stuttery" on a heavy scroll-jacked section.
 * - Lenis intercepts those chunks and lerps `window.scrollY` toward the target
 *   on a requestAnimationFrame loop. The result is a continuous scrollY value
 *   that updates every frame.
 * - Framer Motion's `useScroll` reads `window.scrollY` and drives the showcase's
 *   horizontal transform from it. With Lenis driving the input, every transform
 *   that depends on scroll position gets buttery for free — no per-component
 *   spring smoothing required.
 *
 * Tuned for an Apple-product-page feel:
 * - Long-tail easing (exponential out, slightly slower than default)
 * - `lerp` of 0.085 → tight tracking but no jitter
 * - `wheelMultiplier` slightly > 1 → wheel and trackpad respond fast on entry
 *   but the tail decelerates smoothly
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Honor prefers-reduced-motion — never override the system scroll if the
    // user has explicitly opted out of motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.085,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
