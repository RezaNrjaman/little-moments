import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * FallingPetals (DESIGN.md section 15): a decorative, non-interactive layer of
 * rose petals drifting down behind the page content. Values are derived
 * deterministically so the server and client markup always match, and it is
 * pure CSS (no JavaScript runs on the client). Hidden for reduced motion by the
 * global `prefers-reduced-motion` rule.
 */

const GLYPHS = ["🌹", "🌸", "🌹", "🌸", "🌹", "🌷"];

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  glyph: GLYPHS[i % GLYPHS.length],
  left: (i * 53 + 11) % 100,
  size: 14 + ((i * 7) % 5) * 5,
  delay: ((i * 17) % 160) / 10,
  duration: 11 + ((i * 13) % 8),
  sway: 24 + ((i * 29) % 5) * 18,
  spin: 200 + ((i * 41) % 5) * 90,
  opacity: 0.26 + ((i * 3) % 4) * 0.07,
}));

export function FallingPetals({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="lm-petal"
          style={
            {
              left: `${petal.left}%`,
              fontSize: `${petal.size}px`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              "--petal-opacity": `${petal.opacity}`,
              "--sway": `${petal.sway}px`,
              "--spin": `${petal.spin}deg`,
            } as CSSProperties
          }
        >
          {petal.glyph}
        </span>
      ))}
    </div>
  );
}
