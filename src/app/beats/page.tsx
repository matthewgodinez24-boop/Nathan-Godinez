import { BeatGrid } from "@/components/marketplace/BeatGrid";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export const metadata = {
  title: "Beats",
  description: "Browse the full catalog of original instrumentals.",
};

export default function BeatsPage() {
  return (
    <section className="section pt-20">
      <div className="container-x">
        <ScrollReveal>
          <p
            className="text-[12px] uppercase tracking-[0.2em]"
            style={{ color: "var(--fg-mute)" }}
          >
            Marketplace
          </p>
          <h1 className="display mt-3 max-w-3xl text-[clamp(2.25rem,5vw,4rem)]">
            Every beat in the catalog.
          </h1>
          <p
            className="mt-4 max-w-xl text-[clamp(1rem,1.3vw,1.15rem)]"
            style={{ color: "var(--fg-soft)" }}
          >
            Filter by mood, key, or BPM. Preview every track. License on the spot.
          </p>
        </ScrollReveal>

        <div className="mt-10">
          <BeatGrid />
        </div>
      </div>
    </section>
  );
}
