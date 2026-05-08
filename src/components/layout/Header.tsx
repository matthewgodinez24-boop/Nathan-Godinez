"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full glass transition-colors duration-300",
        scrolled ? "border-b" : "border-b border-transparent",
      )}
      style={{ borderColor: scrolled ? "var(--line)" : "transparent" }}
    >
      <nav className="container-x flex h-12 items-center justify-between text-[13px]">
        <Link href="/" className="display text-[17px] tracking-tight">
          {site.artist.name}
        </Link>
        <ul className="flex items-center gap-7">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="opacity-80 transition-opacity hover:opacity-100"
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
