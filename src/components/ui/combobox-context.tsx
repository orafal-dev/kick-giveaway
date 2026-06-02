"use client";

import * as React from "react";

export const ComboboxContext: React.Context<{
  chipsRef: React.RefObject<Element | null> | null;
  multiple: boolean;
}> = React.createContext<{
  chipsRef: React.RefObject<Element | null> | null;
  multiple: boolean;
}>({
  chipsRef: null,
  multiple: false,
});
