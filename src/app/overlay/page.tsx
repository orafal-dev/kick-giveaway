import { ObsOverlayView } from "@/components/giveaway/ObsOverlayView";
import { parseOverlayLayoutSearchParams } from "@/overlay/overlayLayout.utils";

interface OverlayPageProps {
  searchParams: Promise<{
    session?: string;
    transparent?: string;
    wheel?: string;
    confirm?: string;
    winner?: string;
    noshow?: string;
    dismiss?: string;
  }>;
}

const OverlayPage = async ({ searchParams }: OverlayPageProps) => {
  const params = await searchParams;
  const sessionId = params.session?.trim() ?? "";
  const transparent = params.transparent === "1" || params.transparent === "true";
  const initialLayout = parseOverlayLayoutSearchParams(params);

  return (
    <ObsOverlayView
      sessionId={sessionId}
      transparent={transparent}
      initialLayout={initialLayout}
    />
  );
};

export default OverlayPage;
