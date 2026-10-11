"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Cascade offset for photos that appear together (ms). */
  delay?: number;
  className?: string;
};

/**
 * Reveal (DESIGN.md section 15.1): photos fade and lift into place the first
 * time they enter the viewport, instead of animating once at page load while
 * still being off screen.
 *
 * The wrapper ships hidden (`.lm-reveal` in globals.css) and gets
 * `.lm-reveal-in` exactly once, so scrolling back up never hides it again.
 * Content can never stay invisible:
 * - JavaScript disabled -> the <noscript> style in the root layout shows it.
 * - Reduced motion      -> the global rule collapses the animation to a frame.
 * - Missed callback     -> anything still inside the viewport is revealed.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    // Very old browsers: never leave the content hidden.
    if (typeof IntersectionObserver === "undefined") {
      const fallback = window.setTimeout(() => setRevealed(true), 0);
      return () => window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      // Start a touch before the photo is fully on screen.
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    observer.observe(node);

    // Safety net: a photo already on screen is never left hidden.
    const safety = window.setTimeout(() => {
      if (isInsideViewport(node)) setRevealed(true);
    }, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, [revealed]);

  return (
    <div
      ref={nodeRef}
      className={cn("lm-reveal", revealed && "lm-reveal-in", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function isInsideViewport(node: HTMLElement): boolean {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}
