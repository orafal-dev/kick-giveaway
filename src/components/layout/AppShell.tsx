"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { AppBreadcrumb } from "@/components/layout/AppBreadcrumb";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  APP_NAV_SIDEBAR_WIDTH,
  APP_WIDE_SIDEBAR_WIDTH,
  shouldUseWideAppSidebar,
} from "@/config/layout";
import {
  GiveawaySettingsSidebarProvider,
  useGiveawaySettingsSidebar,
} from "@/components/layout/GiveawaySettingsSidebarContext";
import { OverlaySettingsSidebarProvider } from "@/components/layout/OverlaySettingsSidebarContext";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type AppShellProps = {
  children: ReactNode;
};

const AppShellLayout = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const { settings: giveawaySettings } = useGiveawaySettingsSidebar();
  const useWideSidebar = shouldUseWideAppSidebar(
    pathname,
    giveawaySettings !== null,
  );

  return (
    <SidebarProvider
      className="min-h-svh"
      style={
        {
          "--sidebar-width": useWideSidebar
            ? APP_WIDE_SIDEBAR_WIDTH
            : APP_NAV_SIDEBAR_WIDTH,
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger
            className="-ml-1"
            aria-label="Toggle navigation sidebar"
          />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <AppBreadcrumb />
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <GiveawaySettingsSidebarProvider>
      <OverlaySettingsSidebarProvider>
        <AppShellLayout>{children}</AppShellLayout>
      </OverlaySettingsSidebarProvider>
    </GiveawaySettingsSidebarProvider>
  );
};
