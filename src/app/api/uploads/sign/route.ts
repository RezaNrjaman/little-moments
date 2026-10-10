import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isSameOriginRequest } from "@/lib/security/origin";
import { createUploadTicket } from "@/lib/security/upload-ticket";
import { getSupabaseAdmin, MEMORIES_BUCKET } from "@/lib/supabase/admin";
import { uploadSignSchema } from "@/features/memories/schemas";
import { ALLOWED_IMAGE_TYPES } from "@/config/site";

/**
 * POST /api/uploads/sign
 *
 * Creates a short lived, server authorised upload permission:
 * - session required
 * - content type + size validated (the real content is verified again
 *   server side when the memory is saved)
 * - filename is generated server side as <uuid>.<ext> (SECURITY.md 7)
 * - an upload ticket binds the returned path to this session
 */

const EXPIRES_IN_SECONDS = 15 * 60;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak dapat diproses." },
      { status: 403 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Sesi kamu sudah berakhir. Silakan masuk lagi." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak dapat diproses." },
      { status: 400 },
    );
  }

  const parsed = uploadSignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Permintaan unggah tidak valid.",
      },
      { status: 400 },
    );
  }

  const contentType = parsed.data.contentType as keyof typeof ALLOWED_IMAGE_TYPES;
  const extension = ALLOWED_IMAGE_TYPES[contentType];
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: "Hanya foto JPEG, PNG, atau WebP yang didukung." },
      { status: 400 },
    );
  }

  // Server generated filename: uuid.extension (never the original name).
  const path = `${randomUUID()}.${extension}`;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(MEMORIES_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { ok: false, error: "Unggahan foto belum bisa disiapkan." },
        { status: 500 },
      );
    }

    const ticket = await createUploadTicket(path);

    return NextResponse.json({
      ok: true,
      path,
      signedUrl: data.signedUrl,
      ticket,
      expiresIn: EXPIRES_IN_SECONDS,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unggahan foto belum bisa disiapkan." },
      { status: 500 },
    );
  }
}
