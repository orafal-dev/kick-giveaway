"use client";

import type { ReactNode } from "react";

type AuthSessionProviderProps = {
  children: ReactNode;
};

/** Client boundary for Better Auth session hooks (nano-store). */
export const AuthSessionProvider = ({ children }: AuthSessionProviderProps) => children;
