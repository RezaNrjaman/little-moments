import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  Memory,
  MemoryFilter,
  MemoryImage,
  MemoryPage,
} from "@/features/memories/types";

/**
 * Data access layer for memories (ARCHITECTURE.md section 5.2).
 *
 * Every function here runs on the server and its callers MUST already
 * have validated the scrapbook session (RLS blocks public access, the
 * service role key bypasses RLS).
 */

export const TIMELINE_PAGE_SIZE = 12;

const MEMORY_COLUMNS =
  "id, title, description, memory_date, location, image_path, created_at, updated_at";

/** Inclusive lower / exclusive upper bound for a filter. */
function filterRange(
  filter: MemoryFilter,
): { column: "memory_date"; from?: string; to?: string; exact?: string } {
  switch (filter.view) {
    case "day":
      return { column: "memory_date", exact: filter.date };
    case "month": {
      const [year, month] = filter.month.split("-").map(Number);
      const start = `${filter.month}-01`;
      const nextMonth =
        month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, "0")}-01`;
      return { column: "memory_date", from: start, to: nextMonth };
    }
    case "year":
      return {
        column: "memory_date",
        from: `${filter.year}-01-01`,
        to: `${Number(filter.year) + 1}-01-01`,
      };
    default:
      return { column: "memory_date" };
  }
}

/** Fetch one page of memories, newest first (PRD FR-02, FR-07). */
export async function getMemories(
  filter: MemoryFilter,
  page = 1,
  pageSize: number = TIMELINE_PAGE_SIZE,
): Promise<MemoryPage> {
  const supabase = getSupabaseAdmin();
  const requestedPage = Math.max(1, Math.floor(page));
  const range = filterRange(filter);

  // Count first so an out-of-range page can be clamped to the last page.
  // PostgREST answers a .range() past the end with 416 ("Requested range
  // not satisfiable"), which must not surface as an error to the user.
  async function countFiltered(): Promise<number> {
    let countQuery = supabase
      .from("memories")
      .select("id", { count: "exact", head: true });

    if (range.exact) {
      countQuery = countQuery.eq("memory_date", range.exact);
    } else {
      if (range.from) countQuery = countQuery.gte("memory_date", range.from);
      if (range.to) countQuery = countQuery.lt("memory_date", range.to);
    }

    const { count, error } = await countQuery;
    if (error) throw new Error("Kenangan belum bisa dimuat.");
    return count ?? 0;
  }

  const total = await countFiltered();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(requestedPage, totalPages);
  const from = (safePage - 1) * pageSize;

  let query = supabase.from("memories").select(MEMORY_COLUMNS);

  if (range.exact) {
    query = query.eq("memory_date", range.exact);
  } else {
    if (range.from) query = query.gte("memory_date", range.from);
    if (range.to) query = query.lt("memory_date", range.to);
  }

  const { data, error } = await query
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) throw new Error("Kenangan belum bisa dimuat.");

  return {
    memories: (data ?? []) as Memory[],
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

/** Fetch a single memory by id. Returns null when it does not exist. */
export async function getMemory(id: string): Promise<Memory | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("memories")
    .select(MEMORY_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Kenangan ini belum bisa dimuat.");
  return (data as Memory | null) ?? null;
}

const MEMORY_IMAGE_COLUMNS =
  "id, memory_id, image_path, position, created_at";

/** Extra photos of a memory, ordered for the detail gallery. */
export async function getMemoryImages(memoryId: string): Promise<MemoryImage[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("memory_images")
    .select(MEMORY_IMAGE_COLUMNS)
    .eq("memory_id", memoryId)
    .order("position", { ascending: true });

  if (error) throw new Error("Foto kenangan belum bisa dimuat.");
  return (data ?? []) as MemoryImage[];
}

/** Fetch a single extra photo row by its own id (image proxy authorisation). */
export async function getMemoryImage(id: string): Promise<MemoryImage | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("memory_images")
    .select(MEMORY_IMAGE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Foto belum bisa dimuat.");
  return (data as MemoryImage | null) ?? null;
}

/** Distinct years that contain memories, newest first (filter chips). */
export async function getMemoryYears(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("memories")
    .select("memory_date")
    .order("memory_date", { ascending: false })
    .limit(500);

  if (error) throw new Error("Kenangan belum bisa dimuat.");

  const years = new Set<string>();
  for (const row of data ?? []) {
    const value = (row as { memory_date: string }).memory_date;
    if (value) years.add(value.slice(0, 4));
  }
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}
