export const KNOWN_VERSION_ENV_VARS = [
  "SOURCE_COMMIT", // Coolify
  "VERCEL_GIT_COMMIT_SHA",
  "CF_PAGES_COMMIT_SHA",
  "RAILWAY_GIT_COMMIT_SHA",
  "RENDER_GIT_COMMIT",
  "COMMIT_REF",
  "GIT_HASH",
] as const;

export const getVersion = (env: NodeJS.ProcessEnv = process.env): string => {
  for (const envVar of KNOWN_VERSION_ENV_VARS) {
    const value = env[envVar];
    if (value) return value;
  }
  return env.NODE_ENV === "development" ? "dev" : new Date().toISOString();
};
