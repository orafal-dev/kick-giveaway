"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GiveawaySettingsPanel } from "@/components/giveaway/GiveawaySettingsPanel";
import { OverlaySettingsPanel } from "@/components/giveaway/OverlaySettingsPanel";
import { AppNavUser } from "@/components/layout/AppNavUser";
import { useGiveawaySettingsSidebar } from "@/components/layout/GiveawaySettingsSidebarContext";
import { useOverlaySettingsSidebar } from "@/components/layout/OverlaySettingsSidebarContext";
import { appNavigation, getActiveNavItem } from "@/config/navigation";
import { SITE_NAME } from "@/config/site";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { AppNavItem } from "@/config/navigation.types";

const isNavItemActive = (item: AppNavItem, pathname: string): boolean => {
  if (item.url === "/") {
    return pathname === "/";
  }

  return pathname === item.url || pathname.startsWith(`${item.url}/`);
};

export const AppSidebar = (
  props: React.ComponentProps<typeof Sidebar>,
) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { settings: giveawaySettings } = useGiveawaySettingsSidebar();
  const { settings: overlaySettings } = useOverlaySettingsSidebar();
  const activeItem = getActiveNavItem(pathname);

  const showGiveawaySettings =
    pathname === "/" && giveawaySettings !== null;
  const showOverlaySettings =
    pathname === "/overlay-settings" && overlaySettings !== null;
  const showWideSidebarPanel = showGiveawaySettings || showOverlaySettings;

  const handleNavItemClick = (item: AppNavItem): void => {
    if (isMobile) {
      setOpenMobile(false);
    }

    if (!isNavItemActive(item, pathname)) {
      router.push(item.url);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="md:h-8 md:p-0"
                tooltip={{
                  children: SITE_NAME,
                  hidden: false,
                }}
                render={<Link href="/" aria-label={`${SITE_NAME} home`} />}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-kick text-sm font-bold text-kick-foreground">
                  K
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{SITE_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Giveaway tool
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {appNavigation.map((item) => {
                  const isActive = isNavItemActive(item, pathname);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        isActive={isActive}
                        className="px-2.5 md:px-2"
                        onClick={() => {
                          handleNavItemClick(item);
                        }}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <AppNavUser />
        </SidebarFooter>
      </Sidebar>

      <Sidebar
        collapsible="none"
        className={cn(
          "flex flex-1",
          !showWideSidebarPanel && "hidden md:flex",
        )}
      >
        {showGiveawaySettings ? (
          <GiveawaySettingsPanel {...giveawaySettings} />
        ) : showOverlaySettings ? (
          <OverlaySettingsPanel {...overlaySettings} />
        ) : (
          <>
            <SidebarHeader className="gap-3.5 border-b p-4">
              <div className="text-base font-medium text-foreground">
                {activeItem.title}
              </div>
              <SidebarInput
                placeholder="Type to search..."
                aria-label="Search pages"
              />
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup className="px-0">
                <SidebarGroupContent>
                  {activeItem.subItems.map((subItem) => {
                    const isSubItemActive =
                      subItem.url === "/"
                        ? pathname === "/"
                        : pathname === subItem.url ||
                          pathname.startsWith(`${subItem.url}/`);

                    return (
                      <Link
                        key={subItem.url}
                        href={subItem.url}
                        className={cn(
                          "flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSubItemActive &&
                            "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                        aria-current={isSubItemActive ? "page" : undefined}
                      >
                        <span className="font-medium">{subItem.title}</span>
                        <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces text-muted-foreground">
                          {subItem.description}
                        </span>
                      </Link>
                    );
                  })}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </>
        )}
      </Sidebar>
    </Sidebar>
  );
};
