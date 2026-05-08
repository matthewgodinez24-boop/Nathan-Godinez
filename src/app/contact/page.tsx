import { site } from "@/data/site";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

export const metadata = {
  title: "Contact",
  description: site.contact.sub,
};

export default function ContactPage() {
  return (
    <section className="relative isolate min-h-dvh overflow-hidden pt-24">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/contact-background.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.2) 38%, rgb(0 0 0 / 0.72)), radial-gradient(70% 70% at 50% 38%, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.62))",
        }}
      />

      <div className="container-x flex min-h-[calc(100dvh-6rem)] max-w-2xl items-center justify-center py-20 text-center text-white">
        <div>
        <ScrollReveal>
          <p
            className="text-[12px] uppercase tracking-[0.2em] text-white/70"
          >
            Contact
          </p>
          <h1 className="display mt-3 text-[clamp(2.25rem,5vw,4rem)]">
            {site.contact.headline}
          </h1>
          <p
            className="mt-5 text-[clamp(1rem,1.4vw,1.2rem)] text-white/85"
          >
            {site.contact.sub}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <a
            href={`mailto:${site.contact.email}`}
            className="display mt-10 inline-block text-[clamp(1.5rem,3vw,2.25rem)] underline-offset-8 hover:underline"
            style={{ color: "#7ab8ff" }}
          >
            {site.contact.email}
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <a
            href={`tel:${site.contact.phone.replace(/\D/g, "")}`}
            className="mt-3 inline-block text-[clamp(1rem,1.4vw,1.2rem)] text-white/80 underline-offset-4 hover:underline"
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
                  className="rounded-full border border-white/25 bg-black/20 px-4 py-2 text-white/90 backdrop-blur transition hover:border-white/70 hover:text-white"
                >
                  {s.label} →
                </a>
              </li>
            ))}
          </ul>
        </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
