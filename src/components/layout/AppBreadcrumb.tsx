"use client";

import { usePathname } from "next/navigation";
import { getActiveNavItem } from "@/config/navigation";
import type { AppBreadcrumbSegment } from "@/config/navigation.types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const getBreadcrumbSegments = (pathname: string): AppBreadcrumbSegment[] => {
  const activeNavItem = getActiveNavItem(pathname);

  if (pathname === "/") {
    return [
      { label: activeNavItem.title, href: activeNavItem.url },
      { label: "Control deck" },
    ];
  }

  if (pathname === "/overlay-settings") {
    return [
      { label: activeNavItem.title, href: activeNavItem.url },
      { label: "Layout settings" },
    ];
  }

  return [{ label: activeNavItem.title }];
};

export const AppBreadcrumb = () => {
  const pathname = usePathname();
  const segments = getBreadcrumbSegments(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <span key={`${segment.label}-${index}`} className="contents">
              {index > 0 ? (
                <BreadcrumbSeparator className="hidden md:block" />
              ) : null}
              <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                {isLast || !segment.href ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={segment.href} />}>
                    {segment.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
