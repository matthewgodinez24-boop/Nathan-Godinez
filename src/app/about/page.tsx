import { site } from "@/data/site";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export const metadata = {
  title: "About",
  description: site.artist.bio,
};

export default function AboutPage() {
  return (
    <article className="section pt-24">
      <div className="container-x max-w-3xl">
        <ScrollReveal>
          <p
            className="text-[12px] uppercase tracking-[0.2em]"
            style={{ color: "var(--fg-mute)" }}
          >
            About
          </p>
          <h1 className="display mt-3 text-[clamp(2.25rem,5vw,4rem)]">
            {site.artist.tagline}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p
            className="mt-8 text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed"
            style={{ color: "var(--fg-soft)" }}
          >
            {site.artist.bio}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div
            className="mt-12 grid gap-3 rounded-3xl border p-6 md:grid-cols-3"
            style={{ borderColor: "var(--line)", background: "var(--bg-soft)" }}
          >
            <Stat label="Based in" value={site.artist.location} />
            <Stat label="Releases" value="Originals only" />
            <Stat label="Open to" value="Vocalists, producers, syncs" />
          </div>
        </ScrollReveal>

        {/* Approach — three text-driven cards. Replace any of these with real */}
        {/* photo blocks once Nathan has imagery; leaves the page polished today. */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            <ApproachCard
              eyebrow="Tone"
              title="Tracked through analog."
              body="Tube amps, real rooms, tape. The signal chain is part of the song — not a plug-in afterthought."
            />
            <ApproachCard
              eyebrow="Craft"
              title="Songs, not loops."
              body="Verses, lifts, bridges, drops. Beats with structure so a vocal can live in them, not survive them."
            />
            <ApproachCard
              eyebrow="Collaboration"
              title="Open by default."
              body="Every release ships with credits and transparent splits. Vocalists, producers, engineers — they're on the record."
            />
          </div>
        </ScrollReveal>
      </div>
    </article>
  );
}

function ApproachCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ borderColor: "var(--line)", background: "var(--bg-soft)" }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.2em]"
        style={{ color: "var(--fg-mute)" }}
      >
        {eyebrow}
      </p>
      <h3 className="display mt-3 text-[20px]">{title}</h3>
      <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--fg-soft)" }}>
        {body}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[11px] uppercase tracking-[0.18em]"
        style={{ color: "var(--fg-mute)" }}
      >
        {label}
      </p>
      <p className="display mt-2 text-[18px]">{value}</p>
    </div>
  );
}
