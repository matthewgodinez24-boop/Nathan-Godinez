"use client";

import { ALL_GENRES, ALL_KEYS, ALL_MOODS, type Mood } from "@/data/beats";
import { cn } from "@/lib/utils";

export type SortKey = "newest" | "popular" | "price-asc" | "price-desc";

export type Filters = {
  query: string;
  genres: string[];
  moods: Mood[];
  keys: string[];
  bpmMin: number;
  bpmMax: number;
  priceMin: number;
  priceMax: number;
  sort: SortKey;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  genres: [],
  moods: [],
  keys: [],
  bpmMin: 60,
  bpmMax: 180,
  priceMin: 0,
  priceMax: 500,
  sort: "newest",
};

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
};

export function FilterBar({ filters, onChange, resultCount }: Props) {
  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item];
  }

  return (
    <aside
      className="sticky top-12 z-30 -mx-4 mb-8 border-b px-4 py-5"
      style={{
        borderColor: "var(--line)",
        background: "color-mix(in srgb, var(--bg) 90%, transparent)",
        backdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search beats…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="h-10 flex-1 min-w-[180px] rounded-full border bg-transparent px-4 text-[14px] outline-none transition focus:border-[color:var(--color-accent)]"
          style={{ borderColor: "var(--line)" }}
        />

        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
          className="h-10 rounded-full border bg-transparent px-4 text-[14px] outline-none"
          style={{ borderColor: "var(--line)" }}
          aria-label="Sort"
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3 lg:grid-cols-4">
        <FilterGroup label="Genre">
          <ChipRow
            items={ALL_GENRES}
            active={filters.genres}
            onToggle={(g) => onChange({ ...filters, genres: toggle(filters.genres, g) })}
          />
        </FilterGroup>

        <FilterGroup label="Mood">
          <ChipRow
            items={ALL_MOODS as readonly string[]}
            active={filters.moods as readonly string[]}
            onToggle={(m) =>
              onChange({ ...filters, moods: toggle(filters.moods, m as Mood) })
            }
          />
        </FilterGroup>

        <FilterGroup label="Key">
          <ChipRow
            items={ALL_KEYS}
            active={filters.keys}
            onToggle={(k) => onChange({ ...filters, keys: toggle(filters.keys, k) })}
          />
        </FilterGroup>

        <FilterGroup label={`BPM · ${filters.bpmMin}–${filters.bpmMax}`}>
          <RangeRow
            min={60}
            max={180}
            valueMin={filters.bpmMin}
            valueMax={filters.bpmMax}
            onChange={(lo, hi) => onChange({ ...filters, bpmMin: lo, bpmMax: hi })}
          />
        </FilterGroup>
      </div>

      <div
        className="mt-5 flex items-center justify-between text-[12px]"
        style={{ color: "var(--fg-mute)" }}
      >
        <span>{resultCount} beats</span>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="underline-offset-4 hover:underline"
        >
          Reset filters
        </button>
      </div>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="mb-2 text-[11px] uppercase tracking-[0.18em]"
        style={{ color: "var(--fg-mute)" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipRow({
  items,
  active,
  onToggle,
}: {
  items: readonly string[];
  active: readonly string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const isActive = active.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] transition",
              isActive
                ? "border-transparent bg-[color:var(--fg)] text-[color:var(--bg)]"
                : "hover:border-[color:var(--fg)]",
            )}
            style={!isActive ? { borderColor: "var(--line)" } : undefined}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function RangeRow({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (lo: number, hi: number) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onChange={(e) =>
          onChange(Math.min(parseInt(e.target.value), valueMax - 1), valueMax)
        }
        aria-label="Min BPM"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onChange={(e) =>
          onChange(valueMin, Math.max(parseInt(e.target.value), valueMin + 1))
        }
        aria-label="Max BPM"
      />
    </div>
  );
}
