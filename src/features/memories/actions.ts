"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { isSameOriginServerAction } from "@/lib/security/origin";
import { validateImageFile } from "@/lib/security/image-validation";
import { verifyUploadTicket } from "@/lib/security/upload-ticket";
import { getSupabaseAdmin, MEMORIES_BUCKET } from "@/lib/supabase/admin";
import { MAX_MEMORY_PHOTOS } from "@/config/site";
import {
  createMemorySchema,
  deleteMemorySchema,
  updateMemorySchema,
} from "@/features/memories/schemas";
import type { ActionResult } from "@/features/memories/types";

/**
 * Memory Server Actions (ARCHITECTURE.md section 15).
 *
 * Every action performs, in order:
 * 1. Origin check (CSRF)
 * 2. Session validation
 * 3. Zod input validation
 * 4. File/path authorisation
 * 5. The operation itself
 * 6. Error handling + cache revalidation
 */

const GENERIC_ERROR = "Permintaan tidak dapat diproses. Coba lagi ya.";
const SESSION_ERROR = "Sesi kamu sudah berakhir. Silakan masuk lagi.";
const SAVE_ERROR = "Kenangan belum bisa disimpan. Coba lagi ya.";
const DELETE_ERROR = "Kenangan belum bisa dihapus. Coba lagi ya.";
const LIMIT_ERROR = `Maksimal ${MAX_MEMORY_PHOTOS} foto per kenangan.`;
const NOT_FOUND_ERROR = "Kenangan ini sudah tidak ada.";
const STALE_ERROR =
  "Kenangan ini berubah di tempat lain. Muat ulang halaman ya.";
const TICKET_ERROR = "Izin unggah kedaluwarsa. Unggah foto lagi ya.";

async function guard(): Promise<string | null> {
  if (!(await isSameOriginServerAction())) return GENERIC_ERROR;
  const session = await getSession();
  if (!session) return SESSION_ERROR;
  return null;
}

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Periksa kembali isian lalu coba lagi.";
}

/** Best effort removal of Storage files. Never throws. */
async function removeStoredImages(paths: string[]): Promise<boolean> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return true;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from(MEMORIES_BUCKET)
      .remove(unique);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Verify the upload ticket and the real file content of one uploaded photo.
 * Invalid files are removed immediately (no orphan files).
 */
async function authoriseUpload(
  path: string,
  ticket: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await verifyUploadTicket(ticket, path))) {
    return { ok: false, error: TICKET_ERROR };
  }

  const supabase = getSupabaseAdmin();
  const { data: blob, error } = await supabase.storage
    .from(MEMORIES_BUCKET)
    .download(path);

  if (error || !blob) {
    return {
      ok: false,
      error: "Unggahan foto tidak dapat dikonfirmasi. Unggah ulang ya.",
    };
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const result = validateImageFile({ size: blob.size, type: blob.type, bytes });

  if (!result.valid) {
    await removeStoredImages([path]);
    return { ok: false, error: result.reason };
  }

  return { ok: true };
}

/** Create a new memory (PRD FR-03). Photos[0] becomes the cover. */
export async function createMemory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const guardError = await guard();
  if (guardError) return { ok: false, error: guardError };

  const parsed = createMemorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { title, description, memoryDate, location, images } = parsed.data;
  const paths = images.map((image) => image.imagePath);

  for (const image of images) {
    const check = await authoriseUpload(image.imagePath, image.uploadTicket);
    if (!check.ok) {
      await removeStoredImages(paths);
      return { ok: false, error: check.error };
    }
  }

  const supabase = getSupabaseAdmin();
  const coverPath = images[0].imagePath;

  const { data, error } = await supabase
    .from("memories")
    .insert({
      title,
      description,
      memory_date: memoryDate,
      location: location || null,
      image_path: coverPath,
    })
    .select("id")
    .single();

  if (error || !data) {
    await removeStoredImages(paths);
    return { ok: false, error: SAVE_ERROR };
  }

  if (images.length > 1) {
    const rows = images.slice(1).map((image, index) => ({
      memory_id: data.id,
      image_path: image.imagePath,
      position: index,
    }));

    const { error: imagesError } = await supabase
      .from("memory_images")
      .insert(rows);

    if (imagesError) {
      // Roll back so no half saved memory is left behind.
      await supabase.from("memories").delete().eq("id", data.id);
      await removeStoredImages(paths);
      return { ok: false, error: SAVE_ERROR };
    }
  }

  revalidatePath("/memories");
  revalidatePath(`/memories/${data.id}`);

  return { ok: true, data: { id: data.id } };
}

