import type { ReactNode } from "react";
import Script from "next/script";
import { OVERLAY_OBS_KEEP_ALIVE_SCRIPT } from "@/overlay/overlayKeepAlive";

type OverlayRouteLayoutProps = {
  children: ReactNode;
};

const OverlayRouteLayout = ({ children }: OverlayRouteLayoutProps) => (
  <>
    <Script id="overlay-obs-keep-alive" strategy="beforeInteractive">
      {OVERLAY_OBS_KEEP_ALIVE_SCRIPT}
    </Script>
    {children}
  </>
);

export default OverlayRouteLayout;
