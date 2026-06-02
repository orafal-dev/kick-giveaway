import type { KickChatMessage } from "@/App.types";
import { WINNER_CONFIRMATION_MESSAGES_LIMIT } from "@/giveaway/giveaway.constants";
import type {
  PendingWinner,
  WinnerConfirmationMessage,
  WinnerRecord,
} from "@/giveaway/giveaway.types";
import { normalizeValue } from "@/services/drawUtils";

export interface WinnerChatCapture {
  userId: string;
  username: string;
  captureUntil: number;
}

const isSameWinnerIdentity = (
  chatMessage: KickChatMessage,
  userId: string,
  username: string,
): boolean => {
  if (chatMessage.userId === userId) {
    return true;
  }

  return normalizeValue(chatMessage.username) === normalizeValue(username);
};

export const createWinnerChatCapture = (
  userId: string,
  username: string,
  startedAt: number,
  confirmTimeSeconds: number,
): WinnerChatCapture => ({
  userId,
  username,
  captureUntil: startedAt + confirmTimeSeconds * 1_000,
});

export const isMessageFromPendingWinner = (
  chatMessage: KickChatMessage,
  pending: PendingWinner,
): boolean =>
  isSameWinnerIdentity(chatMessage, pending.userId, pending.username);

export const isMessageFromWinnerChatCapture = (
  chatMessage: KickChatMessage,
  capture: WinnerChatCapture,
): boolean =>
  isSameWinnerIdentity(chatMessage, capture.userId, capture.username);

export const toConfirmationMessage = (
  chatMessage: KickChatMessage,
): WinnerConfirmationMessage => ({
  message: chatMessage.message,
  timestamp:
    Number.isFinite(chatMessage.timestamp) && chatMessage.timestamp > 0
      ? chatMessage.timestamp
      : Date.now(),
});

export const appendConfirmationMessage = (
  existingMessages: WinnerConfirmationMessage[],
  entry: WinnerConfirmationMessage,
  limit = WINNER_CONFIRMATION_MESSAGES_LIMIT,
): WinnerConfirmationMessage[] => {
  const alreadyCaptured = existingMessages.some(
    (existing) =>
      existing.message === entry.message &&
      existing.timestamp === entry.timestamp,
  );

  if (alreadyCaptured) {
    return existingMessages;
  }

  return [entry, ...existingMessages].slice(0, limit);
};

export const getWinnerChatMessages = (
  winner: WinnerRecord,
  recentChatMessages: KickChatMessage[],
): WinnerConfirmationMessage[] => {
  if (winner.confirmationMessages.length > 0) {
    return winner.confirmationMessages;
  }

  return recentChatMessages
    .filter(
      (message) =>
        message.userId === winner.userId ||
        normalizeValue(message.username) === normalizeValue(winner.username),
    )
    .map((message) => ({
      message: message.message,
      timestamp:
        Number.isFinite(message.timestamp) && message.timestamp > 0
          ? message.timestamp
          : Date.now(),
    }));
};
