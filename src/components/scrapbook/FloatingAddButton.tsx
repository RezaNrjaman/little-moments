import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Floating Action Button (DESIGN.md section 4, USER-FLOW section 17).
 * Always reachable with one thumb on mobile.
 */
export function FloatingAddButton() {
  return (
    <Link
      href="/memories/new"
      aria-label="Tambah kenangan baru"
      className="safe-fab fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-pink text-ink shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-strong active:translate-y-0"
    >
      <Plus className="h-7 w-7" aria-hidden />
    </Link>
  );
}
