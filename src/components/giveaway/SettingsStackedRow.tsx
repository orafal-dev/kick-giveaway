import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SettingsStackedRowProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export const SettingsStackedRow = ({
  label,
  htmlFor,
  hint,
  children,
  className,
}: SettingsStackedRowProps) => {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="w-full min-w-0">{children}</div>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
};
