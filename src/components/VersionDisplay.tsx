"use client";

import { useVersion } from "@/components/VersionProvider";

export const VersionDisplay = () => {
  const { version } = useVersion();
  const display = version.length > 12 ? version.slice(0, 7) : version;

  return (
    <span
      className="font-mono text-muted-foreground"
      title={version}
      aria-label={`Version ${version}`}
    >
      {display}
    </span>
  );
};
