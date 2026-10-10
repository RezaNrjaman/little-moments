"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Heart, MapPin, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "@/components/scrapbook/PhotoLightbox";
import type { Memory } from "@/features/memories/types";

type MemoryCardProps = {
  memory: Memory;
  index: number;
};

const SNIPPET_LENGTH = 120;

/** Slight alternating tilt, like photos taped to a page. */
const ROTATIONS = [
  "-rotate-1",
  "rotate-1",
  "-rotate-[0.6deg]",
  "rotate-[0.4deg]",
];

/**
 * MemoryCard (DESIGN.md section 7): polaroid photo card with a soft rise-in
 * animation. The photo opens a lightbox; the caption links to the full story.
 */
export function MemoryCard({ memory, index }: MemoryCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const date = parseISO(memory.memory_date);
  const dateLabel = isValid(date)
    ? format(date, "d MMMM yyyy", { locale: localeId })
    : memory.memory_date;
  const story = memory.description.trim();

  return (
    <>
      <div
        className="animate-rise h-full"
        style={
          { "--rise-delay": `${Math.min(index, 11) * 55}ms` } as CSSProperties
        }
      >
        <div
          className={cn(
            "polaroid group relative flex h-full w-full flex-col p-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lift",
            ROTATIONS[index % ROTATIONS.length],
          )}
        >
          <span
            className="tape opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Perbesar foto: ${memory.title}`}
            className="group/photo relative block w-full overflow-hidden rounded-[8px] bg-cream focus-visible:outline-none"
          >
            {/* Private photo: proxied through the session-checked image route. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/images/${memory.id}`}
              alt={memory.title}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover/photo:scale-[1.06]"
            />

            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/photo:opacity-100"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute bottom-2 right-2 inline-flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition-all duration-300 group-hover/photo:translate-y-0 group-hover/photo:opacity-100"
              aria-hidden
            >
              <Maximize2 className="h-4 w-4" />
            </span>
          </button>

          <Link
            href={`/memories/${memory.id}`}
            className="group/link mt-3 flex flex-1 flex-col px-1 pb-1 text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {dateLabel}
            </p>
            <h3 className="mt-0.5 break-words font-heading text-lg font-semibold leading-snug text-ink">
              {memory.title}
            </h3>

            {story ? (
              <p className="mt-1 line-clamp-2 break-words text-sm text-ink-soft">
                {story.length > SNIPPET_LENGTH
                  ? `${story.slice(0, SNIPPET_LENGTH).trimEnd()}...`
                  : story}
              </p>
            ) : null}

            {memory.location ? (
              <p className="mt-2 flex items-start gap-1 break-words text-xs text-ink-soft/90">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                <span className="min-w-0">{memory.location}</span>
              </p>
            ) : null}

            <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-pink-strong transition-colors group-hover/link:text-ink">
              <Heart className="h-3.5 w-3.5" aria-hidden />
              Buka cerita
            </span>
          </Link>
        </div>
      </div>

      <PhotoLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        photos={[
          {
            id: memory.id,
            src: `/api/images/${memory.id}`,
            alt: memory.title,
            title: memory.title,
            dateLabel,
            location: memory.location,
            detailHref: `/memories/${memory.id}`,
          },
        ]}
      />
    </>
  );
}

function isValid(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
