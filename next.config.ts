import type { NextConfig } from "next";

const deploymentId = process.env.SOURCE_COMMIT;

const nextConfig: NextConfig = {
  output: "standalone",
  ...(deploymentId ? { deploymentId } : {}),
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
};

export default nextConfig;
