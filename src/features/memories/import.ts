import { isValid, parseISO } from "date-fns";

/**
 * Pure helpers for the photo folder importer (no DOM, no server imports).
 *
 * Folder layout expected: one parent folder that contains dated sub-folders,
 * each holding the JPEGs of a single moment.
 *
 *   Album/
 *     2024-03-02/  IMG_001.jpg, IMG_002.jpg
 *     2024-05-10/  IMG_010.jpg
 */

export type ImportPhoto = {
  /** Stable key inside a group (folder + file name). */
  id: string;
  file: File;
  name: string;
};

export type ImportGroup = {
  id: string;
  /** Name of the sub-folder (used as the default title source). */
  folderName: string;
  /** ISO yyyy-MM-dd, or "" when the folder name has no readable date. */
  date: string;
  photos: ImportPhoto[];
};

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|heic|heif)$/i;
const SEPARATORS = /[._\s]+/g;

/** Keep only real image files (JPEG / PNG / WebP / HEIC by type or name). */
export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXTENSION.test(file.name);
}

/**
 * Read a calendar date out of a folder name.
 *
 * Supported shapes (extra words around them are ignored):
 *   2024-03-02 / 2024.03.02 / 2024 03 02   (year first)
 *   02-03-2024 / 02.03.2024                (day first, Indonesian style)
 *   20240302                               (compact year first)
 */
export function parseDateFromFolderName(rawName: string): string | null {
  const normalized = rawName.trim().replace(SEPARATORS, "-");
  if (!normalized) return null;

  // YYYY-M-D  (2024-3-2)
  const yearFirst = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (yearFirst) {
    return buildIso(+yearFirst[1], +yearFirst[2], +yearFirst[3]);
  }

  // D-M-YYYY  (2-3-2024, day first)
  const dayFirst = normalized.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dayFirst) {
    const iso = buildIso(+dayFirst[3], +dayFirst[2], +dayFirst[1]);
    if (iso) return iso;
  }

  // YYYYMMDD  (20240302)
  const compact = normalized.match(/(\d{4})(\d{2})(\d{2})/);
  if (compact) {
    return buildIso(+compact[1], +compact[2], +compact[3]);
  }

  return null;
}

function buildIso(year: number, month: number, day: number): string | null {
  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const pad = (value: number) => String(value).padStart(2, "0");
  const iso = `${year}-${pad(month)}-${pad(day)}`;
  return isValid(parseISO(iso)) ? iso : null;
}

/** The deepest folder name in a relative path like "Album/2024-03-02/a.jpg". */
export function folderNameFromPath(relativePath: string): string {
  const parts = relativePath
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);
  parts.pop(); // drop the file name
  return parts.length > 0 ? parts[parts.length - 1] : "";
}

/**
 * Group files by their sub-folder, parse the date from the folder name and
 * sort photos naturally. Groups are ordered chronologically (undated last).
 */
export function buildImportGroups(files: File[]): ImportGroup[] {
  const byFolder = new Map<string, ImportPhoto[]>();

  for (const file of files) {
    if (!isImageFile(file)) continue;

    const relativePath =
      (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
      file.name;
    const folderName = folderNameFromPath(relativePath);

    const list = byFolder.get(folderName) ?? [];
    list.push({ id: `${folderName}/${file.name}`, file, name: file.name });
    byFolder.set(folderName, list);
  }

  return Array.from(byFolder.entries())
    .map(([folderName, photos]) => ({
      id: folderName || "(tanpa folder)",
      folderName: folderName || "(tanpa folder)",
      date: parseDateFromFolderName(folderName) ?? "",
      photos: photos.sort((a, b) =>
        a.name.localeCompare(b.name, "id", { numeric: true }),
      ),
    }))
    .sort((a, b) => (a.date || "9999-99-99").localeCompare(b.date || "9999-99-99"));
}

/** Split an array into chunks (used to respect the 10 photos per memory cap). */
export function chunkPhotos<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
