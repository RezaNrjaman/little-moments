import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { isSameOriginRequest } from "@/lib/security/origin";
import { clientKey, rateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { loginSchema } from "@/features/memories/schemas";

/**
 * POST /api/auth/login
 * Verifies the shared password, then creates a signed HttpOnly session.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak dapat diproses." },
      { status: 403 },
    );
  }

  // Brute force protection: persistent when Upstash is configured.
  const limitKey = `login:${clientKey(request)}`;
  const limit = await rateLimit(limitKey, {
    limit: MAX_ATTEMPTS,
    windowSeconds: WINDOW_SECONDS,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Kata sandi belum diisi." },
      { status: 400 },
    );
  }

  // Hash comparison happens only on the server (never logs the password).
  if (!verifyPassword(parsed.data.password)) {
    return NextResponse.json(
      { ok: false, error: "Kata sandi tidak cocok. Coba lagi ya." },
      { status: 401 },
    );
  }

  try {
    const token = await createSessionToken();
    await setSessionCookie(token);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Buku kenangan belum bisa dibuka sekarang." },
      { status: 500 },
    );
  }

  // Successful sign in: only failed attempts should count towards the limit.
  await resetRateLimit(limitKey);

  return NextResponse.json({ ok: true });
}
