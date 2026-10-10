import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import type { ScrapbookSettings } from "@/features/settings/types";

/**
 * Data access layer for the single scrapbook configuration row
 * (DATABASE.md section 4.2). Callers MUST have validated the session.
 */
export async function getScrapbookSettings(): Promise<ScrapbookSettings> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("scrapbook_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw new Error("Buku kenangan belum bisa dimuat.");

  if (!data) {
    return {
      id: 1,
      couple_name: siteConfig.defaultCoupleName,
      relationship_start_date: null,
      intro_message: siteConfig.defaultIntroMessage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data as ScrapbookSettings;
}
