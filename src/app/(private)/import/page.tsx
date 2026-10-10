import Link from "next/link";
import { ArrowLeft, FolderPlus } from "lucide-react";
import { requirePageSession } from "@/lib/auth/session";
import { PhotoFolderImport } from "@/components/forms/PhotoFolderImport";

/** `/import` - bulk import memories from a folder (PRD FR-03, DESIGN.md 20). */
export default async function ImportPage() {
  await requirePageSession();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
      <Link
        href="/memories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke linimasa
      </Link>

      <div className="polaroid relative px-5 py-6 sm:px-8 sm:py-8">
        <span className="tape" aria-hidden />

        <div className="mb-6 text-center">
          <span className="sticker mx-auto mb-3 h-12 w-12 bg-mint text-lg">
            <FolderPlus className="h-5 w-5 text-ink" aria-hidden />
          </span>
          <h1 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
            Impor foto dari folder
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Pilih satu folder besar — tiap sub-folder jadi satu kenangan.
            Setelah masuk, tinggal kamu rapikan judul dan ceritanya.
          </p>
        </div>

        <PhotoFolderImport />
      </div>
    </div>
  );
}
