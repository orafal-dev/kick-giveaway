import type { NextConfig } from "next";

const deploymentId = process.env.SOURCE_COMMIT;

const nextConfig: NextConfig = {
  output: "standalone",
  ...(deploymentId ? { deploymentId } : {}),
};

export default nextConfig;
