import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SettingsInlineRowProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  align?: "center" | "start";
  className?: string;
}

export const SettingsInlineRow = ({
  label,
  htmlFor,
  hint,
  children,
  align = "center",
  className,
}: SettingsInlineRowProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(6.75rem,36%)_1fr] items-center gap-x-3 gap-y-1",
        align === "start" && "items-start",
        className,
      )}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          "text-sm text-muted-foreground",
          align === "start" && "pt-2",
        )}
      >
        {label}
      </label>
      <div className="min-w-0">
        {children}
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
};
