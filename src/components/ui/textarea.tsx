import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-32 w-full rounded-[var(--radius-sm)] border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus-visible:border-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/40 disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
