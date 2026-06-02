"use client";

import * as React from "react";

export const NumberFieldContext: React.Context<{
  fieldId: string;
} | null> = React.createContext<{
  fieldId: string;
} | null>(null);
