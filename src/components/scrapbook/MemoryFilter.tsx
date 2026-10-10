"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { MemoryFilter } from "@/features/memories/types";

type MemoryFilterProps = {
  filter: MemoryFilter;
  /** Distinct years that contain memories (newest first). */
  years: string[];
};

type Mode = MemoryFilter["view"];

/**
 * MemoryFilter (DESIGN.md section 10): horizontal sticker chips.
 * Active chip uses the Candy Pink background.
 *
 * The chosen filter lives in the URL (?view=...&date=...) so it survives a
 * refresh, and is applied inside the database query, never only in the
 * browser (PRD FR-07).
 */
export function MemoryFilter({ filter, years }: MemoryFilterProps) {
  const router = useRouter();

  const today = new Date();
  const currentYear = String(today.getFullYear());
  const currentMonth = format(today, "yyyy-MM");
  const currentDate = format(today, "yyyy-MM-dd");

  const availableYears = years.includes(currentYear)
    ? years
    : [...years, currentYear].sort((a, b) => b.localeCompare(a));

  const activeYear =
    filter.view === "year" ? filter.year : (availableYears[0] ?? currentYear);
  const activeMonth =
    filter.view === "month" ? filter.month : currentMonth;
  const activeDate = filter.view === "day" ? filter.date : currentDate;

  function push(params: Record<string, string | null>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    const query = search.toString();
    router.push(query ? `/memories?${query}` : "/memories", { scroll: false });
  }

  function selectMode(mode: Mode) {
    if (mode === "all") push({ view: null, date: null, month: null, year: null });
    if (mode === "day") push({ view: "day", date: activeDate });
    if (mode === "month") push({ view: "month", month: activeMonth });
    if (mode === "year") push({ view: "year", year: activeYear });
  }

  const chips: { mode: Mode; label: string }[] = [
    { mode: "all", label: "Semua" },
    { mode: "year", label: "Tahun" },
    { mode: "month", label: "Bulan" },
    { mode: "day", label: "Hari" },
  ];

  return (
    <section
      aria-label="Filter kenangan"
      className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6"
    >
      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-ink/10 bg-white/60 px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Mode filter">
          {chips.map((chip) => {
            const isActive = filter.view === chip.mode;
            return (
              <button
                key={chip.mode}
                type="button"
                onClick={() => selectMode(chip.mode)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-pink text-ink shadow-soft"
                    : "bg-cream text-ink-soft hover:bg-ink/5 hover:text-ink",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {filter.view !== "all" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor={`filter-${filter.view}`} className="text-xs text-ink-soft">
              {filter.view === "day"
                ? "Tanggal"
                : filter.view === "month"
                  ? "Bulan"
                  : "Tahun"}
            </Label>

            {filter.view === "day" ? (
              <input
                id="filter-day"
                type="date"
                value={activeDate}
                onChange={(event) =>
                  event.target.value
                    ? push({ view: "day", date: event.target.value })
                    : undefined
                }
                className="h-9 rounded-full border border-ink/10 bg-white px-4 text-sm text-ink focus-visible:border-lavender focus-visible:outline-none"
              />
            ) : null}

            {filter.view === "month" ? (
              <input
                id="filter-month"
                type="month"
                value={activeMonth}
                onChange={(event) =>
                  event.target.value
                    ? push({ view: "month", month: event.target.value })
                    : undefined
                }
                className="h-9 rounded-full border border-ink/10 bg-white px-4 text-sm text-ink focus-visible:border-lavender focus-visible:outline-none"
              />
            ) : null}

            {filter.view === "year" ? (
              <select
                id="filter-year"
                value={activeYear}
                onChange={(event) => push({ view: "year", year: event.target.value })}
                className="h-9 rounded-full border border-ink/10 bg-white px-4 text-sm text-ink focus-visible:border-lavender focus-visible:outline-none"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
