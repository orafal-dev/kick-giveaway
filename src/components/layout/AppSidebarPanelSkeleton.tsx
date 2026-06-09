import { Skeleton } from "@/components/ui/skeleton";
import { SidebarContent } from "@/components/ui/sidebar";

export const AppSidebarPanelSkeleton = () => {
  return (
    <SidebarContent className="gap-4 px-4 py-5" aria-busy="true" aria-label="Loading sidebar">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-3/4" />
      </div>
    </SidebarContent>
  );
};
