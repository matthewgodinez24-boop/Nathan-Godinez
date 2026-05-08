import Link from "next/link";
import type { Beat } from "@/data/beats";
import { getCollaborator } from "@/data/collaborators";
import { formatPrice } from "@/lib/utils";
import { BeatCover } from "./BeatCover";
import { AudioPreview } from "./AudioPreview";

export function BeatCard({ beat }: { beat: Beat }) {
  const collabNames = beat.splits
    .map((s) => getCollaborator(s.collaboratorId)?.name)
    .filter(Boolean);

  return (
    <Link
      href={`/beats/${beat.slug}`}
      className="lift group block overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--line)", background: "var(--bg)" }}
    >
      <div className="relative aspect-square overflow-hidden">
        <BeatCover beat={beat} className="absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(to top, rgb(0 0 0 / 0.6), transparent 50%)",
          }}
        />
        <div className="absolute bottom-3 right-3">
          <AudioPreview src={beat.previewSrc} compact />
        </div>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {beat.moods.slice(0, 2).map((m) => (
            <span
              key={m}
              className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-medium tracking-tight text-black backdrop-blur"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display truncate text-[18px]">{beat.title}</h3>
            <p
              className="mt-1 truncate text-[13px]"
              style={{ color: "var(--fg-mute)" }}
            >
              {beat.genre} · {beat.bpm} BPM · {beat.key}
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-[11px] uppercase tracking-wider"
              style={{ color: "var(--fg-mute)" }}
            >
              From
            </p>
            <p className="display text-[18px]">{formatPrice(beat.priceFrom)}</p>
          </div>
        </div>

        {collabNames.length > 1 && (
          <p
            className="mt-4 truncate text-[12px]"
            style={{ color: "var(--fg-mute)" }}
          >
            with {collabNames.slice(1).join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}
