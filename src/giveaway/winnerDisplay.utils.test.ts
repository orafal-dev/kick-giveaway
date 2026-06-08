import { describe, expect, test } from "bun:test";
import {
  isCurrentSelectionNoShow,
  upgradeNoShowWinner,
} from "@/giveaway/winnerDisplay.utils";
import type { WinnerRecord } from "@/giveaway/giveaway.types";

const noShowWinner: WinnerRecord = {
  username: "testuser",
  userId: "1",
  confirmedAt: null,
  noShow: true,
  drawIndex: 1,
  confirmationMessages: [],
};

describe("upgradeNoShowWinner", () => {
  test("converts a prior no-show into a confirmed winner", () => {
    const upgraded = upgradeNoShowWinner(
      [noShowWinner],
      "testuser",
      "1",
      123,
      [{ message: "here", timestamp: 123 }],
    );

    expect(upgraded?.[0]?.noShow).toBe(false);
    expect(upgraded?.[0]?.confirmedAt).toBe(123);
  });
});

describe("isCurrentSelectionNoShow", () => {
  test("returns false while the same user is pending confirmation again", () => {
    expect(
      isCurrentSelectionNoShow("testuser", [noShowWinner], {
        username: "testuser",
        userId: "1",
        startedAt: Date.now(),
      }),
    ).toBe(false);
  });

  test("returns false after a no-show record is upgraded to confirmed", () => {
    const upgraded = upgradeNoShowWinner(
      [noShowWinner],
      "testuser",
      "1",
      123,
      [],
    );

    expect(
      isCurrentSelectionNoShow("testuser", upgraded ?? [], null),
    ).toBe(false);
  });
});
