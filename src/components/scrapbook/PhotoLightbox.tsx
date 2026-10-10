"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Heart, MapPin, X } from "lucide-react";

export type LightboxPhoto = {
  id: string;
  /** Session-checked image source (e.g. /api/images/[id]). */
  src: string;
  alt: string;
  title?: string | null;
  /** Already formatted date, so the lightbox stays presentation only. */
  dateLabel?: string | null;
  location?: string | null;
  /** Optional link to the full memory page shown below the photo. */
  detailHref?: string | null;
};

type PhotoLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: LightboxPhoto[];
  /** Photo shown first when the lightbox opens. */
  startIndex?: number;
};

/**
 * PhotoLightbox (DESIGN.md section 8): a dimmed, scrapbook-framed viewer.
 * Click a photo on the timeline or the detail gallery to see it larger with
 * its date, location and a link back to the full story. Arrow keys and the
 * on-screen buttons move between photos; Esc (or the backdrop) closes.
 */
export function PhotoLightbox({
  open,
  onOpenChange,
  photos,
  startIndex = 0,
}: PhotoLightboxProps) {
  if (photos.length === 0) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm data-[state=open]:animate-fade-in" />

        <DialogPrimitive.Content
          onClick={(event) => {
            // The content fills the screen; close only when the dark padding
            // itself is clicked (not the photo or its caption).
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 focus:outline-none sm:p-10"
        >
          {/* Mounted only while open, so the viewer starts on startIndex. */}
          <LightboxViewer
            photos={photos}
            startIndex={startIndex}
            onClose={() => onOpenChange(false)}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

type LightboxViewerProps = {
  photos: LightboxPhoto[];
  startIndex: number;
  onClose: () => void;
};

function LightboxViewer({ photos, startIndex, onClose }: LightboxViewerProps) {
  const total = photos.length;
  const [index, setIndex] = useState(() => clampIndex(startIndex, total));
  const current = photos[index] ?? photos[0];

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setIndex((value) => (value - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setIndex((value) => (value + 1) % total);
  }, [total]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext]);

  return (
    <>
      <DialogPrimitive.Title className="sr-only">
        {current.title ?? "Foto kenangan"}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className="sr-only">
        Tampilan foto diperbesar. Gunakan tombol panah untuk berpindah foto.
      </DialogPrimitive.Description>

      <DialogPrimitive.Close
        aria-label="Tutup foto"
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-lift transition-transform hover:scale-105 focus-visible:outline-none"
      >
        <X className="h-5 w-5" aria-hidden />
      </DialogPrimitive.Close>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Foto sebelumnya"
            className="absolute left-2 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-lift transition-transform hover:scale-105 focus-visible:outline-none sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Foto berikutnya"
            className="absolute right-2 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-lift transition-transform hover:scale-105 focus-visible:outline-none sm:right-6"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </>
      ) : null}

      <figure
        key={current.id}
        className="animate-pop flex max-h-full w-full max-w-4xl flex-col items-center gap-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt}
          className="max-h-[68dvh] w-auto max-w-full rounded-[var(--radius-md)] border-[6px] border-white/95 object-contain shadow-lift"
        />

        <figcaption className="max-w-xl text-center text-white/95">
          {current.title ? (
            <p className="font-heading text-lg font-semibold">{current.title}</p>
          ) : null}

          {current.dateLabel || current.location ? (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-white/80">
              {current.dateLabel ? <span>{current.dateLabel}</span> : null}
              {current.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {current.location}
                </span>
              ) : null}
            </div>
          ) : null}

          {current.detailHref ? (
            <Link
              href={current.detailHref}
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pink-strong px-4 py-2 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
            >
              <Heart className="h-3.5 w-3.5" aria-hidden />
              Buka cerita lengkap
            </Link>
          ) : null}
        </figcaption>

        {total > 1 ? (
          <p className="text-xs font-semibold text-white/70">
            {index + 1} / {total}
          </p>
        ) : null}
      </figure>
    </>
  );
}

function clampIndex(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(value, 0), total - 1);
}
