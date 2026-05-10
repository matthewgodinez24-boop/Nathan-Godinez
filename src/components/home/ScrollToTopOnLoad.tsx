"use client";

import { useEffect } from "react";

/**
 * Forces the homepage to land at the top — but only on a *fresh* visit, when
 * the cinematic showcase hasn't been consumed yet.
 *
 * Why conditional:
 * - First visit: showcase will render in scroll-jacked mode (~4.6× viewport
 *   tall). If the browser restores a stale mid-page scrollY, the user lands
 *   inside the cinematic with no context. We want them at the hero, ready to
 *   scroll into the experience.
 * - Returning visitor (consumed flag set): showcase renders short, and
 *   navigation flows like back/forward should preserve the user's previous
 *   scroll position. Forcing them to top would break that. So we don't.
 *
 * `history.scrollRestoration = "manual"` is set unconditionally so we always
 * own the policy — the conditional below is purely about whether to *also*
 * snap to the top.
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
