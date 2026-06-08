import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const SettingsSection = ({
  title,
  children,
  className,
}: SettingsSectionProps) => {
  return (
    <section className={cn("space-y-4", className)}>
      <h3 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
};
