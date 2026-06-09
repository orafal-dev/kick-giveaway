import { GiftIcon, LayoutTemplateIcon } from "lucide-react";
import type { AppNavItem } from "@/config/navigation.types";

export const appNavigation: AppNavItem[] = [
  {
    title: "Giveaway",
    url: "/",
    icon: GiftIcon,
    subItems: [
      {
        title: "Control deck",
        url: "/",
        description: "Connect your channel, collect entrants, and draw winners.",
      },
    ],
  },
  {
    title: "OBS overlay",
    url: "/overlay-settings",
    icon: LayoutTemplateIcon,
    subItems: [
      {
        title: "Layout settings",
        url: "/overlay-settings",
        description:
          "Position overlay elements and copy your OBS browser source URL.",
      },
    ],
  },
];

export const getActiveNavItem = (
  pathname: string,
  items: AppNavItem[] = appNavigation,
): AppNavItem => {
  const matched =
    items.find((item) =>
      item.url === "/"
        ? pathname === "/"
        : pathname === item.url || pathname.startsWith(`${item.url}/`),
    ) ?? items[0];

  return matched;
};
