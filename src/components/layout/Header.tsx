"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Floating header. No filled bar, no black strip.
 * Over the hero (white text on photo). After scrolling past the hero, swap to
 * theme text + a hairline glass strip — never a heavy bar.
 */
export function Header() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Switch state once we've cleared most of the hero — the photo ends around 100dvh.
      const threshold = Math.max(window.innerHeight * 0.85, 480);
      setPastHero(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color,color] duration-500",
        pastHero ? "border-b" : "border-b border-transparent",
      )}
      style={{
        // Transparent over hero; soft glass + hairline once past it.
        background: pastHero
          ? "color-mix(in srgb, var(--bg) 72%, transparent)"
          : "transparent",
        backdropFilter: pastHero ? "saturate(180%) blur(20px)" : "none",
        WebkitBackdropFilter: pastHero ? "saturate(180%) blur(20px)" : "none",
        borderColor: pastHero ? "var(--line)" : "transparent",
        color: pastHero ? "var(--fg)" : "#ffffff",
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
        {/* Nav stays in the standard container on the right */}
        <div className="ml-auto container-x flex items-center justify-end gap-7">
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
