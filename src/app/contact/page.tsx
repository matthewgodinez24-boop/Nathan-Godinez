import { site } from "@/data/site";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export const metadata = {
  title: "Contact",
  description: site.contact.sub,
};

export default function ContactPage() {
  return (
    <section className="section pt-24">
      <div className="container-x max-w-2xl text-center">
        <ScrollReveal>
          <p
            className="text-[12px] uppercase tracking-[0.2em]"
            style={{ color: "var(--fg-mute)" }}
          >
            Contact
          </p>
          <h1 className="display mt-3 text-[clamp(2.25rem,5vw,4rem)]">
            {site.contact.headline}
          </h1>
          <p
            className="mt-5 text-[clamp(1rem,1.4vw,1.2rem)]"
            style={{ color: "var(--fg-soft)" }}
          >
            {site.contact.sub}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <a
            href={`mailto:${site.contact.email}`}
            className="display mt-10 inline-block text-[clamp(1.5rem,3vw,2.25rem)] underline-offset-8 hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            {site.contact.email}
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <a
            href={`tel:${site.contact.phone.replace(/\D/g, "")}`}
            className="mt-3 inline-block text-[clamp(1rem,1.4vw,1.2rem)] underline-offset-4 hover:underline"
            style={{ color: "var(--fg-soft)" }}
          >
            {site.contact.phone}
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <ul className="mt-10 flex flex-wrap justify-center gap-3 text-[14px]">
            {site.contact.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border px-4 py-2 transition hover:border-[color:var(--fg)]"
                  style={{ borderColor: "var(--line)" }}
                >
                  {s.label} →
                </a>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
