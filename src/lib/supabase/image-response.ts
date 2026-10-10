import "server-only";

import { NextResponse } from "next/server";
import { getSupabaseAdmin, MEMORIES_BUCKET } from "@/lib/supabase/admin";

/**
 * Proxy a private Storage object through the server as an inline image.
 *
 * The Supabase signed URL is fetched server side and never reaches the
 * browser; responses are marked private so shared caches never store a
 * couple's photo. Callers MUST have validated the session first.
 */

const SIGNED_URL_TTL_SECONDS = 60;
const RESPONSE_CACHE_SECONDS = 300;

export async function imageResponseForPath(path: string): Promise<Response> {
  const failed = (status: number) =>
    NextResponse.json(
      { error: "Foto belum bisa dimuat." },
      { status, headers: { "Cache-Control": "no-store" } },
    );

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(MEMORIES_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) return failed(500);

    const upstream = await fetch(data.signedUrl, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) return failed(502);

    const contentType =
      upstream.headers.get("content-type")?.split(";")[0] ?? "image/webp";

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": `private, max-age=${RESPONSE_CACHE_SECONDS}`,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    });

    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return failed(500);
  }
}
