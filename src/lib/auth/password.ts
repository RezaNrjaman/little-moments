import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Shared password verification (FR-01).
 *
 * The password is stored ONLY as a hash in SCRAPBOOK_PASSWORD_HASH.
 * Supported format: scrypt:<salt hex>:<hash hex>
 * Generate with: node scripts/hash-password.mjs "your-password"
 *
 * Note: ':' is used instead of '$' because Next.js expands '$VAR' inside
 * .env files (dotenv-expand), which would corrupt a '$' separated hash.
 */

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: string): Buffer {
  return scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
}

/** Hash a plaintext password into the stored environment format. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = deriveKey(password, salt).toString("hex");
  return `scrypt:${salt}:${key}`;
}

/**
 * Constant-time verification of the shared password.
 * Never logs the password or the hash.
 */
export function verifyPassword(password: string): boolean {
  const stored = process.env.SCRAPBOOK_PASSWORD_HASH;

  if (!stored) {
    // Fail closed: no configured hash means nobody can sign in.
    return false;
  }

  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    // Unsupported/unknown format: fail closed without leaking details.
    return false;
  }
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  try {
    const actual = deriveKey(password, salt);
    const expected = Buffer.from(expectedHex, "hex");
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
