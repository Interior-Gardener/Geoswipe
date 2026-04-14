import { useCallback, useEffect, useState } from 'react';
import { useBrowserFullscreen } from './useBrowserFullscreen';

export function usePanelFullscreen(targetRef) {
  const [fallbackExpanded, setFallbackExpanded] = useState(false);
  const { isSupported, isFullscreen, toggleFullscreen } = useBrowserFullscreen(targetRef);

  useEffect(() => {
    if (isSupported && !isFullscreen) {
      setFallbackExpanded(false);
    }
  }, [isFullscreen, isSupported]);

  const togglePanelFullscreen = useCallback(async () => {
    if (isSupported) {
      const handledByBrowser = await toggleFullscreen();
      if (handledByBrowser) {
        return;
      }
    }

    setFallbackExpanded((previous) => !previous);
  }, [isSupported, toggleFullscreen]);

  return {
    isSupported,
    isBrowserFullscreen: isFullscreen,
    isExpanded: isFullscreen || fallbackExpanded,
    togglePanelFullscreen
  };
}
