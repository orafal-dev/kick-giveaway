/** Total width of icon rail + secondary sidebar panel (matches giveaway settings). */
export const APP_WIDE_SIDEBAR_WIDTH =
  "calc(var(--sidebar-width-icon) + 22rem)" as const;

/** Default width for nav-only second panel (page links). */
export const APP_NAV_SIDEBAR_WIDTH = "350px" as const;

export const isOverlaySettingsRoute = (pathname: string): boolean =>
  pathname === "/overlay-settings";

export const shouldUseWideAppSidebar = (
  pathname: string,
  hasGiveawaySettings: boolean,
): boolean =>
  (pathname === "/" && hasGiveawaySettings) ||
  isOverlaySettingsRoute(pathname);
