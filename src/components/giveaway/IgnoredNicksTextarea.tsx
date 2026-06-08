import type { ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MAX_IGNORED_NICKS } from "@/giveaway/giveaway.constants";
import { normalizeValue } from "@/services/drawUtils";

export interface IgnoredNicksTextareaProps {
  ignoredNicks: string[];
  onIgnoredNicksChange: (nicks: string[]) => void;
}

const parseIgnoredNicks = (value: string): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of value.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const key = normalizeValue(trimmed);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);

    if (result.length >= MAX_IGNORED_NICKS) {
      break;
    }
  }

  return result;
};

export const IgnoredNicksTextarea = ({
  ignoredNicks,
  onIgnoredNicksChange,
}: IgnoredNicksTextareaProps) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    onIgnoredNicksChange(parseIgnoredNicks(event.target.value));
  };

  return (
    <Textarea
      id="ignored-nicks-textarea"
      className="min-h-16 resize-y border-border/70 bg-[#1c1c1f] text-sm shadow-none"
      value={ignoredNicks.join("\n")}
      onChange={handleChange}
      placeholder={"botname\nnightbot"}
      aria-label="Ignored nicknames"
    />
  );
};
