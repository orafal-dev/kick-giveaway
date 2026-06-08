import { SidebarTrigger } from "@/components/ui/sidebar";
import { VersionDisplay } from "@/components/VersionDisplay";

export const ControlDeckHeader = () => {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/80 bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger
          className="md:hidden"
          aria-label="Toggle giveaway settings"
        />
        <p className="text-sm font-semibold tracking-tight">kickaway.win</p>
      </div>
      <span className="text-xs text-muted-foreground">
        <VersionDisplay />
      </span>
    </header>
  );
};
