"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatDuration } from "@/lib/utils";

type Props = {
  src: string | null;
  className?: string;
  // Compact = small inline button only (used in cards). Full = button + scrubber + time.
  compact?: boolean;
};

export function AudioPreview({ src, className, compact = false }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [unavailable, setUnavailable] = useState(!src);

  useEffect(() => {
    if (!src) {
      setUnavailable(true);
      return;
    }
    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;
    const onMeta = () => setDuration(audio.duration || 0);
    const onTime = () => setProgress(audio.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onError = () => setUnavailable(true);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  function toggle(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio || unavailable) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setUnavailable(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = t;
    setProgress(t);
  }

  const pct = duration ? (progress / duration) * 100 : 0;

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play preview"}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition",
          unavailable
            ? "cursor-not-allowed opacity-50"
            : "bg-white/90 text-black backdrop-blur hover:bg-white",
          className,
        )}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play preview"}
        disabled={unavailable}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition",
          unavailable
            ? "cursor-not-allowed opacity-40"
            : "bg-[color:var(--fg)] text-[color:var(--bg)] hover:opacity-90",
        )}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={pct}
          onChange={seek}
          aria-label="Preview position"
          disabled={unavailable}
        />
        <div
          className="mt-2 flex justify-between text-[11px]"
          style={{ color: "var(--fg-mute)" }}
        >
          <span>{formatDuration(Math.floor(progress))}</span>
          <span>
            {unavailable
              ? "Preview not yet uploaded"
              : duration
                ? formatDuration(Math.floor(duration))
                : "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
