import Link from "next/link";
import { BookHeart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title?: string;
  description?: string;
  /** Hide the add button (e.g. when a filter returns nothing). */
  actionHref?: string;
  actionLabel?: string;
};

/**
 * EmptyState (DESIGN.md section 11).
 *
 *     Belum ada kenangan
 *     Mulai tambahkan momen kecil pertamamu ♡
 *     + Tambah Kenangan
 */
export function EmptyState({
  title = "Belum ada kenangan",
  description = "Mulai tambahkan momen kecil pertamamu ♡",
  actionHref = "/memories/new",
  actionLabel = "Tambah Kenangan",
}: EmptyStateProps) {
  return (
    <div className="polaroid mx-auto flex w-full max-w-md flex-col items-center px-6 py-10 text-center animate-fade-in">
      <span className="sticker mb-4 h-16 w-16 bg-butter text-2xl">
        <BookHeart className="h-7 w-7 text-ink" aria-hidden />
      </span>

      <h2 className="font-heading text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 text-sm text-ink-soft">{description}</p>

      {actionHref ? (
        <Button asChild className="mt-5">
          <Link href={actionHref}>
            <Plus className="h-4 w-4" aria-hidden />
            {actionLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
