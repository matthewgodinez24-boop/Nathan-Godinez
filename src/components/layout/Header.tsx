"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

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
      <nav className="container-x flex h-12 items-center justify-between text-[13px]">
        <Link
          href="/"
          className="display tracking-tight text-[17px] transition-colors"
        >
          {site.artist.name}
        </Link>
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
      </nav>
    </header>
  );
}
