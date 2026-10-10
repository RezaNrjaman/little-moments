import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MemoryCard } from "@/components/scrapbook/MemoryCard";
import type { Memory, MemoryFilter as Filter } from "@/features/memories/types";

type MemoryTimelineProps = {
  memories: Memory[];
  page: number;
  totalPages: number;
  filter: Filter;
};

function buildHref(filter: Filter, page: number): string {
  const params = new URLSearchParams();
  if (filter.view !== "all") {
    params.set("view", filter.view);
    if (filter.view === "day") params.set("date", filter.date);
    if (filter.view === "month") params.set("month", filter.month);
    if (filter.view === "year") params.set("year", filter.year);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/memories?${query}` : "/memories";
}

/**
 * MemoryTimeline (DESIGN.md section 6): vertical journal timeline grouped
 * by year, newest first, responsive 1 / 2 / 3 columns.
 */
export function MemoryTimeline({
  memories,
  page,
  totalPages,
  filter,
}: MemoryTimelineProps) {
  const groups: { year: string; items: Memory[] }[] = [];

  for (const memory of memories) {
    const year = memory.memory_date.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      last.items.push(memory);
    } else {
      groups.push({ year, items: [memory] });
    }
  }

  let index = 0;

  return (
    <section aria-label="Linimasa kenangan" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.year}>
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-full bg-butter px-4 py-1 font-heading text-sm font-semibold text-ink shadow-soft">
                {group.year}
              </span>
              <span className="h-px flex-1 bg-ink/10" aria-hidden />
            </div>

            <div className="columns-2 gap-4 sm:columns-3 sm:gap-5 lg:columns-4">
              {group.items.map((memory) => {
                const currentIndex = index;
                index += 1;
                return (
                  <MemoryCard key={memory.id} memory={memory} index={currentIndex} />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Halaman linimasa"
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {page > 1 ? (
            <Link
              href={buildHref(filter, page - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Lebih baru
            </Link>
          ) : null}

          <span className="text-xs text-ink-soft">
            Halaman {page} dari {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={buildHref(filter, page + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              Lebih lama
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
