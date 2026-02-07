"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingEffectProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function TypingEffect({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true,
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  useEffect(() => {
    if (!cursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [cursor]);

  return (
    <span className={cn(className)}>
      {displayedText}
      {cursor && (
        <span
          className={cn(
            "inline-block w-0.5 h-[1em] bg-primary ml-0.5 align-middle",
            showCursor ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </span>
  );
}
