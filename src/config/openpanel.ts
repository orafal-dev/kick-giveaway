/** OpenPanel analytics — client + proxy configuration. */
export const OPENPANEL_PROXY_PATH = "/api/op" as const;

export const OPENPANEL_PROXY_SCRIPT_URL =
  `${OPENPANEL_PROXY_PATH}/op1.js` as const;

export const openpanelConfig = {
  clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID ?? "",
  clientSecret: process.env.OPENPANEL_CLIENT_SECRET ?? "",
  /** Upstream self-hosted OpenPanel API (include `/api` suffix). */
  apiUrl: process.env.OPENPANEL_API_URL ?? "",
  proxyPath: OPENPANEL_PROXY_PATH,
  scriptUrl: OPENPANEL_PROXY_SCRIPT_URL,
  enabled: Boolean(process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID?.trim()),
  serverEnabled: Boolean(
    process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID?.trim() &&
    process.env.OPENPANEL_CLIENT_SECRET?.trim() &&
    process.env.OPENPANEL_API_URL?.trim(),
  ),
} as const;
