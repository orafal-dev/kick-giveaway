import { MAX_IGNORED_NICKS } from "@/giveaway/giveaway.constants";
import type { IgnoredNickItem } from "@/giveaway/ignoredNicks.types";
import { normalizeValue } from "@/services/drawUtils";

export const toIgnoredNickItems = (nicks: string[]): IgnoredNickItem[] =>
  nicks.map((nick) => {
    const trimmed = nick.trim();
    return { label: trimmed, value: trimmed };
  });

export const fromIgnoredNickItems = (items: IgnoredNickItem[]): string[] =>
  items.map((item) => item.value.trim()).filter(Boolean);

export const parseIgnoredNicks = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const seen = new Set<string>();
  const parsed: string[] = [];

  for (const entry of raw) {
    if (typeof entry !== "string") {
      continue;
    }

    const trimmed = entry.trim();
    if (!trimmed) {
      continue;
    }

    const key = normalizeValue(trimmed);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    parsed.push(trimmed);

    if (parsed.length >= MAX_IGNORED_NICKS) {
      break;
    }
  }

  return parsed;
};

export const isUsernameIgnored = (
  username: string,
  ignoredNicks: string[],
): boolean => {
  if (ignoredNicks.length === 0) {
    return false;
  }

  const normalizedUsername = normalizeValue(username);
  return ignoredNicks.some(
    (nick) => normalizeValue(nick) === normalizedUsername,
  );
};

export const isIgnoredNickItemEqual = (
  item: IgnoredNickItem,
  selected: IgnoredNickItem,
): boolean => normalizeValue(item.value) === normalizeValue(selected.value);
