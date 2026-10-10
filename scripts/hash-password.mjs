#!/usr/bin/env node
/**
 * Generate SCRAPBOOK_PASSWORD_HASH value for .env.local.
 *
 * Usage:
 *   node scripts/hash-password.mjs "my shared password"
 *
 * Format produced: scrypt:<salt hex>:<hash hex>
 * (':' instead of '$' so dotenv-expand in .env files does not eat the salt.)
 * Verification happens only on the server (src/lib/auth/password.ts).
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const password = process.argv[2];

if (!password || password.trim().length < 8) {
  console.error(
    'Usage: node scripts/hash-password.mjs "<password>" (minimum 8 characters)',
  );
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString(
  "hex",
);
const value = `scrypt:${salt}:${hash}`;

// Sanity check: verify the generated hash round trips.
const [, expectedSalt, expectedHash] = value.split(":");
const check = scryptSync(password, expectedSalt, 64, {
  N: 16384,
  r: 8,
  p: 1,
}).toString("hex");
const ok = timingSafeEqual(
  Buffer.from(check, "hex"),
  Buffer.from(expectedHash, "hex"),
);
if (!ok) {
  console.error("Generated hash failed verification.");
  process.exit(1);
}

console.log("Add this to .env.local:");
console.log("");
console.log(`SCRAPBOOK_PASSWORD_HASH=${value}`);
