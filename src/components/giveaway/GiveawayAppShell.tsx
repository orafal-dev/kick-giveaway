/** Neutral full-viewport shell shown until client persistence is restored (SSR-safe). */
export const GiveawayAppShell = () => {
  return (
    <main
      id="main-content"
      className="min-h-full flex-1 bg-background"
      aria-busy="true"
      aria-label="Loading giveaway"
    />
  );
};
