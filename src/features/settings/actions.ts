"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { isSameOriginServerAction } from "@/lib/security/origin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { settingsSchema } from "@/features/settings/schemas";
import type { ActionResult } from "@/features/memories/types";

/**
 * Scrapbook Settings Server Action (PRD FR-08).
 *
 * Follows the same guard order as the memory actions:
 * 1. Origin check (CSRF)
 * 2. Session validation
 * 3. Zod input validation
 * 4. The update itself
 */

const GENERIC_ERROR = "Permintaan tidak dapat diproses. Coba lagi ya.";
const SESSION_ERROR = "Sesi kamu sudah berakhir. Silakan masuk lagi.";
const SAVE_ERROR = "Pengaturan belum bisa disimpan. Coba lagi ya.";

/** Update the single settings row. */
export async function updateScrapbookSettings(
  input: unknown,
): Promise<ActionResult> {
  if (!(await isSameOriginServerAction())) {
    return { ok: false, error: GENERIC_ERROR };
  }

  if (!(await getSession())) {
    return { ok: false, error: SESSION_ERROR };
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Periksa kembali isian lalu coba lagi.",
    };
  }

  const { coupleName, relationshipStartDate, introMessage } = parsed.data;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("scrapbook_settings")
    .update({
      couple_name: coupleName,
      relationship_start_date: relationshipStartDate || null,
      intro_message: introMessage,
    })
    .eq("id", 1);

  if (error) return { ok: false, error: SAVE_ERROR };

  // The header lives in the private layout, so refresh the whole group.
  revalidatePath("/", "layout");

  return { ok: true, message: "Pengaturan tersimpan." };
}
