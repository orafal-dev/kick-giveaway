"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";

const MAX_VISIBLE = 5;

const PARTICIPANT_TEXT_STYLE = {
  color: "#ffffff",
  WebkitTextStroke: "1.5px #000000",
  paintOrder: "stroke fill",
  textShadow: "0 1px 8px rgba(0,0,0,0.45)",
} as const;

export interface OverlayParticipantsListProps {
  participants: ReadonlyArray<{ userId: string; username: string }>;
}

export const OverlayParticipantsList = ({
  participants,
}: OverlayParticipantsListProps) => {
  const visibleParticipants = useMemo(
    () => [...participants].slice(-MAX_VISIBLE).reverse(),
    [participants],
  );

  if (visibleParticipants.length === 0) {
    return null;
  }

  return (
    <ul
      className="flex flex-col gap-1.5"
      aria-label="Recent participants"
      aria-live="polite"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {visibleParticipants.map((participant) => (
          <motion.li
            key={participant.userId}
            layout
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl font-bold tracking-tight md:text-2xl"
            style={PARTICIPANT_TEXT_STYLE}
          >
            {participant.username}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
