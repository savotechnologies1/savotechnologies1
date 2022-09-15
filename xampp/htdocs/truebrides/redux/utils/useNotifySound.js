import siteConfig from "@config/siteConfig";
import { useEffect, useRef, useState } from "react";

export default function useNotifySound() {
  const [audio] = useState(
    new Audio(`${siteConfig.domainUrl}/assets/sounds/notify.mp3`)
  );

  const windowIsActive = useRef(false);

  useEffect(() => {
    const handleActivityFalse = () => handleActivity(false);
    const handleActivityTrue = () => handleActivity(true);

    document.addEventListener("visibilitychange", handleActivity);
    window.addEventListener("blur", handleActivityFalse);
    window.addEventListener("focus", handleActivityTrue);
    document.addEventListener("blur", handleActivityFalse);
    document.addEventListener("focus", handleActivityTrue);

    return () => {
      window.removeEventListener("blur", handleActivity);
      document.removeEventListener("blur", handleActivityFalse);
      window.removeEventListener("focus", handleActivityFalse);
      document.removeEventListener("focus", handleActivityTrue);
      document.removeEventListener("visibilitychange", handleActivityTrue);
    };
  }, []);

  function handleActivity(forcedFlag) {
    if (typeof forcedFlag === "boolean") {
      return forcedFlag
        ? (windowIsActive.current = true)
        : (windowIsActive.current = false);
    }

    return document.hidden
      ? (windowIsActive.current = false)
      : (windowIsActive.current = true);
  }

  const playSound = () => {
    if (!windowIsActive.current) {
      audio.play();
    }
  };

  return {
    play: () => playSound(),
  };
}
