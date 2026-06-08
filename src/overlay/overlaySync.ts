import type { OverlaySyncPayload } from "@/overlay/overlay.types";
import { OVERLAY_BROADCAST_CHANNEL } from "@/overlay/overlay.types";

type OverlayBroadcastMessage =
  | { type: "state"; payload: OverlaySyncPayload }
  | { type: "request-sync" };

const getBroadcastChannel = (): BroadcastChannel | null => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  return new BroadcastChannel(OVERLAY_BROADCAST_CHANNEL);
};

export const publishOverlayStateLocal = (payload: OverlaySyncPayload): void => {
  const channel = getBroadcastChannel();
  if (!channel) {
    return;
  }

  channel.postMessage({
    type: "state",
    payload,
  } satisfies OverlayBroadcastMessage);
  channel.close();
};

export const subscribeOverlayStateLocal = (
  onState: (payload: OverlaySyncPayload) => void,
  onRequestSync?: () => void,
): (() => void) => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => {};
  }

  const channel = new BroadcastChannel(OVERLAY_BROADCAST_CHANNEL);

  const handleMessage = (event: MessageEvent<OverlayBroadcastMessage>): void => {
    const message = event.data;
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "state") {
      onState(message.payload);
      return;
    }

    if (message.type === "request-sync") {
      onRequestSync?.();
    }
  };

  channel.addEventListener("message", handleMessage);

  return () => {
    channel.removeEventListener("message", handleMessage);
    channel.close();
  };
};

export const fetchOverlayStateRemote = async (
  sessionId: string,
): Promise<OverlaySyncPayload | null> => {
  const response = await fetch(
    `/api/overlay/state?session=${encodeURIComponent(sessionId)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { state?: OverlaySyncPayload | null };
  return data.state ?? null;
};

export const publishOverlayStateRemote = async (
  sessionId: string,
  payload: OverlaySyncPayload,
): Promise<void> => {
  await fetch("/api/overlay/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, state: payload }),
    keepalive: true,
  });
};
