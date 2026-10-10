import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Memory } from "@/features/memories/types";

type MemoryCardProps = {
  memory: Memory;
  index: number;
};

const SNIPPET_LENGTH = 120;

/**
 * MemoryCard (DESIGN.md section 7): polaroid photo card, rounded corners,
 * soft shadow and a slight alternating rotation.
 */
export function MemoryCard({ memory, index }: MemoryCardProps) {
  const date = parseISO(memory.memory_date);
  const story = memory.description.trim();

  return (
    <Link
      href={`/memories/${memory.id}`}
      className={cn(
        "polaroid group block w-full p-3 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1",
        index % 4 === 0 && "-rotate-1",
        index % 4 === 1 && "rotate-1",
        index % 4 === 2 && "-rotate-[0.6deg]",
        index % 4 === 3 && "rotate-[0.4deg]",
      )}
    >
      <div className="overflow-hidden rounded-[8px] bg-cream">
        {/* Private photo: proxied through the session-checked image route. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/images/${memory.id}`}
          alt={memory.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="px-1 pb-1 pt-3 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {isValid(date)
            ? format(date, "d MMMM yyyy", { locale: localeId })
            : memory.memory_date}
        </p>
        <h3 className="mt-0.5 font-heading text-lg font-semibold leading-snug text-ink">
          {memory.title}
        </h3>

        {story ? (
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
            {story.length > SNIPPET_LENGTH
              ? `${story.slice(0, SNIPPET_LENGTH).trimEnd()}...`
              : story}
          </p>
        ) : null}

        {memory.location ? (
          <p className="mt-2 flex items-center gap-1 text-xs text-ink-soft/90">
            <MapPin className="h-3 w-3" aria-hidden />
            {memory.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function isValid(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
