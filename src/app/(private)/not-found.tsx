import Link from "next/link";
import { BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Friendly 404 inside the private scrapbook. */
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <div className="polaroid flex flex-col items-center px-6 py-10 text-center">
        <span className="sticker mb-4 h-14 w-14 bg-butter text-xl">
          <BookHeart className="h-6 w-6 text-ink" aria-hidden />
        </span>

        <h1 className="font-heading text-xl font-semibold text-ink">
          Halaman ini tidak ada di buku kenangan
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Kenangan yang kamu cari mungkin sudah dihapus.
        </p>

        <Button asChild className="mt-5">
          <Link href="/memories">Kembali ke linimasa</Link>
        </Button>
      </div>
    </div>
  );
}
