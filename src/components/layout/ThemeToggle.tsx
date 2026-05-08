"use client";

import { useSyncExternalStore } from "react";

/**
 * Discreet light/dark toggle. Default theme is dark.
 *
 * `useSyncExternalStore` is the proper React primitive for "the source of truth
 * lives outside React" — in our case, the `class` on <html>, which is set by
 * the no-flash boot script in app/layout.tsx and updated by this button.
 *
 * Using `useSyncExternalStore` avoids the `react-hooks/set-state-in-effect`
 * lint error from earlier (calling setState inside useEffect to mirror DOM
 * state) and keeps the toggle in lockstep with the underlying class even if
 * something else mutates it (e.g. a future "match system" preference).
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToHtmlClass,
    getThemeFromHtml,
    getServerSnapshot,
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable (private browsing, sandboxed iframes, etc.) — fine.
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/* ---- external store glue ---- */

function getThemeFromHtml(): "light" | "dark" {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function getServerSnapshot(): "light" | "dark" {
  // The boot script in <head> defaults to "dark" if there's no stored preference,
  // and that matches the SSR-rendered class on <html>. So "dark" is the safe SSR snapshot.
  return "dark";
}

function subscribeToHtmlClass(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/* ---- icons ---- */

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 19.07 1.41-1.41" />
      <path d="m17.66 6.34 1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
