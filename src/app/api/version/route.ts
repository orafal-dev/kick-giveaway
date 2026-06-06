import { getVersion } from "@/lib/version";

export { getVersion, KNOWN_VERSION_ENV_VARS } from "@/lib/version";

export const dynamic = "force-static";

export const GET = () => {
  return new Response(getVersion(process.env), {
    headers: { "content-type": "text/plain" },
  });
};
