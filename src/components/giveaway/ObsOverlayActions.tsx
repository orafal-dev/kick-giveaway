"use client";

import { ExternalLinkIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { OverlayLayoutSettings } from "@/overlay/overlayLayout.types";
import { buildOverlayUrl } from "@/overlay/overlayUrl";

interface ObsOverlayActionsProps {
  sessionId: string;
  layout: OverlayLayoutSettings;
}

export const ObsOverlayActions = ({
  sessionId,
  layout,
}: ObsOverlayActionsProps) => {
  const [copied, setCopied] = useState(false);

  const overlayUrl = useMemo(
    () => buildOverlayUrl(sessionId, { transparent: true, layout }),
    [layout, sessionId],
  );

  const handleCopyUrl = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2_000);
    } catch {
      window.prompt("Copy OBS overlay URL:", overlayUrl);
    }
  }, [overlayUrl]);

  if (!sessionId) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => void handleCopyUrl()}
        aria-label="Copy OBS overlay URL"
      >
        {copied ? "Copied OBS overlay URL" : "Copy OBS overlay URL"}
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Preview overlay in new tab"
        render={
          <a href={overlayUrl} target="_blank" rel="noopener noreferrer" />
        }
      >
        <ExternalLinkIcon className="size-4" />
      </Button>
    </div>
  );
};
