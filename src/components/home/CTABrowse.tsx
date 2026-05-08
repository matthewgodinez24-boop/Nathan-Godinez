import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function CTABrowse() {
  return (
    <section className="section text-center">
      <div className="container-x">
        <ScrollReveal>
          <h2 className="display mx-auto max-w-3xl text-[clamp(2rem,5vw,4rem)]">
            The catalog is open.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-[clamp(1rem,1.3vw,1.15rem)]"
            style={{ color: "var(--fg-soft)" }}
          >
            Filter by mood, BPM, or key. Preview every track before you buy.
          </p>
          <div className="mt-9">
            <Link
              href="/beats"
              className="inline-flex rounded-full bg-[color:var(--fg)] px-6 py-3 text-[15px] text-[color:var(--bg)] transition-opacity hover:opacity-90"
            >
              Browse beats →
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
