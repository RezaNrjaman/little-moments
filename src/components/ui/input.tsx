import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-[var(--radius-sm)] border border-ink/10 bg-white/80 px-4 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus-visible:border-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/40 disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
