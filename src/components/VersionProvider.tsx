"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toastManager } from "@/components/ui/toast";

const POLL_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_VERSION_POLL_INTERVAL_SECONDS ?? 60) * 1000;

type VersionContextValue = {
  version: string;
};

const VersionContext = createContext<VersionContextValue>({ version: "" });

export const useVersion = (): VersionContextValue => useContext(VersionContext);

type VersionProviderProps = {
  children: ReactNode;
  initialVersion: string;
};

export const VersionProvider = ({
  children,
  initialVersion,
}: VersionProviderProps) => {
  const [version, setVersion] = useState(initialVersion);
  const initialVersionRef = useRef(initialVersion);
  const hasFetchedRef = useRef(false);
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/version");
        if (!res.ok) return;

        const nextVersion = await res.text();

        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true;
          if (nextVersion !== initialVersionRef.current) {
            setVersion(nextVersion);
          }
          return;
        }

        if (
          nextVersion !== initialVersionRef.current &&
          !hasShownToastRef.current
        ) {
          hasShownToastRef.current = true;
          toastManager.add({
            title: "Update available",
            description: "Reload to get the latest features and fixes.",
            type: "info",
            timeout: 0,
            actionProps: {
              children: "Reload",
              onClick: () => window.location.reload(),
            },
          });
        }
      } catch {
        // Ignore network errors
      }
    };

    void checkVersion();
    const id = setInterval(checkVersion, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <VersionContext.Provider value={{ version }}>
      {children}
    </VersionContext.Provider>
  );
};
