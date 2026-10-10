import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the secret (service role) key.
 *
 * - Never import this file from a Client Component.
 * - The secret key must never be exposed through NEXT_PUBLIC_* variables.
 * - RLS stays enabled in the database; every caller of this client MUST
 *   validate the scrapbook session first (see ARCHITECTURE.md section 11).
 */
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client may only be used on the server.");
  }

  // Tolerate a trailing slash or a "/rest/v1" suffix copied from the dashboard;
  // supabase-js expects only the project origin.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  if (secretKey.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SECRET_KEY is a publishable key. Use the secret (service role) key, which is server-only.",
    );
  }

  if (!client) {
    client = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}

/** Private storage bucket name (private, signed URL access only). */
export const MEMORIES_BUCKET = "memories";
