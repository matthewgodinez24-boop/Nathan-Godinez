import { Hero } from "@/components/home/Hero";
import { HorizontalShowcase } from "@/components/home/HorizontalShowcase";
import { FeaturedBeats } from "@/components/home/FeaturedBeats";
import { CollaborationSection } from "@/components/home/CollaborationSection";
import { CTABrowse } from "@/components/home/CTABrowse";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HorizontalShowcase />
      <FeaturedBeats />
      <CollaborationSection />
      <CTABrowse />
    </>
  );
}
