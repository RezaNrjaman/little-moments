import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, CalendarHeart, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteMemoryDialog } from "@/components/forms/DeleteMemoryDialog";
import type { Memory, MemoryImage } from "@/features/memories/types";

type MemoryDetailProps = {
  memory: Memory;
  /** Extra photos shown in the gallery below the story. */
  images?: MemoryImage[];
};

/**
 * MemoryDetail (DESIGN.md section 8).
 * The photo is the hero element, the story is limited to a 700px column.
 */
export function MemoryDetail({ memory, images = [] }: MemoryDetailProps) {
  const date = parseISO(memory.memory_date);
  const hasStory = memory.description.trim().length > 0;

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

        {/* Private photo, served by the session-checked image route. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/images/${memory.id}`}
          alt={memory.title}
          className="aspect-[4/3] w-full rounded-[8px] object-cover sm:aspect-[16/10]"
        />

        <div className="px-2 pb-2 pt-5 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            <CalendarHeart className="h-3.5 w-3.5" aria-hidden />
            {Number.isNaN(date.getTime())
              ? memory.memory_date
              : format(date, "EEEE, d MMMM yyyy", { locale: localeId })}
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
              <li key={image.id} className="polaroid p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/memory-images/${image.id}`}
                  alt={`${memory.title} - foto ${index + 2}`}
                  className="aspect-square w-full rounded-[8px] object-cover"
                />
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
    </article>
  );
}
