export const getRedisUrl = (): string => {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    throw new Error("REDIS_URL is not configured.");
  }

  return url;
};

export const isRedisConfigured = (): boolean =>
  Boolean(process.env.REDIS_URL?.trim());
