import { LoadingState } from "@/components/scrapbook/LoadingState";

/** Skeleton while the timeline is loading (DESIGN.md section 12). */
export default function PrivateLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
      <LoadingState />
    </div>
  );
}
