import { notFound } from "next/navigation";
import { beats, getBeatBySlug } from "@/data/beats";
import { BeatDetail } from "@/components/marketplace/BeatDetail";

export function generateStaticParams() {
  return beats.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beat = getBeatBySlug(slug);
  if (!beat) return {};
  return {
    title: beat.title,
    description: beat.description,
  };
}

export default async function BeatDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beat = getBeatBySlug(slug);
  if (!beat) notFound();
  return <BeatDetail beat={beat} />;
}
