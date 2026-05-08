import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/data/site";
import { validateAllBeats } from "@/lib/payouts";
import { beats } from "@/data/beats";

// Validate splits at module load — surfaces a clear error if data/beats.ts is wrong.
validateAllBeats(beats);

export const metadata: Metadata = {
  title: {
    default: `${site.artist.name} — ${site.artist.tagline}`,
    template: `%s — ${site.artist.name}`,
  },
  description: site.artist.bio,
  metadataBase: new URL(site.domain),
  openGraph: {
    title: `${site.artist.name} — ${site.artist.tagline}`,
    description: site.artist.bio,
    url: site.domain,
    siteName: site.artist.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Theme boot — runs before paint so the page never flashes the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t='dark';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.classList.toggle('light',t==='light');}catch(_){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
