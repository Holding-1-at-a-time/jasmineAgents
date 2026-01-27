"use client";

import { useState, useEffect, useRef } from "react";

/**
 * useSmoothText
 * A hook to smooth out the visual display of streamed tokens.
 * Adapts to the average speed of incoming delivery.
 */
export function useSmoothText(rawText: string, speedMs: number = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const rawTextRef = useRef(rawText);

  useEffect(() => {
    rawTextRef.current = rawText;
  }, [rawText]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (indexRef.current < rawTextRef.current.length) {
        setDisplayedText(prev => prev + rawTextRef.current[indexRef.current]);
        indexRef.current += 1;
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [speedMs]);

  return displayedText;
}
