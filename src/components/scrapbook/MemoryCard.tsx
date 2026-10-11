"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Heart, MapPin, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "@/components/scrapbook/PhotoLightbox";
import { Reveal } from "@/components/motion/Reveal";
import { FadeInImage } from "@/components/motion/FadeInImage";
import type { Memory } from "@/features/memories/types";

type MemoryCardProps = {
  memory: Memory;
  index: number;
};

const SNIPPET_LENGTH = 120;

/** Alternating tilts so the wall of photos feels hand-placed, not a grid. */
const ROTATIONS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "-rotate-[1.5deg]",
  "rotate-[0.5deg]",
];

/** Tiny sideways nudges for the messy scrapbook look. */
const OFFSETS = [
  "translate-x-0",
  "translate-x-1",
  "-translate-x-1",
  "translate-x-2",
  "-translate-x-2",
  "translate-x-0.5",
];

/** Mixed photo shapes, like scattered polaroids of different sizes. */
const ASPECTS = [
  "aspect-[4/3]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[5/4]",
  "aspect-square",
];

/**
 * MemoryCard (DESIGN.md section 7): a taped polaroid that reveals itself the
 * first time it scrolls into view. Photos have varied shapes and tilts so the
 * masonry reads like a scrapbook page. The photo opens a lightbox; the caption
 * links to the story.
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
      <Reveal
        delay={(index % 4) * 60}
        className="mb-4 break-inside-avoid sm:mb-5"
      >
        <div
          className={cn(
            "polaroid group relative flex w-full flex-col p-2.5 transition-all duration-300 hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-lift sm:p-3",
            ROTATIONS[index % ROTATIONS.length],
            OFFSETS[index % OFFSETS.length],
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
            <FadeInImage
              src={`/api/images/${memory.id}`}
              alt={memory.title}
              loading="lazy"
              className={cn(
                "w-full object-cover transition-transform duration-700 ease-out group-hover/photo:scale-[1.08]",
                ASPECTS[index % ASPECTS.length],
              )}
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft sm:text-[11px]">
              {dateLabel}
            </p>
            <h3 className="mt-0.5 break-words font-heading text-base font-semibold leading-snug text-ink sm:text-lg">
              {memory.title}
            </h3>

            {story ? (
              <p className="mt-1 line-clamp-2 break-words text-xs text-ink-soft sm:text-sm">
                {story.length > SNIPPET_LENGTH
                  ? `${story.slice(0, SNIPPET_LENGTH).trimEnd()}...`
                  : story}
              </p>
            ) : null}

            {memory.location ? (
              <p className="mt-1.5 flex items-start gap-1 break-words text-[11px] text-ink-soft/90 sm:mt-2 sm:text-xs">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                <span className="min-w-0">{memory.location}</span>
              </p>
            ) : null}

            <span className="mt-auto inline-flex items-center gap-1 pt-2.5 text-[11px] font-semibold text-pink-strong transition-colors group-hover/link:text-ink sm:pt-3 sm:text-xs">
              <Heart className="h-3.5 w-3.5" aria-hidden />
              Buka cerita
            </span>
          </Link>
        </div>
      </Reveal>

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
