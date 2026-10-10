import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  /** How many skeleton cards to show. */
  count?: number;
};

/**
 * LoadingState (DESIGN.md section 12): skeleton cards with a soft pulse.
 * Never shows the empty state while data is still loading.
 */
export function LoadingState({ count = 6 }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label="Memuat kenangan"
      className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="polaroid space-y-3 p-3"
          aria-hidden={index > 0}
        >
          <Skeleton className="aspect-[4/3] w-full bg-ink/10" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
      <span className="sr-only">Memuat kenangan...</span>
    </div>
  );
}
