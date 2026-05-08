"use client";

import { useEffect } from "react";

/**
 * Forces the browser to land at the top of the homepage on every load.
 *
 * Without this, browser scroll restoration would drop the user back at
 * whatever scroll position they had previously — which on a page with a
 * scroll-jacked section means they can land in the middle of the showcase
 * with no context. Client report: "Sometimes loads in middle of the website."
 *
 * Also disables history.scrollRestoration so back-forward navigation behaves
 * the same way.
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
