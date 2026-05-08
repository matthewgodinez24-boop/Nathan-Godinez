import Link from "next/link";
import { getFeaturedBeats } from "@/data/beats";
import { BeatCard } from "@/components/marketplace/BeatCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function FeaturedBeats() {
  const featured = getFeaturedBeats();

  return (
    <section className="section">
      <div className="container-x">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <ScrollReveal>
            <h2 className="display max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)]">
              Featured music.
            </h2>
            <p
              className="mt-3 max-w-md text-[15px]"
              style={{ color: "var(--fg-soft)" }}
            >
              Current rotation from the catalog. The full store has the rest.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link
              href="/beats"
              className="text-[15px] underline-offset-4 hover:underline"
              style={{ color: "var(--color-accent)" }}
            >
              Browse all →
            </Link>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((beat, i) => (
            <ScrollReveal key={beat.slug} delay={0.05 * i}>
              <BeatCard beat={beat} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
