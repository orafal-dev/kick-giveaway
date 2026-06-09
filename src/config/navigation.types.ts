import type { LucideIcon } from "lucide-react";

export type AppNavSubItem = {
  title: string;
  url: string;
  description: string;
};

export type AppNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  subItems: AppNavSubItem[];
};

export type AppBreadcrumbSegment = {
  label: string;
  href?: string;
};
