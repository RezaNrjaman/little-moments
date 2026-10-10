import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getMemoryImage } from "@/features/memories/queries";
import { imageResponseForPath } from "@/lib/supabase/image-response";

/**
 * GET /api/memory-images/[id]
 *
 * Secure access to one of a memory's extra photos. Same rules as
 * /api/images/[id]: session required, path resolved server side, signed
 * URL proxied and never exposed.
 */

const uuid = z.string().uuid();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Tidak diizinkan." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { id } = await context.params;
  const parsedId = uuid.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Foto tidak ditemukan." }, { status: 404 });
  }

  let image;
  try {
    image = await getMemoryImage(parsedId.data);
  } catch {
    return NextResponse.json(
      { error: "Foto belum bisa dimuat." },
      { status: 500 },
    );
  }

  if (!image?.image_path) {
    return NextResponse.json({ error: "Foto tidak ditemukan." }, { status: 404 });
  }

  return imageResponseForPath(image.image_path);
}
