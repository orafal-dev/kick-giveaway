"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { MAX_IGNORED_NICKS } from "@/giveaway/giveaway.constants";
import type { IgnoredNickItem } from "@/giveaway/ignoredNicks.types";
import {
  fromIgnoredNickItems,
  isIgnoredNickItemEqual,
  toIgnoredNickItems,
} from "@/giveaway/ignoredNicks.utils";
import { normalizeValue } from "@/services/drawUtils";

export interface IgnoredNicksFieldProps {
  ignoredNicks: string[];
  suggestedUsernames?: string[];
  onIgnoredNicksChange: (nicks: string[]) => void;
}

export const IgnoredNicksField = ({
  ignoredNicks,
  suggestedUsernames = [],
  onIgnoredNicksChange,
}: IgnoredNicksFieldProps) => {
  const [inputValue, setInputValue] = useState("");

  const selectedItems = useMemo(
    () => toIgnoredNickItems(ignoredNicks),
    [ignoredNicks],
  );

  const items = useMemo(() => {
    const byKey = new Map<string, IgnoredNickItem>();

    for (const username of suggestedUsernames) {
      const trimmed = username.trim();
      if (!trimmed) {
        continue;
      }

      const key = normalizeValue(trimmed);
      if (!byKey.has(key)) {
        byKey.set(key, { label: trimmed, value: trimmed });
      }
    }

    for (const item of selectedItems) {
      const key = normalizeValue(item.value);
      byKey.set(key, item);
    }

    return [...byKey.values()].sort((left, right) =>
      left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
    );
  }, [selectedItems, suggestedUsernames]);

  const handleValueChange = useCallback(
    (value: IgnoredNickItem[] | null) => {
      onIgnoredNicksChange(fromIgnoredNickItems(value ?? []));
      setInputValue("");
    },
    [onIgnoredNicksChange],
  );

  const handleAddNick = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || ignoredNicks.length >= MAX_IGNORED_NICKS) {
        return;
      }

      const normalized = normalizeValue(trimmed);
      if (ignoredNicks.some((nick) => normalizeValue(nick) === normalized)) {
        setInputValue("");
        return;
      }

      onIgnoredNicksChange([...ignoredNicks, trimmed]);
      setInputValue("");
    },
    [ignoredNicks, onIgnoredNicksChange],
  );

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== "Enter" || event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    handleAddNick(inputValue);
  };

  return (
    <Field>
      <FieldLabel htmlFor="ignored-nicks-input">Ignore nick</FieldLabel>
      <Combobox
        multiple
        items={items}
        value={selectedItems}
        onValueChange={handleValueChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        isItemEqualToValue={isIgnoredNickItemEqual}
      >
        <ComboboxChips>
          <ComboboxValue>
            {(value: IgnoredNickItem[]) => (
              <>
                {value?.map((item) => (
                  <ComboboxChip aria-label={item.label} key={item.value}>
                    {item.label}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id="ignored-nicks-input"
                  aria-label="Add nick to ignore"
                  placeholder={
                    value.length > 0
                      ? undefined
                      : "Type a nick and press Enter…"
                  }
                  onKeyDown={handleInputKeyDown}
                  disabled={ignoredNicks.length >= MAX_IGNORED_NICKS}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxPopup>
          <ComboboxEmpty>No matching nicks. Press Enter to add.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
      <FieldDescription>
        These users cannot enter the giveaway. Type a nick and press Enter, or
        pick from chat suggestions.
      </FieldDescription>
    </Field>
  );
};
