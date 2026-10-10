import "server-only";

import { SignJWT, jwtVerify } from "jose";

/**
 * Short lived upload tickets.
 *
 * /api/uploads/sign creates a ticket that proves a storage path was
 * authorised by the server for the current session. createMemory and
 * updateMemory must verify it, so users can never submit an arbitrary
 * image_path (PRD section 14).
 */

const TICKET_AUDIENCE = "memory-upload";
const TICKET_TTL_SECONDS = 15 * 60; // 15 minutes

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short.");
  }
  return new TextEncoder().encode(secret);
}

export async function createUploadTicket(path: string): Promise<string> {
  return new SignJWT({ path })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("little-moments")
    .setAudience(TICKET_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TICKET_TTL_SECONDS}s`)
    .sign(getSecret());
}

/** Verify that `path` was authorised by the server. Constant-time compare. */
export async function verifyUploadTicket(
  ticket: string | undefined,
  path: string,
): Promise<boolean> {
  if (!ticket || !path) return false;
  try {
    const { payload } = await jwtVerify(ticket, getSecret(), {
      issuer: "little-moments",
      audience: TICKET_AUDIENCE,
    });
    const ticketPath = typeof payload.path === "string" ? payload.path : "";
    if (ticketPath.length !== path.length) return false;
    return timingSafeEqualStrings(ticketPath, path);
  } catch {
    return false;
  }
}

/** Constant-time string comparison without leaking content. */
function timingSafeEqualStrings(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i += 1) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}
