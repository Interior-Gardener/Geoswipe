import { useCallback, useEffect, useState } from 'react';

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

function isFullscreenEnabled() {
  return Boolean(
    document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
  );
}

async function requestElementFullscreen(target) {
  if (!target) {
    return false;
  }

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return true;
    }
    if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen();
      return true;
    }
    if (target.mozRequestFullScreen) {
      target.mozRequestFullScreen();
      return true;
    }
    if (target.msRequestFullscreen) {
      target.msRequestFullscreen();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

async function exitDocumentFullscreen() {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    }
    if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
      return true;
    }
    if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
      return true;
    }
    if (document.msExitFullscreen) {
      document.msExitFullscreen();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function useBrowserFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    setIsSupported(isFullscreenEnabled());

    const syncState = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));
    };

    syncState();

    document.addEventListener('fullscreenchange', syncState);
    document.addEventListener('webkitfullscreenchange', syncState);
    document.addEventListener('mozfullscreenchange', syncState);
    document.addEventListener('MSFullscreenChange', syncState);

    return () => {
      document.removeEventListener('fullscreenchange', syncState);
      document.removeEventListener('webkitfullscreenchange', syncState);
      document.removeEventListener('mozfullscreenchange', syncState);
      document.removeEventListener('MSFullscreenChange', syncState);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    const element = targetRef?.current;
    if (!element) {
      return false;
    }

    return requestElementFullscreen(element);
  }, [targetRef]);

  const exitFullscreen = useCallback(async () => {
    return exitDocumentFullscreen();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
      return true;
    }

    return enterFullscreen();
  }, [enterFullscreen, exitFullscreen, isFullscreen]);

  return {
    isSupported,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
