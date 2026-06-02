"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import type { toggleVariants } from "@/components/ui/toggle.variants";

export const ToggleGroupContext: React.Context<
  VariantProps<typeof toggleVariants>
> = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});
