export const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return url;
};

export const isDatabaseConfigured = (): boolean =>
  Boolean(process.env.DATABASE_URL?.trim());
