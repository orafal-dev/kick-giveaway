/** OBS Browser Source often reports the page as hidden, throttling timers and animations. */
export const enableOverlayObsKeepAlive = (): void => {
  if (typeof document === "undefined") {
    return;
  }

  try {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  } catch {
    // Ignore if the browser refuses the override.
  }
};

export const OVERLAY_OBS_KEEP_ALIVE_SCRIPT = `(function(){try{Object.defineProperty(document,"hidden",{configurable:true,get:function(){return false;}});Object.defineProperty(document,"visibilityState",{configurable:true,get:function(){return"visible";}});}catch(e){}})();`;
