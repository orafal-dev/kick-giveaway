import { openpanelConfig } from "@/config/openpanel";
import { createOpenpanelProxyHandler } from "@/lib/openpanel-proxy";

export const { GET, POST } = createOpenpanelProxyHandler({
  apiUrl: openpanelConfig.apiUrl || undefined,
});
