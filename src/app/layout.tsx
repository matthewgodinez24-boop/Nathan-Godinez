import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
