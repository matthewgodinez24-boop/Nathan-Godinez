"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatDuration } from "@/lib/utils";

type Props = {
  src: string | null;
  className?: string;
  // Compact = small inline button only (used in cards). Full = button + scrubber + time.
  compact?: boolean;
  /**
   * Where in the source file to start the preview, in seconds. Defaults to 0.
   * Combined with `maxDurationSec`, this defines the [start, start + max) window
   * the user can hear in the store.
   */
  startSec?: number;
  /**
   * Maximum length of the preview in seconds. Defaults to 10.
   * Once playback hits this duration past start, audio pauses and resets.
   */
  maxDurationSec?: number;
};

const DEFAULT_MAX_DURATION = 10;

export function AudioPreview({
  src,
  className,
  compact = false,
  startSec = 0,
  maxDurationSec = DEFAULT_MAX_DURATION,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  // Progress is relative to the start of the window — 0..maxDurationSec.
  const [windowProgress, setWindowProgress] = useState(0);
  // We remember *which* src errored, not a boolean — so when `src` changes the
  // derived `errored` flag flips back to false automatically. No effect needed.
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const errored = !!src && erroredSrc === src;
  const unavailable = !src || errored;

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => {
      const elapsed = audio.currentTime - startSec;
      if (elapsed >= maxDurationSec) {
        audio.pause();
        audio.currentTime = startSec;
        setWindowProgress(0);
        setPlaying(false);
        return;
      }
      setWindowProgress(Math.max(0, elapsed));
    };
    const onEnd = () => {
      audio.currentTime = startSec;
      setWindowProgress(0);
      setPlaying(false);
    };
    const onError = () => setErroredSrc(src);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
    };
  }, [src, startSec, maxDurationSec]);

  function toggle(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio || unavailable) return;
    if (audio.paused) {
      // Always start from the window's start when (re-)playing.
      if (
        audio.currentTime < startSec ||
        audio.currentTime >= startSec + maxDurationSec
      ) {
        audio.currentTime = startSec;
      }
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setErroredSrc(src));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const t = (parseFloat(e.target.value) / 100) * maxDurationSec;
    audio.currentTime = startSec + t;
    setWindowProgress(t);
  }

  const pct = (windowProgress / maxDurationSec) * 100;

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play 10-second preview"}
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
        aria-label={playing ? "Pause preview" : "Play 10-second preview"}
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
          <span>{formatDuration(Math.floor(windowProgress))}</span>
          <span>
            {unavailable
              ? "Preview not yet uploaded"
              : `0:${maxDurationSec.toString().padStart(2, "0")} preview`}
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
