"use client";

import { useEffect } from "react";

/**
 * Forces the homepage to land at the top on every mount.
 *
 * Why:
 * - The showcase below the hero is a tall scroll-jacked section. If the
 *   browser restores a stale mid-page scrollY (cmd+R, back-forward), the
 *   user lands inside the cinematic with no context. Forcing top → they
 *   start at the hero, every time.
 * - We also disable native `history.scrollRestoration` so back-forward
 *   navigation doesn't override us.
 *
 * Trade-off: navigating /store → / lands at the top of the home page rather
 * than wherever they last were. Acceptable because home, /store, /about, and
 * /contact have different layouts — preserving scrollY across them isn't
 * meaningful anyway.
 */
export function ScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  return null;
}
