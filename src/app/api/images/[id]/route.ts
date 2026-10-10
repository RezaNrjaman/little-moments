import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getMemory } from "@/features/memories/queries";
import { imageResponseForPath } from "@/lib/supabase/image-response";

/**
 * GET /api/images/[id]
 *
 * Secure access to a memory cover photo (PRD FR-04):
 * - validates the session on every request
 * - resolves the Storage path from the database by memory id, so the path
 *   can never be manipulated by the client
 * - the Supabase signed URL is proxied server side and never exposed
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

  let memory;
  try {
    memory = await getMemory(parsedId.data);
  } catch {
    return NextResponse.json(
      { error: "Foto belum bisa dimuat." },
      { status: 500 },
    );
  }

  if (!memory?.image_path) {
    return NextResponse.json({ error: "Foto tidak ditemukan." }, { status: 404 });
  }

  return imageResponseForPath(memory.image_path);
}
