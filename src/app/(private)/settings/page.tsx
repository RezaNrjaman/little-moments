import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { requirePageSession } from "@/lib/auth/session";
import { getScrapbookSettings } from "@/features/settings/queries";
import { SettingsForm } from "@/components/forms/SettingsForm";

/** `/settings` - edit the scrapbook configuration (PRD FR-08). */
export default async function SettingsPage() {
  await requirePageSession();

  const settings = await getScrapbookSettings();

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
          <span className="sticker mx-auto mb-3 h-12 w-12 bg-lavender text-lg">
            <Settings2 className="h-5 w-5 text-ink" aria-hidden />
          </span>
          <h1 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
            Pengaturan buku kita
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Atur nama, tanggal mulai hubungan, dan pesan pembuka.
          </p>
        </div>

        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
