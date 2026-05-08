import Link from "next/link";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer
      className="mt-32 border-t text-[12px]"
      style={{ borderColor: "var(--line)", color: "var(--fg-mute)" }}
    >
      <div className="container-x flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="display text-[15px]" style={{ color: "var(--fg)" }}>
            {site.artist.name}
          </div>
          <p className="mt-1">{site.footer.note}</p>
        </div>
        <ul className="flex flex-wrap items-center gap-5">
          {site.contact.socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="hover:opacity-100 opacity-80 transition-opacity"
              >
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/contact" className="hover:opacity-100 opacity-80 transition-opacity">
              Contact
            </Link>
          </li>
        </ul>
      </div>
      <div className="container-x pb-8">
        © {new Date().getFullYear()} {site.artist.name}. All rights reserved.
      </div>
    </footer>
  );
}
