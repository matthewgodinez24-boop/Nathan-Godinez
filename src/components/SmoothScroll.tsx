"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Make the global Lenis instance reachable from anywhere on the client.
 * Other components (e.g. HorizontalShowcase's scroll-compensation effect)
 * use this so they can call `lenis.scrollTo(..., { immediate: true })`
 * instead of `window.scrollBy` and avoid fighting Lenis's smoothing target.
 */
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * SmoothScroll — initializes Lenis to smooth the page's scroll velocity.
 *
 * Lenis intercepts wheel/touch input and lerps `window.scrollY` toward the
 * target on a requestAnimationFrame loop. Framer Motion's `useScroll` reads
 * the smoothed value, so every scroll-coupled animation gets buttery for free.
 *
 * Tuned conservatively — tight tracking, no floaty feel.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Lenis is kept around only for programmatic scrollTo (used by the
      // carousel autoplay/dots indirectly via window.__lenis if needed) —
      // wheel and touch are intentionally NOT smoothed by Lenis so the
      // browser can keep native scroll on the compositor thread. The
      // duration/easing/lerp values still drive any programmatic scroll.
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
      smoothWheel: false,
      // (Lenis 1.3 doesn't expose a smoothTouch option; touch is governed by
      // syncTouch which defaults to off, i.e. native touch behavior.)
    });
    window.__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      if (window.__lenis === lenis) delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
