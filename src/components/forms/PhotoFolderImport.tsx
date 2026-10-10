"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FolderOpen,
  ImageUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MAX_MEMORY_PHOTOS } from "@/config/site";
import { createMemory } from "@/features/memories/actions";
import { compressImageToJpeg } from "@/lib/images/compress-image";
import {
  buildImportGroups,
  chunkPhotos,
  type ImportGroup,
} from "@/features/memories/import";
import type { MemoryImageUpload } from "@/features/memories/types";

type GroupView = ImportGroup & { previewUrl: string };
type FailedGroup = { folderName: string; error: string };
type Status = "idle" | "importing" | "done";

/**
 * PhotoFolderImport (DESIGN.md section 20).
 *
 * Pick (or drop) one parent folder. Every sub-folder becomes one memory, dated
 * by the sub-folder name; the first photo is the cover and the rest go to the
 * gallery. Photos are compressed in the browser, uploaded through the same
 * session guarded /api/uploads/sign flow and saved with the existing
 * createMemory Server Action (server validates the ticket and the real bytes).
 */
export function PhotoFolderImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  const [groups, setGroups] = useState<GroupView[]>([]);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0, label: "" });
  const [importedCount, setImportedCount] = useState(0);
  const [failed, setFailed] = useState<FailedGroup[]>([]);

  const revokeUrls = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  }, []);

  // The folder picker attribute is not exposed by React's typing.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
  }, []);

  useEffect(() => () => revokeUrls(), [revokeUrls]);

  const acceptFiles = useCallback(
    (files: File[]) => {
      const built = buildImportGroups(files);
      revokeUrls();

      const views = built.map((group) => {
        const first = group.photos[0];
        const previewUrl = first ? URL.createObjectURL(first.file) : "";
        if (previewUrl) urlsRef.current.push(previewUrl);
        return { ...group, previewUrl };
      });

      setGroups(views);
      setFailed([]);
      setImportedCount(0);
      setStatus("idle");

      if (views.length === 0) {
        toast.error("Tidak ada foto JPEG yang ditemukan di folder itu.");
      } else {
        toast.success(`${views.length} folder siap diimpor.`);
      }
    },
    [revokeUrls],
  );

  function reset() {
    revokeUrls();
    setGroups([]);
    setFailed([]);
    setImportedCount(0);
    setStatus("idle");
    setProgress({ done: 0, total: 0, label: "" });
  }

  function updateDate(id: string, date: string) {
    setGroups((previous) =>
      previous.map((group) => (group.id === id ? { ...group, date } : group)),
    );
  }

  function removeGroup(id: string) {
    setGroups((previous) => previous.filter((group) => group.id !== id));
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) acceptFiles(files);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void (async () => {
      const files = await filesFromDataTransfer(event.dataTransfer);
      if (files.length > 0) {
        acceptFiles(files);
      } else {
        toast.error("Tidak ada foto yang ditemukan di item itu.");
      }
    })();
  }

  const totalPhotos = groups.reduce((sum, g) => sum + g.photos.length, 0);
  const totalMemories = groups.reduce(
    (sum, g) => sum + Math.ceil(g.photos.length / MAX_MEMORY_PHOTOS),
    0,
  );
  const missingDate = groups.filter((group) => !group.date).length;

  async function handleImport() {
    const ready = groups.filter((group) => group.photos.length > 0 && group.date);
    if (ready.length === 0) {
      toast.error("Belum ada folder dengan tanggal yang valid.");
      return;
    }

    const plan = ready.flatMap((group) => {
      const chunks = chunkPhotos(group.photos, MAX_MEMORY_PHOTOS);
      return chunks.map((photos, index) => ({
        group,
        photos,
        index,
        total: chunks.length,
      }));
    });

    setStatus("importing");
    setFailed([]);
    setImportedCount(0);
    setProgress({ done: 0, total: plan.length, label: plan[0].group.folderName });

    let ok = 0;
    const failures: FailedGroup[] = [];

    for (let index = 0; index < plan.length; index += 1) {
      const { group, photos, index: part, total } = plan[index];
      setProgress({
        done: index,
        total: plan.length,
        label: group.folderName,
      });

      try {
        const uploads: MemoryImageUpload[] = [];
        for (const photo of photos) {
          const prepared = await compressImageToJpeg(photo.file);
          uploads.push(await requestUpload(prepared));
        }

        const dateLabel = formatTitle(group.date);
        const title =
          total > 1 ? `${dateLabel} (${part + 1}/${total})` : dateLabel;

        const result = await createMemory({
          title,
          description: "",
          memoryDate: group.date,
          location: "",
          images: uploads,
        });

        if (!result.ok) throw new Error(result.error);
        ok += 1;
      } catch (error) {
        failures.push({
          folderName:
            total > 1 ? `${group.folderName} (${part + 1}/${total})` : group.folderName,
          error: error instanceof Error ? error.message : "Gagal mengimpor.",
        });
      }

      setProgress({
        done: index + 1,
        total: plan.length,
        label: group.folderName,
      });
    }

    setImportedCount(ok);
    setFailed(failures);
    setStatus("done");
    router.refresh();

    if (failures.length === 0) {
      toast.success(`♡ ${ok} kenangan berhasil diimpor!`);
    } else {
      toast.warning(`${ok} berhasil, ${failures.length} gagal.`);
    }
  }

  const percent =
    progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0;

  return (
    <div className="space-y-5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-[var(--radius-md)] border-2 border-dashed px-5 py-8 text-center transition-colors",
          dragging ? "border-pink bg-pink/10" : "border-ink/20 bg-white/50",
        )}
      >
        <span className="sticker mx-auto mb-3 h-12 w-12 bg-butter text-lg">
          <ImageUp className="h-5 w-5 text-ink" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-ink">Tarik folder ke sini</p>
        <p className="mt-1 text-xs text-ink-soft">atau</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
          disabled={status === "importing"}
        >
          <FolderOpen className="h-4 w-4" aria-hidden />
          Pilih folder
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={onInputChange}
          aria-label="Pilih folder foto"
        />
        <p className="mx-auto mt-3 max-w-md text-xs text-ink-soft">
          Tiap sub-folder jadi 1 kenangan. Tanggal diambil dari nama sub-folder
          (mis. <span className="font-semibold">2024-03-02</span>). Bisa kamu
          perbaiki sebelum mengimpor.
        </p>
      </div>

      {groups.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-cream/70 px-4 py-3 text-sm">
            <span className="font-semibold text-ink">
              {groups.length} folder · {totalPhotos} foto · {totalMemories}{" "}
              kenangan
            </span>
            <button
              type="button"
              onClick={reset}
              disabled={status === "importing"}
              className="text-xs font-semibold text-ink-soft transition-colors hover:text-ink disabled:opacity-50"
            >
              Bersihkan
            </button>
          </div>

          {missingDate > 0 ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[#fff3d6] px-4 py-3 text-xs font-medium text-[#8a5a00]"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {missingDate} folder tanggalnya belum terbaca. Isi manual dulu ya
              sebelum mengimpor.
            </p>
          ) : null}

          <ul className="space-y-3">
            {groups.map((group) => {
              const parts = Math.ceil(group.photos.length / MAX_MEMORY_PHOTOS);
              return (
                <li
                  key={group.id}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-ink/10 bg-white/70 p-3"
                >
                  {group.previewUrl ? (
                    // Local preview only; the real photo is proxied server side.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={group.previewUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-[8px] object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] bg-cream text-ink-soft">
                      <ImageUp className="h-5 w-5" aria-hidden />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-semibold text-ink"
                      title={group.folderName}
                    >
                      {group.folderName}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {group.photos.length} foto
                      {parts > 1 ? ` · jadi ${parts} kenangan` : ""}
                    </p>
                    <label className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      <span className="sr-only">
                        Tanggal untuk {group.folderName}
                      </span>
                      <Input
                        type="date"
                        value={group.date}
                        onChange={(event) =>
                          updateDate(group.id, event.target.value)
                        }
                        disabled={status === "importing"}
                        className="h-8 w-auto py-0 text-xs"
                      />
                      {!group.date ? (
                        <span className="font-semibold text-[#a13d4a]">
                          belum diisi
                        </span>
                      ) : null}
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    disabled={status === "importing"}
                    aria-label={`Hapus ${group.folderName}`}
                    className="shrink-0 rounded-full p-2 text-ink-soft transition-colors hover:bg-cream hover:text-ink disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>

          <div aria-live="polite" className="space-y-2">
            {status === "importing" ? (
              <div className="rounded-[var(--radius-sm)] bg-cream/70 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Mengimpor {progress.done}/{progress.total} · {progress.label}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-pink transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ) : null}

            {status === "done" ? (
              <div className="space-y-2 rounded-[var(--radius-sm)] bg-white/70 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-4 w-4 text-[#3f8f5f]"
                    aria-hidden
                  />
                  {importedCount} kenangan berhasil diimpor.
                </p>
                {failed.length > 0 ? (
                  <ul className="space-y-1 text-xs text-[#a13d4a]">
                    {failed.map((item) => (
                      <li key={item.folderName}>
                        • {item.folderName}: {item.error}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={reset}
              disabled={status === "importing"}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={status === "importing" || totalPhotos === 0}
            >
              {status === "importing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Mengimpor...
                </>
              ) : (
                <>
                  <ImageUp className="h-4 w-4" aria-hidden />
                  Impor {totalMemories} kenangan
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function requestUpload(target: File): Promise<MemoryImageUpload> {
  const signResponse = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: target.type, size: target.size }),
  });

  const signed = (await signResponse.json().catch(() => null)) as {
    ok?: boolean;
    path?: string;
    signedUrl?: string;
    ticket?: string;
    error?: string;
  } | null;

  if (
    !signResponse.ok ||
    !signed?.ok ||
    !signed.path ||
    !signed.signedUrl ||
    !signed.ticket
  ) {
    throw new Error(signed?.error ?? "Unggahan foto belum bisa disiapkan.");
  }

  const uploadResponse = await fetch(signed.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": target.type },
    body: target,
  });

  if (!uploadResponse.ok) {
    throw new Error("Foto belum bisa diunggah. Coba lagi ya.");
  }

  return { imagePath: signed.path, uploadTicket: signed.ticket };
}

function formatTitle(date: string): string {
  const parsed = parseISO(date);
  return isValid(parsed)
    ? format(parsed, "d MMMM yyyy", { locale: localeId })
    : date;
}

/** Recursively collect files from a drag & drop, preserving folder paths. */
async function filesFromDataTransfer(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const entries = Array.from(dataTransfer.items)
    .map((item) => {
      const withEntry = item as DataTransferItem & {
        webkitGetAsEntry?: () => FileSystemEntry | null;
      };
      return withEntry.webkitGetAsEntry?.() ?? null;
    })
    .filter((entry): entry is FileSystemEntry => Boolean(entry));

  if (entries.length === 0) {
    return Array.from(dataTransfer.files);
  }

  const files: File[] = [];

  async function walk(entry: FileSystemEntry, path: string): Promise<void> {
    if (entry.isFile) {
      const file = await new Promise<File | null>((resolve) => {
        (entry as FileSystemFileEntry).file(
          (value) => resolve(value),
          () => resolve(null),
        );
      });
      if (file) {
        Object.defineProperty(file, "webkitRelativePath", {
          value: `${path}${file.name}`,
          configurable: true,
        });
        files.push(file);
      }
      return;
    }

    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const children = await readAllEntries(reader);
      for (const child of children) {
        await walk(child, `${path}${entry.name}/`);
      }
    }
  }

  for (const entry of entries) {
    await walk(entry, "");
  }

  return files;
}

function readAllEntries(
  reader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> {
  return new Promise((resolve) => {
    const collected: FileSystemEntry[] = [];
    const readBatch = () => {
      reader.readEntries(
        (batch) => {
          if (batch.length === 0) {
            resolve(collected);
            return;
          }
          collected.push(...batch);
          readBatch();
        },
        () => resolve(collected),
      );
    };
    readBatch();
  });
}
