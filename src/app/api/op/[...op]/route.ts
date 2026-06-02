import { createRouteHandler } from "@openpanel/nextjs/server";

import { openpanelConfig } from "@/config/openpanel";

export const { GET, POST } = createRouteHandler({
  apiUrl: openpanelConfig.apiUrl || undefined,
});
