"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import type { VariantProps } from "class-variance-authority";
import type React from "react";
import { toggleVariants } from "@/components/ui/toggle.variants";
import { cn } from "@/lib/utils";

export function Toggle({
  className,
  variant,
  size,
  ...props
}: TogglePrimitive.Props &
  VariantProps<typeof toggleVariants>): React.ReactElement {
  return (
    <TogglePrimitive
      className={cn(toggleVariants({ className, size, variant }))}
      data-slot="toggle"
      {...props}
    />
  );
}

export { TogglePrimitive };
