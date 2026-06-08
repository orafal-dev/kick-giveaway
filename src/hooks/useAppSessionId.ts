"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AppSessionState = {
  sessionId: string;
  isReady: boolean;
  error: string | null;
};

export const useAppSessionId = (): AppSessionState => {
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || session?.user) {
      return;
    }

    let cancelled = false;

    const ensureAnonymousSession = async (): Promise<void> => {
      const result = await authClient.signIn.anonymous();

      if (cancelled) {
        return;
      }

      if (result.error) {
        setError(result.error.message ?? "Anonymous sign-in failed.");
      }
    };

    void ensureAnonymousSession();

    return () => {
      cancelled = true;
    };
  }, [isPending, session?.user]);

  const sessionId = session?.user.id ?? "";
  const isReady = Boolean(sessionId);

  return {
    sessionId,
    isReady,
    error: error ?? sessionError?.message ?? null,
  };
};
