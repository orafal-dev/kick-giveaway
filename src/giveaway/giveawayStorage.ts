import {
  DEFAULT_SETTINGS,
  MAX_ANIMATION_DURATION_SECONDS,
  MIN_ANIMATION_DURATION_SECONDS,
  STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "@/giveaway/giveaway.constants";
import type {
  AnimationMode,
  GiveawayPhase,
  GiveawaySettings,
  PersistedGiveawayState,
  ThemeMode,
  WinnerRecord,
} from "@/giveaway/giveaway.types";

const isAnimationMode = (value: unknown): value is AnimationMode =>
  value === "wheel" || value === "classic" || value === "scramble";

const parseWinner = (raw: unknown): WinnerRecord | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;

  if (typeof data.username !== "string") {
    return null;
  }

  const confirmationMessages = Array.isArray(data.confirmationMessages)
    ? data.confirmationMessages
        .map((entry) => {
          if (!entry || typeof entry !== "object") {
            return null;
          }

          const item = entry as Record<string, unknown>;
          if (
            typeof item.message !== "string" ||
            typeof item.timestamp !== "number"
          ) {
            return null;
          }

          return {
            message: item.message,
            timestamp: item.timestamp,
          };
        })
        .filter((entry): entry is WinnerRecord["confirmationMessages"][number] =>
          entry !== null,
        )
    : [];

  return {
    username: data.username,
    userId:
      typeof data.userId === "string"
        ? data.userId
        : data.username,
    confirmedAt:
      typeof data.confirmedAt === "number" ? data.confirmedAt : null,
    noShow: data.noShow === true,
    drawIndex:
      typeof data.drawIndex === "number" ? data.drawIndex : 0,
    confirmationMessages,
  };
};

const isGiveawayPhase = (value: unknown): value is GiveawayPhase =>
  value === "idle" ||
  value === "connecting" ||
  value === "collecting" ||
  value === "drawing" ||
  value === "awaitingConfirmation" ||
  value === "completed";

const parseSettings = (raw: unknown): GiveawaySettings => {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const data = raw as Record<string, unknown>;

  return {
    keyword: typeof data.keyword === "string" ? data.keyword : DEFAULT_SETTINGS.keyword,
    winnersCount:
      typeof data.winnersCount === "number"
        ? Math.max(1, Math.min(50, data.winnersCount))
        : DEFAULT_SETTINGS.winnersCount,
    subscriptionDurationMonths:
      typeof data.subscriptionDurationMonths === "number"
        ? Math.max(0, data.subscriptionDurationMonths)
        : DEFAULT_SETTINGS.subscriptionDurationMonths,
    subscriberMultiplier:
      typeof data.subscriberMultiplier === "number"
        ? Math.max(1, Math.min(10, data.subscriberMultiplier))
        : DEFAULT_SETTINGS.subscriberMultiplier,
    followDurationDays:
      typeof data.followDurationDays === "number"
        ? Math.max(0, data.followDurationDays)
        : DEFAULT_SETTINGS.followDurationDays,
    subscribersOnly:
      typeof data.subscribersOnly === "boolean"
        ? data.subscribersOnly
        : DEFAULT_SETTINGS.subscribersOnly,
    winnerConfirmationEnabled:
      typeof data.winnerConfirmationEnabled === "boolean"
        ? data.winnerConfirmationEnabled
        : DEFAULT_SETTINGS.winnerConfirmationEnabled,
    confirmTimeSeconds:
      typeof data.confirmTimeSeconds === "number"
        ? Math.max(5, Math.min(600, data.confirmTimeSeconds))
        : DEFAULT_SETTINGS.confirmTimeSeconds,
    animationMode: isAnimationMode(data.animationMode)
      ? data.animationMode
      : DEFAULT_SETTINGS.animationMode,
    animationDurationSeconds:
      typeof data.animationDurationSeconds === "number"
        ? Math.max(
            MIN_ANIMATION_DURATION_SECONDS,
            Math.min(MAX_ANIMATION_DURATION_SECONDS, data.animationDurationSeconds),
          )
        : DEFAULT_SETTINGS.animationDurationSeconds,
  };
};

/** WebSockets do not survive reload; drop in-flight giveaway session state. */
export const hydratePersistedStateAfterReload = (
  persisted: PersistedGiveawayState,
): PersistedGiveawayState => {
  if (persisted.phase === "idle") {
    return persisted;
  }

  return {
    ...persisted,
    phase: "idle",
    pendingWinner: null,
  };
};

export const loadPersistedState = (): PersistedGiveawayState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return migrateLegacyStorage();
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const entrants = Array.isArray(parsed.entrants) ? parsed.entrants : [];
    const winners = Array.isArray(parsed.winners) ? parsed.winners : [];

    const loaded: PersistedGiveawayState = {
      channelName: typeof parsed.channelName === "string" ? parsed.channelName : "",
      settings: parseSettings(parsed.settings),
      entrants: entrants.filter(
        (entrant): entrant is PersistedGiveawayState["entrants"][number] =>
          Boolean(entrant) &&
          typeof entrant === "object" &&
          typeof (entrant as { username?: string }).username === "string",
      ),
      winners: winners
        .map(parseWinner)
        .filter((winner): winner is WinnerRecord => winner !== null),
      phase: isGiveawayPhase(parsed.phase) ? parsed.phase : "idle",
      pendingWinner:
        parsed.pendingWinner &&
        typeof parsed.pendingWinner === "object" &&
        typeof (parsed.pendingWinner as { username?: string }).username === "string"
          ? {
              username: (parsed.pendingWinner as { username: string }).username,
              userId:
                typeof (parsed.pendingWinner as { userId?: string }).userId ===
                "string"
                  ? (parsed.pendingWinner as { userId: string }).userId
                  : (parsed.pendingWinner as { username: string }).username,
              startedAt:
                typeof (parsed.pendingWinner as { startedAt?: number }).startedAt ===
                "number"
                  ? (parsed.pendingWinner as { startedAt: number }).startedAt
                  : Date.now(),
            }
          : null,
      drawCount: typeof parsed.drawCount === "number" ? parsed.drawCount : 0,
    };

    return hydratePersistedStateAfterReload(loaded);
  } catch {
    return null;
  }
};

const migrateLegacyStorage = (): PersistedGiveawayState | null => {
  const legacyChannel = window.localStorage.getItem("kick-giveaway-channel-name");
  const legacyKeyword = window.localStorage.getItem("kick-giveaway-keyword");

  if (!legacyChannel && !legacyKeyword) {
    return null;
  }

  return {
    channelName: legacyChannel ?? "",
    settings: {
      ...DEFAULT_SETTINGS,
      keyword: legacyKeyword ?? DEFAULT_SETTINGS.keyword,
    },
    entrants: [],
    winners: [],
    phase: "idle",
    pendingWinner: null,
    drawCount: 0,
  };
};

export const savePersistedState = (state: PersistedGiveawayState): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearPersistedState = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem("kick-giveaway-channel-name");
  window.localStorage.removeItem("kick-giveaway-keyword");
};

export const getInitialTheme = (): ThemeMode["mode"] => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const saveTheme = (mode: ThemeMode["mode"]): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
};
