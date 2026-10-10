import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requirePageSession } from "@/lib/auth/session";
import { getMemory, getMemoryImages } from "@/features/memories/queries";
import { MemoryForm } from "@/components/forms/MemoryForm";

const uuid = z.string().uuid();

type Props = { params: Promise<{ id: string }> };

/** `/memories/[id]/edit` - update a memory (FR-05). */
export default async function EditMemoryPage({ params }: Props) {
  await requirePageSession();

  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();

  const memory = await getMemory(id);
  if (!memory) notFound();

  const images = await getMemoryImages(memory.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
      <Link
        href={`/memories/${memory.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke kenangan ini
      </Link>

      <div className="polaroid relative px-5 py-6 sm:px-8 sm:py-8">
        <span className="tape" aria-hidden />

        <div className="mb-6 text-center">
          <span className="sticker mx-auto mb-3 h-12 w-12 bg-mint text-lg">
            <PencilLine className="h-5 w-5 text-ink" aria-hidden />
          </span>
          <h1 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
            Ubah momen ini
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Perbaiki detailnya, ganti atau tambah foto, atau tulis ulang ceritanya.
          </p>
        </div>

        <MemoryForm memory={memory} images={images} />
      </div>
    </div>
  );
}
