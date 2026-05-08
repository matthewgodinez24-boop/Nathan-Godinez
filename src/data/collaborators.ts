/**
 * COLLABORATORS — global directory of artists/producers/engineers.
 *
 * Each beat references collaborators by `id` and assigns a `payoutPercent`.
 * Per-beat splits MUST sum to 100. The validator in `lib/payouts.ts` enforces this
 * at build time (the marketplace + detail pages call it).
 */

export type Collaborator = {
  id: string;
  name: string;
  role: string; // e.g. "Vocals", "Co-producer", "Engineer", "Visual"
  link?: string; // optional social or artist page
  // PLACEHOLDER avatar — drop a real square image into /public/images/collaborators/
  avatar?: string;
};

export const collaborators: Collaborator[] = [
  {
    id: "self",
    name: "Nathan Godinez",
    role: "Guitar / Production",
  },
  {
    id: "vocalist-aria",
    name: "Aria Vega",
    role: "Vocals",
    link: "https://instagram.com/",
  },
  {
    id: "coprod-marek",
    name: "Marek Holt",
    role: "Co-production",
    link: "https://instagram.com/",
  },
  {
    id: "engineer-jules",
    name: "Jules Park",
    role: "Mix / Engineer",
  },
  {
    id: "barragini",
    name: "Barragini",
    role: "Co-production",
    link: "https://instagram.com/barragini",
  },
];

export function getCollaborator(id: string): Collaborator | undefined {
  return collaborators.find((c) => c.id === id);
}
