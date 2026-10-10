import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";
import { isSameOriginRequest } from "@/lib/security/origin";

/** POST /api/auth/logout - destroys the session cookie. */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak dapat diproses." },
      { status: 403 },
    );
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
