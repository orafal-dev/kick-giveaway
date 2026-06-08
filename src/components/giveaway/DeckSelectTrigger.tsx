import type { ComponentProps } from "react";
import { SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const DeckSelectTrigger = ({
  className,
  ...props
}: ComponentProps<typeof SelectTrigger>) => {
  return (
    <SelectTrigger
      className={cn(
        "h-9 min-h-9 w-full border-border/70 bg-[#1c1c1f] shadow-none",
        className,
      )}
      {...props}
    />
  );
};
