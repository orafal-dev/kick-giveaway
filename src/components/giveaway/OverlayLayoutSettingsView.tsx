"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { OverlayLayoutSettingsContent } from "@/components/giveaway/OverlayLayoutSettingsContent";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useOverlayLayout } from "@/hooks/useOverlayLayout";

export const OverlayLayoutSettingsView = () => {
  const { layout, updateLayout, isReady } = useOverlayLayout();

  if (!isReady) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-svh w-full max-w-2xl flex-col items-center justify-center gap-3 p-4 md:p-8"
        aria-busy="true"
        aria-label="Loading overlay layout settings"
      >
        <Spinner className="size-8" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading layout settings…</p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-6 p-4 md:p-8"
    >
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ms-2 w-fit gap-1.5"
          render={<Link href="/" />}
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back to giveaway
        </Button>

        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">
            OBS overlay layout
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground text-pretty">
            Position draw elements on your OBS browser source and set how long
            results stay visible.
          </p>
        </header>
      </div>

      <OverlayLayoutSettingsContent
        layout={layout}
        onUpdateLayout={updateLayout}
      />
    </main>
  );
};
