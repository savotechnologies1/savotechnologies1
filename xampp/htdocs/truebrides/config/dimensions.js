import { useState, useEffect } from "react";

function getWindowDimensions() {
  const isServer = typeof window === "undefined";
  const height = !isServer ? window.innerHeight : 768;
  const width = !isServer ? window.innerWidth : 1268;
  const windowHeight = !isServer ? window.screen.height : 1268;
  const windowWidth = !isServer ? window.screen.width : 1268;
  const isMobilePad = !isServer ? window.innerWidth < 959 : false;
  const isMobile = !isServer ? window.innerWidth < 580 : false;
  return {
    windowHeight,
    windowWidth,
    height,
    width,
    isMobilePad,
    isMobile,
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
