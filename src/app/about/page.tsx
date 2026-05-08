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

        {/* Photo / video placeholder grid */}
        <ScrollReveal delay={0.3}>
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl border"
                style={{
                  borderColor: "var(--line)",
                  background:
                    "linear-gradient(135deg, var(--bg-soft), color-mix(in srgb, var(--color-accent) 8%, var(--bg-soft)))",
                }}
                aria-label="Placeholder photo — replace in /public/images/about/"
              />
            ))}
          </div>
          <p
            className="mt-4 text-[12px]"
            style={{ color: "var(--fg-mute)" }}
          >
            Placeholder grid — drop real photos and stills into <code>/public/images/about/</code>
            and replace this block with an image grid.
          </p>
        </ScrollReveal>
      </div>
    </article>
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