/** Update a memory, its cover, extra photos and deletions (PRD FR-05). */
export async function updateMemory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const guardError = await guard();
  if (guardError) return { ok: false, error: guardError };

  const parsed = updateMemorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const {
    id,
    title,
    description,
    memoryDate,
    location,
    currentImagePath,
    imagePath,
    uploadTicket,
    addedImages,
    removedImageIds,
  } = parsed.data;

  const supabase = getSupabaseAdmin();

  const existing = await supabase
    .from("memories")
    .select("id, image_path")
    .eq("id", id)
    .maybeSingle();

  if (!existing.data) return { ok: false, error: NOT_FOUND_ERROR };

  const previousCover = existing.data.image_path as string;
  if (currentImagePath !== previousCover) {
    return { ok: false, error: STALE_ERROR };
  }

  const { data: extraData, error: extraError } = await supabase
    .from("memory_images")
    .select("id, image_path")
    .eq("memory_id", id)
    .order("position", { ascending: true });

  if (extraError) return { ok: false, error: SAVE_ERROR };

  const existingExtras = (extraData ?? []) as {
    id: string;
    image_path: string;
  }[];
  const existingIds = new Set(existingExtras.map((row) => row.id));

  const validRemovedIds = removedImageIds.filter((rid) => existingIds.has(rid));
  const removedSet = new Set(validRemovedIds);
  const removedExtras = existingExtras.filter((row) => removedSet.has(row.id));
  const keptExtras = existingExtras.filter((row) => !removedSet.has(row.id));

  // Enforce the per-memory limit after the edit (cover + kept + added).
  if (1 + keptExtras.length + addedImages.length > MAX_MEMORY_PHOTOS) {
    return { ok: false, error: LIMIT_ERROR };
  }

  const newPaths: string[] = [];

  let replacingCover = false;
  let nextCover = previousCover;
  if (imagePath && imagePath !== previousCover) {
    const check = await authoriseUpload(imagePath, uploadTicket ?? "");
    if (!check.ok) {
      await removeStoredImages(newPaths);
      return { ok: false, error: check.error };
    }
    replacingCover = true;
    nextCover = imagePath;
    newPaths.push(imagePath);
  }

  for (const image of addedImages) {
    const check = await authoriseUpload(image.imagePath, image.uploadTicket);
    if (!check.ok) {
      await removeStoredImages([
        ...newPaths,
        ...addedImages.map((item) => item.imagePath),
      ]);
      return { ok: false, error: check.error };
    }
    newPaths.push(image.imagePath);
  }

  // 1. Insert the new extra photos first (memory_id already exists).
  let insertedIds: string[] = [];
  if (addedImages.length > 0) {
    const rows = addedImages.map((image, index) => ({
      memory_id: id,
      image_path: image.imagePath,
      position: keptExtras.length + index,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("memory_images")
      .insert(rows)
      .select("id");

    if (insertError || !inserted) {
      await removeStoredImages(newPaths);
      return { ok: false, error: SAVE_ERROR };
    }
    insertedIds = inserted.map((row) => row.id as string);
  }

  // 2. Update the memory row itself.
  const { error: updateError } = await supabase
    .from("memories")
    .update({
      title,
      description,
      memory_date: memoryDate,
      location: location || null,
      image_path: nextCover,
    })
    .eq("id", id);

  if (updateError) {
    if (insertedIds.length > 0) {
      await supabase.from("memory_images").delete().in("id", insertedIds);
    }
    await removeStoredImages(newPaths);
    return { ok: false, error: SAVE_ERROR };
  }

  // 3. Delete the extra rows the user removed.
  let message: string | undefined;
  let removedRowsDeleted = validRemovedIds.length === 0;
  if (validRemovedIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("memory_images")
      .delete()
      .in("id", validRemovedIds);

    removedRowsDeleted = !deleteError;
    if (deleteError) {
      message = "Kenangan tersimpan, tapi sebagian foto gagal dihapus.";
    }
  }

  // 3b. Renumber the remaining extras (kept first, then the just inserted)
  //     so `position` stays contiguous and unique (0..n-1). Without this a
  //     removal could leave the survivors sharing a position and the gallery
  //     order would become unstable.
  if (keptExtras.length > 0) {
    const reordered = await Promise.all(
      keptExtras.map((row, index) =>
        supabase
          .from("memory_images")
          .update({ position: index })
          .eq("id", row.id),
      ),
    );

    if (reordered.some((result) => result.error) && !message) {
      message = "Kenangan tersimpan, tapi urutan foto belum sepenuhnya rapi.";
    }
  }

  // 4. Remove storage files that are no longer referenced.
  const oldFiles = [
    ...(removedRowsDeleted ? removedExtras.map((row) => row.image_path) : []),
    ...(replacingCover ? [previousCover] : []),
  ];

  if (oldFiles.length > 0) {
    const removed = await removeStoredImages(oldFiles);
    if (!removed && !message) {
      message = "Kenangan tersimpan, tapi file foto lama gagal dihapus.";
    }
  }

  revalidatePath("/memories");
  revalidatePath(`/memories/${id}`);

  return { ok: true, data: { id }, message };
}

/** Delete a memory and every photo it owns (PRD FR-06). */
export async function deleteMemory(input: unknown): Promise<ActionResult> {
  const guardError = await guard();
  if (guardError) return { ok: false, error: guardError };

  const parsed = deleteMemorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { id } = parsed.data;
  const supabase = getSupabaseAdmin();

  const existing = await supabase
    .from("memories")
    .select("id, image_path")
    .eq("id", id)
    .maybeSingle();

  if (!existing.data) return { ok: false, error: NOT_FOUND_ERROR };

  const coverPath = existing.data.image_path as string;

  const { data: extras } = await supabase
    .from("memory_images")
    .select("image_path")
    .eq("memory_id", id);

  const extraPaths = (extras ?? []).map(
    (row) => (row as { image_path: string }).image_path,
  );

  // 1. Delete the database record first (cascades to memory_images).
  const { error } = await supabase.from("memories").delete().eq("id", id);
  if (error) return { ok: false, error: DELETE_ERROR };

  // 2. Then every storage file (never trust a client supplied path).
  const removed = await removeStoredImages([coverPath, ...extraPaths]);

  revalidatePath("/memories");
  revalidatePath(`/memories/${id}`);

  if (!removed) {
    return {
      ok: true,
      message:
        "Kenangan dihapus. File fotonya gagal dihapus dari penyimpanan.",
    };
  }

  return { ok: true };
}
