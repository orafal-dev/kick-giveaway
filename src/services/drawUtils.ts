import type { Entrant } from "@/giveaway/giveaway.types";

export const getSecureRandomIndex = (length: number): number => {
  if (length <= 1) {
    return 0;
  }

  const maxUint32 = 0x1_0000_0000;
  const unbiasedRange = Math.floor(maxUint32 / length) * length;
  const randomBuffer = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(randomBuffer);
    const randomValue = randomBuffer[0];

    if (randomValue < unbiasedRange) {
      return randomValue % length;
    }
  }
};

export const pickWeightedWinner = (entrants: Entrant[]): Entrant | null => {
  if (entrants.length === 0) {
    return null;
  }

  const totalWeight = entrants.reduce((sum, entrant) => sum + entrant.weight, 0);
  if (totalWeight <= 0) {
    return entrants[getSecureRandomIndex(entrants.length)] ?? null;
  }

  let threshold = getSecureRandomIndex(totalWeight);

  for (const entrant of entrants) {
    threshold -= entrant.weight;
    if (threshold < 0) {
      return entrant;
    }
  }

  return entrants[entrants.length - 1] ?? null;
};

export const normalizeValue = (value: string): string => value.trim().toLowerCase();
