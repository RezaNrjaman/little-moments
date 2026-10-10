"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarHeart,
  MapPin,
  Maximize2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteMemoryDialog } from "@/components/forms/DeleteMemoryDialog";
import {
  PhotoLightbox,
  type LightboxPhoto,
} from "@/components/scrapbook/PhotoLightbox";
import { cn } from "@/lib/utils";
import type { Memory, MemoryImage } from "@/features/memories/types";

type MemoryDetailProps = {
  memory: Memory;
  /** Extra photos shown in the gallery below the story. */
  images?: MemoryImage[];
};

/** Alternating tilts for the extra-photo gallery, mirroring the timeline. */
const GALLERY_ROTATIONS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "-rotate-[1.5deg]",
  "rotate-[0.5deg]",
];

/**
 * MemoryDetail (DESIGN.md section 8).
 * The photo is the hero element, the story is limited to a 700px column.
 * Tapping any photo opens the framed lightbox with the full set.
 */
export function MemoryDetail({ memory, images = [] }: MemoryDetailProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const date = parseISO(memory.memory_date);
  const hasStory = memory.description.trim().length > 0;
  const dateLabel = Number.isNaN(date.getTime())
    ? memory.memory_date
    : format(date, "EEEE, d MMMM yyyy", { locale: localeId });

  const coverSrc = `/api/images/${memory.id}`;
  const photos: LightboxPhoto[] = [
    {
      id: memory.id,
      src: coverSrc,
      alt: memory.title,
      title: memory.title,
      dateLabel,
      location: memory.location,
    },
    ...images.map((image, index) => ({
      id: image.id,
      src: `/api/memory-images/${image.id}`,
      alt: `${memory.title} - foto ${index + 2}`,
      title: memory.title,
      dateLabel,
      location: memory.location,
    })),
  ];

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-6 pt-4 sm:px-6">
      <Link
        href="/memories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke linimasa
      </Link>

      <div className="polaroid relative p-3 sm:p-4">
        <span className="tape" aria-hidden />

        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`Perbesar foto: ${memory.title}`}
          className="group relative block w-full overflow-hidden rounded-[8px] focus-visible:outline-none"
        >
          {/* Private photo, served by the session-checked image route. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverSrc}
            alt={memory.title}
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] sm:aspect-[16/10]"
          />

          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-3 right-3 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden
          >
            <Maximize2 className="h-4 w-4" />
          </span>
        </button>

        <div className="px-2 pb-2 pt-5 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            <CalendarHeart className="h-3.5 w-3.5" aria-hidden />
            {dateLabel}
          </p>

          <h1 className="mt-2 text-balance break-words font-heading text-3xl font-semibold leading-tight text-ink">
            {memory.title}
          </h1>

          {memory.location ? (
            <p className="mt-2 flex items-start justify-center gap-1.5 text-sm text-ink-soft">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span className="min-w-0 break-words">{memory.location}</span>
            </p>
          ) : null}
        </div>
      </div>

      {hasStory ? (
        <section className="mx-auto mt-6 max-w-[700px]">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-mint px-4 py-1 font-heading text-sm font-semibold text-ink shadow-soft">
              Cerita kita
            </span>
            <span className="h-px flex-1 bg-ink/10" aria-hidden />
          </div>

          <p className="whitespace-pre-wrap break-words text-base leading-7 text-ink/90">
            {memory.description}
          </p>
        </section>
      ) : (
        <p className="mt-6 text-center text-sm italic text-ink-soft">
          Belum ada cerita untuk momen ini.
        </p>
      )}

      {images.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-butter px-4 py-1 font-heading text-sm font-semibold text-ink shadow-soft">
              Foto lainnya
            </span>
            <span className="h-px flex-1 bg-ink/10" aria-hidden />
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((image, index) => (
              <li
                key={image.id}
                className={cn(
                  "animate-rise polaroid p-2 transition-transform duration-300 hover:z-10 hover:-translate-y-1 hover:rotate-0",
                  GALLERY_ROTATIONS[index % GALLERY_ROTATIONS.length],
                )}
                style={
                  { "--rise-delay": `${index * 60}ms` } as CSSProperties
                }
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index + 1)}
                  aria-label={`Perbesar ${memory.title} - foto ${index + 2}`}
                  className="group relative block w-full overflow-hidden rounded-[8px] focus-visible:outline-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/memory-images/${image.id}`}
                    alt={`${memory.title} - foto ${index + 2}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/15"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild variant="secondary">
          <Link href={`/memories/${memory.id}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden />
            Ubah
          </Link>
        </Button>
        <DeleteMemoryDialog memoryId={memory.id} />
      </div>

      <PhotoLightbox
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
        photos={photos}
        startIndex={lightboxIndex ?? 0}
      />
    </article>
  );
}
