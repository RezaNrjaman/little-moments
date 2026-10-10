import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Heart } from "lucide-react";

type RelationshipCounterProps = {
  startDate: string | null;
};

/**
 * RelationshipCounter (DESIGN.md section 5.2).
 *
 *     Bersama selama
 *     365 Hari ♡
 *     Sejak 10 Oktober 2025
 *
 * Renders nothing when the relationship start date is not configured.
 */
export function RelationshipCounter({ startDate }: RelationshipCounterProps) {
  if (!startDate) return null;

  const parsed = parseISO(startDate);
  if (!isValid(parsed)) return null;

  const today = new Date();
  const days = Math.max(0, differenceInCalendarDays(today, parsed));
  if (days < 0) return null;

  return (
    <section
      aria-label="Penghitung hubungan"
      className="mx-auto mt-5 w-full max-w-sm px-4 text-center sm:px-6"
    >
      <div className="rounded-[var(--radius-md)] border border-ink/10 bg-lavender/40 px-5 py-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
          Bersama selama
        </p>
        <p className="mt-1 font-heading text-3xl font-semibold text-ink">
          {days} Hari{" "}
          <Heart
            className="inline h-5 w-5 -translate-y-0.5 fill-[#f27d8d] text-[#f27d8d]"
            aria-hidden
          />
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Sejak {format(parsed, "d MMMM yyyy", { locale: localeId })}
        </p>
      </div>
    </section>
  );
}
