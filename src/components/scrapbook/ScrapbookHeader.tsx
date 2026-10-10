import Link from "next/link";
import { Heart, Settings2 } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

type ScrapbookHeaderProps = {
  coupleName: string;
  introMessage: string;
};

/**
 * ScrapbookHeader (DESIGN.md section 5).
 * Scrapbook cover: rounded, soft shadow, centred, with sticker decoration.
 */
export function ScrapbookHeader({
  coupleName,
  introMessage,
}: ScrapbookHeaderProps) {
  return (
    <header className="relative mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <div className="mb-3 flex flex-wrap justify-end gap-2">
        <Link
          href="/settings"
          aria-label="Buka pengaturan buku"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/15 bg-white/70 px-4 text-sm font-semibold text-ink transition-colors hover:bg-white"
        >
          <Settings2 className="h-3.5 w-3.5" aria-hidden />
          Pengaturan
        </Link>
        <LogoutButton />
      </div>

      <div className="polaroid relative px-6 pb-7 pt-8 text-center">
        <span className="tape" aria-hidden />

        <span
          aria-hidden
          className="sticker absolute left-3 top-4 h-9 w-9 bg-butter text-sm"
        >
          ✿
        </span>
        <span
          aria-hidden
          className="sticker absolute right-4 top-6 h-9 w-9 bg-mint text-sm"
        >
          ♡
        </span>

        <h1 className="text-balance break-words font-heading text-3xl font-semibold text-ink sm:text-4xl">
          <Heart
            className="mr-1 inline h-6 w-6 -translate-y-0.5 fill-[#f27d8d] text-[#f27d8d]"
            aria-hidden
          />
          {coupleName}
        </h1>
        <p className="mt-2 break-words text-sm italic text-ink-soft sm:text-base">
          {introMessage}
        </p>
      </div>
    </header>
  );
}
