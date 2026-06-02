import { OpenPanel } from "@openpanel/nextjs";

import { openpanelConfig } from "@/config/openpanel";

let serverClient: OpenPanel | null = null;

/** Server-side OpenPanel client for API routes and server actions. */
export const getOpenPanelServer = (): OpenPanel | null => {
  if (!openpanelConfig.serverEnabled) {
    return null;
  }

  if (!serverClient) {
    serverClient = new OpenPanel({
      clientId: openpanelConfig.clientId,
      clientSecret: openpanelConfig.clientSecret,
      apiUrl: openpanelConfig.apiUrl,
    });
  }

  return serverClient;
};
