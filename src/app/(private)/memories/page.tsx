import { requirePageSession } from "@/lib/auth/session";
import {
  getMemories,
  getMemoryYears,
  TIMELINE_PAGE_SIZE,
} from "@/features/memories/queries";
import { getScrapbookSettings } from "@/features/settings/queries";
import { parseMemoryFilter } from "@/features/memories/schemas";
import { RelationshipCounter } from "@/components/scrapbook/RelationshipCounter";
import { MemoryFilter } from "@/components/scrapbook/MemoryFilter";
import { MemoryTimeline } from "@/components/scrapbook/MemoryTimeline";
import { EmptyState } from "@/components/scrapbook/EmptyState";
import { FloatingAddButton } from "@/components/scrapbook/FloatingAddButton";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * `/memories` - the timeline (FR-02) with day / month / year filters (FR-07).
 * Filtering happens in the database query, not only in the browser.
 */
export default async function MemoriesPage({ searchParams }: Props) {
  await requirePageSession();

  const params = await searchParams;
  const { filter, error: filterError } = parseMemoryFilter(params);

  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const [settings, years, timeline] = await Promise.all([
    getScrapbookSettings(),
    getMemoryYears(),
    getMemories(filter, page, TIMELINE_PAGE_SIZE),
  ]);

  const isFiltered = filter.view !== "all";

  return (
    <>
      <RelationshipCounter startDate={settings.relationship_start_date} />

      <MemoryFilter filter={filter} years={years} />

      <div className="mt-6">
        {filterError ? (
          <p
            role="alert"
            className="mx-auto mb-4 max-w-xl rounded-[var(--radius-sm)] bg-[#fff3d6] px-4 py-3 text-center text-sm font-medium text-[#7a5a1e]"
          >
            {filterError} Menampilkan semua kenangan.
          </p>
        ) : null}

        {timeline.total === 0 ? (
          isFiltered ? (
            <EmptyState
              title="Kenangan tidak ditemukan"
              description="Belum ada apa pun di buku untuk tanggal itu."
              actionHref="/memories"
              actionLabel="Tampilkan semua"
            />
          ) : (
            <EmptyState />
          )
        ) : (
          <MemoryTimeline
            memories={timeline.memories}
            page={timeline.page}
            totalPages={timeline.totalPages}
            filter={filter}
          />
        )}
      </div>

      <FloatingAddButton />
    </>
  );
}
