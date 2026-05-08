/**
 * Per-beat payout splits MUST sum to 100%.
 *
 * This is the future hook for Stripe Connect (or similar). When a buyer purchases
 * a beat, the gross goes to the connected platform account, and we issue transfers
 * to each collaborator's connected account in proportion to `payoutPercent`.
 *
 * For now, payments are not wired up. These helpers exist so:
 *   - the data is validated at render time (we throw on invalid splits)
 *   - the math is centralized for when payments come online
 */

import type { Beat, CollaboratorSplit } from "@/data/beats";

export class PayoutSplitError extends Error {}

export function validateSplits(beat: Beat): void {
  const total = beat.splits.reduce((sum, s) => sum + s.payoutPercent, 0);
  if (total !== 100) {
    throw new PayoutSplitError(
      `Beat "${beat.slug}" has splits totalling ${total}%, expected exactly 100. Fix in src/data/beats.ts.`,
    );
  }
  for (const split of beat.splits) {
    if (split.payoutPercent < 0 || split.payoutPercent > 100) {
      throw new PayoutSplitError(
        `Beat "${beat.slug}" has invalid split for ${split.collaboratorId}: ${split.payoutPercent}%`,
      );
    }
  }
}

export function validateAllBeats(beats: Beat[]): void {
  for (const beat of beats) validateSplits(beat);
}

/**
 * Compute payouts in cents for a given gross sale amount.
 * Returned object maps collaboratorId -> integer cents.
 * Any rounding remainder is allocated to the largest split holder so the total matches gross.
 */
export function computePayoutsCents(
  splits: CollaboratorSplit[],
  grossCents: number,
): Record<string, number> {
  const payouts: Record<string, number> = {};
  let allocated = 0;
  for (const split of splits) {
    const cents = Math.floor((grossCents * split.payoutPercent) / 100);
    payouts[split.collaboratorId] = cents;
    allocated += cents;
  }
  const remainder = grossCents - allocated;
  if (remainder !== 0 && splits.length > 0) {
    const largest = [...splits].sort((a, b) => b.payoutPercent - a.payoutPercent)[0];
    payouts[largest.collaboratorId] += remainder;
  }
  return payouts;
}
