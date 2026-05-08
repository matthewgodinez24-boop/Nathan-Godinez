"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { beats, type Beat } from "@/data/beats";
import { BeatCard } from "./BeatCard";
import { FilterBar, DEFAULT_FILTERS, type Filters } from "./FilterBar";

export function BeatGrid() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => filterAndSort(beats, filters), [filters]);

  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <p
          className="py-24 text-center text-[14px]"
          style={{ color: "var(--fg-mute)" }}
        >
          No beats match those filters. Try widening the BPM range or removing tags.
        </p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((beat) => (
              <motion.div
                key={beat.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <BeatCard beat={beat} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}

function filterAndSort(input: Beat[], f: Filters): Beat[] {
  const q = f.query.trim().toLowerCase();
  const result = input.filter((b) => {
    if (q) {
      const haystack = [
        b.title,
        b.genre,
        b.key,
        b.productType,
        ...b.moods,
        ...b.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.productTypes.length && !f.productTypes.includes(b.productType)) return false;
    if (f.genres.length && !f.genres.includes(b.genre)) return false;
    if (f.moods.length && !b.moods.some((m) => f.moods.includes(m))) return false;
    if (f.keys.length && !f.keys.includes(b.key)) return false;
    // Sample kits store BPM=0 — exclude only when both ends of the range are tighter than 0.
    if (b.bpm > 0 && (b.bpm < f.bpmMin || b.bpm > f.bpmMax)) return false;
    if (b.priceFrom < f.priceMin || b.priceFrom > f.priceMax) return false;
    return true;
  });

  switch (f.sort) {
    case "newest":
      result.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
      break;
    case "popular":
      // PLACEHOLDER — until we have real play/sale counts, "popular" mirrors featured then newest
      result.sort((a, b) => {
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        if (af !== bf) return bf - af;
        return b.releasedAt.localeCompare(a.releasedAt);
      });
      break;
    case "price-asc":
      result.sort((a, b) => a.priceFrom - b.priceFrom);
      break;
    case "price-desc":
      result.sort((a, b) => b.priceFrom - a.priceFrom);
      break;
  }

  return result;
}
