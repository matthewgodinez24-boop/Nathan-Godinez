"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Beat, LicenseOption } from "@/data/beats";
import { getCollaborator } from "@/data/collaborators";
import { formatPrice } from "@/lib/utils";
import { BeatCover } from "./BeatCover";
import { AudioPreview } from "./AudioPreview";

export function BeatDetail({ beat }: { beat: Beat }) {
  const [selected, setSelected] = useState<LicenseOption>(beat.licenseOptions[0]);

  return (
    <article>
      {/* Hero — large product-style presentation */}
      <section className="section pt-24">
        <div className="container-x grid gap-12 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-square overflow-hidden rounded-3xl"
            style={{ boxShadow: "0 30px 80px -30px rgb(0 0 0 / 0.35)" }}
          >
            <BeatCover beat={beat} className="h-full w-full" />
          </motion.div>

          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[12px] uppercase tracking-[0.2em]"
              style={{ color: "var(--fg-mute)" }}
            >
              {beat.genre}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="display mt-3 text-[clamp(2.25rem,5vw,4rem)]"
            >
              {beat.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="mt-4 text-[clamp(1rem,1.4vw,1.15rem)]"
              style={{ color: "var(--fg-soft)" }}
            >
              {beat.description}
            </motion.p>

            <dl
              className="mt-6 grid grid-cols-3 gap-4 border-y py-5 text-[13px]"
              style={{ borderColor: "var(--line)" }}
            >
              <div>
                <dt style={{ color: "var(--fg-mute)" }}>BPM</dt>
                <dd className="display mt-1 text-[18px]">{beat.bpm}</dd>
              </div>
              <div>
                <dt style={{ color: "var(--fg-mute)" }}>Key</dt>
                <dd className="display mt-1 text-[18px]">{beat.key}</dd>
              </div>
              <div>
                <dt style={{ color: "var(--fg-mute)" }}>Mood</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {beat.moods.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border px-2.5 py-0.5 text-[11px]"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {m}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <AudioPreview
                src={beat.previewSrc}
                startSec={beat.previewStartSec ?? 0}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collaborators */}
      <section className="section py-16" style={{ background: "var(--bg-soft)" }}>
        <div className="container-x">
          <h2
            className="text-[12px] uppercase tracking-[0.2em]"
            style={{ color: "var(--fg-mute)" }}
          >
            Collaborators
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {beat.splits.map((s) => {
              const c = getCollaborator(s.collaboratorId);
              if (!c) return null;
              return (
                <li
                  key={s.collaboratorId}
                  className="flex items-center justify-between rounded-2xl border p-4"
                  style={{ borderColor: "var(--line)", background: "var(--bg)" }}
                >
                  <div>
                    <p className="display text-[16px]">{c.name}</p>
                    <p className="text-[13px]" style={{ color: "var(--fg-mute)" }}>
                      {c.role}
                    </p>
                  </div>
                  <span className="display text-[18px]">{s.payoutPercent}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* License selector */}
      <section className="section">
        <div className="container-x">
          <div className="mb-8">
            <h2 className="display text-[clamp(1.5rem,3vw,2.25rem)]">Choose a license.</h2>
            <p className="mt-2 text-[14px]" style={{ color: "var(--fg-mute)" }}>
              Final license terms will be reviewed before launch. Placeholder rights below.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {beat.licenseOptions.map((opt) => {
              const isActive = opt.tier === selected.tier;
              return (
                <button
                  key={opt.tier}
                  type="button"
                  onClick={() => setSelected(opt)}
                  className="lift rounded-2xl border p-5 text-left transition"
                  style={{
                    borderColor: isActive ? "var(--fg)" : "var(--line)",
                    background: isActive ? "var(--bg-soft)" : "var(--bg)",
                  }}
                >
                  <p
                    className="text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "var(--fg-mute)" }}
                  >
                    {opt.tier}
                  </p>
                  <p className="display mt-2 text-[24px]">{formatPrice(opt.price)}</p>
                  <p className="mt-2 text-[13px]" style={{ color: "var(--fg-soft)" }}>
                    {opt.blurb}
                  </p>
                </button>
              );
            })}
          </div>

          <div
            className="mt-8 grid gap-8 rounded-3xl border p-6 md:grid-cols-2"
            style={{ borderColor: "var(--line)", background: "var(--bg-soft)" }}
          >
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "var(--fg-mute)" }}
              >
                {selected.tier} includes
              </p>
              <ul className="mt-4 space-y-2 text-[14px]">
                {selected.rights.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span aria-hidden style={{ color: "var(--color-accent)" }}>
                      ✓
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start justify-between gap-4 md:items-end">
              <div className="md:text-right">
                <p
                  className="text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--fg-mute)" }}
                >
                  Total
                </p>
                <p className="display mt-1 text-[36px]">{formatPrice(selected.price)}</p>
              </div>
              <button
                type="button"
                disabled
                title="Payments not wired up yet — see README for next steps."
                className="rounded-full bg-[color:var(--fg)] px-6 py-3 text-[15px] text-[color:var(--bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy {selected.tier} (coming soon)
              </button>
            </div>
          </div>

          <p className="mt-10 text-[12px]" style={{ color: "var(--fg-mute)" }}>
            All beats are non-exclusive unless otherwise specified. Use the contact page to
            request an exclusive quote.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x">
          <Link
            href="/beats"
            className="text-[14px] underline-offset-4 hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            ← Back to all beats
          </Link>
        </div>
      </section>
    </article>
  );
}
