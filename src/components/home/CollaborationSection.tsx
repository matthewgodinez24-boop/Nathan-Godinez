import { site } from "@/data/site";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export function CollaborationSection() {
  return (
    <section className="section" style={{ background: "var(--bg-soft)" }}>
      <div className="container-x grid gap-12 md:grid-cols-2 md:items-center">
        <ScrollReveal>
          <h2 className="display max-w-md text-[clamp(2rem,4.5vw,3.5rem)]">
            {site.collaboration.headline}
          </h2>
        </ScrollReveal>

        <div>
          <ScrollReveal delay={0.1}>
            <p className="text-[clamp(1rem,1.4vw,1.2rem)]" style={{ color: "var(--fg-soft)" }}>
              {site.collaboration.body}
            </p>
          </ScrollReveal>

          <ul className="mt-8 space-y-4 text-[15px]">
            {site.collaboration.bullets.map((line, i) => (
              <ScrollReveal key={line} delay={0.15 + i * 0.05}>
                <li className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--color-accent)" }}
                  />
                  <span>{line}</span>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
