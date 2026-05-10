"use client";

import { useEffect } from "react";

/**
 * Forces the homepage to land at the top, but only on a fresh visit (showcase
 * not yet consumed in this tab).
 *
 * - Fresh visit: showcase will render the tall scroll-jacked mode. If browser
 *   scroll restoration drops the user mid-page, they land inside the cinematic
 *   with no context. Force-to-top puts them at the hero, ready to scroll in.
 * - Returning visit (consumed flag set): showcase renders the short
 *   PassThroughRow. We let the browser handle scroll naturally so back/forward
 *   nav and tab restore feel right.
 *
 * `history.scrollRestoration = "manual"` is set unconditionally so we always
 * own the policy.
 */
export function ScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    let consumed = false;
    try {
      consumed = sessionStorage.getItem("showcase-consumed") === "1";
    } catch {
      // storage blocked → treat as fresh visit, force to top
    }
    if (!consumed) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);
  return null;
}
