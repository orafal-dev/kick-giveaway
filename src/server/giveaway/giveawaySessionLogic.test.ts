import { describe, expect, test } from "bun:test";
import { DEFAULT_SETTINGS } from "@/giveaway/giveaway.constants";
import type { Entrant, WinnerRecord } from "@/giveaway/giveaway.types";
import {
  createInitialSessionState,
  prepareRerollDrawState,
  startDrawInState,
} from "@/server/giveaway/giveawaySessionLogic";

const entrant = (username: string, userId = username): Entrant => ({
  username,
  userId,
  isSubscriber: false,
  isFollower: false,
  subscribedMonths: 0,
  followedDays: 0,
  weight: 1,
});

const confirmedWinner = (
  username: string,
  drawIndex: number,
): WinnerRecord => ({
  username,
  userId: username,
  confirmedAt: Date.now(),
  noShow: false,
  drawIndex,
  confirmationMessages: [],
});

describe("prepareRerollDrawState", () => {
  test("clears pending confirmation before a re-roll", () => {
    const state = {
      ...createInitialSessionState("session-1"),
      giveawayStarted: true,
      phase: "awaitingConfirmation" as const,
      pendingWinner: {
        username: "alice",
        userId: "alice",
        startedAt: Date.now(),
      },
      isCountdownActive: true,
      displayName: "alice",
    };

    const prepared = prepareRerollDrawState(state);

    expect(prepared.pendingWinner).toBeNull();
    expect(prepared.isCountdownActive).toBe(false);
    expect(prepared.displayName).toBe("");
    expect(prepared.phase).toBe("collecting");
  });

  test("reverts the last accepted winner when the target is reached", () => {
    const state = {
      ...createInitialSessionState("session-1", {
        settings: { ...DEFAULT_SETTINGS, winnersCount: 1 },
      }),
      giveawayStarted: true,
      phase: "completed" as const,
      entrants: [entrant("alice"), entrant("bob")],
      winners: [confirmedWinner("alice", 1)],
      displayName: "alice",
    };

    const prepared = prepareRerollDrawState(state);

    expect(prepared.winners).toHaveLength(0);
    expect(prepared.phase).toBe("collecting");
    expect(prepared.displayName).toBe("");
  });
});

describe("startDrawInState", () => {
  test("allows re-rolling after a confirmed winner", () => {
    const state = {
      ...createInitialSessionState("session-1", {
        settings: { ...DEFAULT_SETTINGS, winnersCount: 1 },
      }),
      giveawayStarted: true,
      phase: "completed" as const,
      entrants: [entrant("alice"), entrant("bob")],
      winners: [confirmedWinner("alice", 1)],
    };

    const next = startDrawInState(state);

    expect(next).not.toBeNull();
    expect(next?.isDrawing).toBe(true);
    expect(next?.winners).toHaveLength(0);
    expect(next?.drawTarget?.username).toBeTruthy();
  });

  test("allows re-rolling while awaiting confirmation", () => {
    const state = {
      ...createInitialSessionState("session-1"),
      giveawayStarted: true,
      phase: "awaitingConfirmation" as const,
      entrants: [entrant("alice"), entrant("bob")],
      pendingWinner: {
        username: "alice",
        userId: "alice",
        startedAt: Date.now(),
      },
      isCountdownActive: true,
    };

    const next = startDrawInState(state);

    expect(next).not.toBeNull();
    expect(next?.pendingWinner).toBeNull();
    expect(next?.isDrawing).toBe(true);
  });
});
