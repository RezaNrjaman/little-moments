import "server-only";

import { headers } from "next/headers";

/**
 * Cross-site request protection (SECURITY.md section 10).
 *
 * State changing endpoints and Server Actions verify that the browser
 * Origin matches the host that is serving the app. Combined with
 * SameSite=Lax cookies this blocks CSRF style requests.
 *
 * Requests without an Origin header (non-browser clients) are allowed to
 * proceed: they still need a valid session cookie/token to succeed.
 */

function hostsMatch(origin: string, host: string): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Check the Origin header of a Route Handler request. */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  return hostsMatch(origin, host);
}

/** Check the Origin header of an incoming Server Action. */
export async function isSameOriginServerAction(): Promise<boolean> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (!origin) return true;

  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return false;

  return hostsMatch(origin, host);
}
