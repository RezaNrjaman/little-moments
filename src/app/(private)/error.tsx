"use client";

import { useEffect } from "react";
import { HeartCrack, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for every private page.
 * Shows a friendly message without leaking any internal detail.
 */
export default function PrivateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Internal details stay out of the UI; the digest is enough for support.
    console.error("Little Moments page error", error.digest);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <div className="polaroid flex flex-col items-center px-6 py-10 text-center">
        <span className="sticker mb-4 h-14 w-14 bg-lavender text-xl">
          <HeartCrack className="h-6 w-6 text-ink" aria-hidden />
        </span>

        <h2 className="font-heading text-xl font-semibold text-ink">
          Aduh, ada yang salah
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Bagian buku ini belum bisa dibuka. Coba lagi ya.
        </p>

        <Button type="button" onClick={reset} className="mt-5">
          <RefreshCcw className="h-4 w-4" aria-hidden />
          Coba lagi
        </Button>
      </div>
    </div>
  );
}
