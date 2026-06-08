export const getConfirmationCountdownSeconds = (
  startedAt: number,
  confirmTimeSeconds: number,
  now = Date.now(),
): number => {
  const deadlineMs = startedAt + confirmTimeSeconds * 1_000;
  return Math.max(0, Math.ceil((deadlineMs - now) / 1_000));
};
