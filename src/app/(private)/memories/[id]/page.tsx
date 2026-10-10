import { notFound } from "next/navigation";
import { z } from "zod";
import { requirePageSession } from "@/lib/auth/session";
import { getMemory, getMemoryImages } from "@/features/memories/queries";
import { MemoryDetail } from "@/components/scrapbook/MemoryDetail";

const uuid = z.string().uuid();

type Props = { params: Promise<{ id: string }> };

/** `/memories/[id]` - memory detail (FR-04). */
export default async function MemoryDetailPage({ params }: Props) {
  await requirePageSession();

  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();

  const memory = await getMemory(id);
  if (!memory) notFound();

  const images = await getMemoryImages(memory.id);

  return <MemoryDetail memory={memory} images={images} />;
}
