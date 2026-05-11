"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Floating header.
 *
 * - On the home page (which leads with a full-bleed dark photo): nav text is
 *   white at the top, then transitions to glass + theme color once scrolled
 *   past the hero.
 * - On every other route: always glass + theme color (no photo behind the nav,
 *   so white-over-light would be invisible).
 *
 * This bug was reported by the client: "Light vs dark mode doesn't change
 * the text where it needs to change. Such as the Store."
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Whether the user has scrolled past the hero on the home page. Derived state —
  // off-home routes simply don't subscribe (no scroll listener), and the floating
  // logic below treats them as if the hero is always behind us.
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    let last = false;
    const onScroll = () => {
      const threshold = Math.max(window.innerHeight * 0.85, 480);
      const next = window.scrollY > threshold;
      if (next !== last) {
        last = next;
        setScrolledPastHero(next);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Floating-white state only happens on the homepage above the hero.
  const isFloatingWhite = isHome && !scrolledPastHero;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,border-color,color] duration-500",
        isFloatingWhite ? "border-b border-transparent" : "border-b",
      )}
      style={{
        background: isFloatingWhite
          ? "transparent"
          : "color-mix(in srgb, var(--bg) 72%, transparent)",
        backdropFilter: isFloatingWhite ? "none" : "saturate(160%) blur(8px)",
        WebkitBackdropFilter: isFloatingWhite ? "none" : "saturate(160%) blur(8px)",
        borderColor: isFloatingWhite ? "transparent" : "var(--line)",
        color: isFloatingWhite ? "#ffffff" : "var(--fg)",
      }}
    >
      <nav className="relative flex h-12 items-center text-[13px]">
        {/* Brand pinned to viewport left edge — independent of container padding */}
        <Link
          href="/"
          className="display absolute left-3 sm:left-4 tracking-tight text-[14px] transition-colors"
        >
          Made By {site.artist.name}
        </Link>
        {/* Nav pinned to the right edge of the viewport */}
        <div className="ml-auto flex items-center gap-7 pr-3 sm:pr-5">
          <ul className="flex items-center gap-7">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="opacity-90 transition-opacity hover:opacity-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
