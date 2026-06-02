import Confetti from "react-confetti";
import type { CSSProperties } from "react";

const confettiCanvasStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 9999,
  pointerEvents: "none",
};

type GiveawayConfettiProps = {
  width: number;
  height: number;
  onComplete?: () => void;
};

export const GiveawayConfetti = ({
  width,
  height,
  onComplete,
}: GiveawayConfettiProps) => {
  if (width === 0 || height === 0) {
    return null;
  }

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      onConfettiComplete={onComplete}
      style={confettiCanvasStyle}
    />
  );
};
