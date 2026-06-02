const parseBool = (value: string | undefined): boolean =>
  value === "true" || value === "1";

const parseCount = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

export const devMode = {
  enabled: parseBool(process.env.NEXT_PUBLIC_DEV_MODE),
  mockEntrantCount: parseCount(
    process.env.NEXT_PUBLIC_DEV_MOCK_ENTRANT_COUNT,
    300,
  ),
} as const;
