"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/config/site";
import type { SelectedPhoto } from "@/components/forms/photo-selection";
import type { MemoryImage } from "@/features/memories/types";

type MemoryImagesEditorProps = {
  /** Existing extra photos (the cover is handled separately). */
  images: MemoryImage[];
  /** Ids flagged for removal (toggled, applied on save). */
  removedIds: string[];
  onToggleRemove: (id: string) => void;
  /** Newly added photos (not uploaded yet). */
  newPhotos: SelectedPhoto[];
  onNewPhotosChange: (photos: SelectedPhoto[]) => void;
  /** Total photo limit per memory, cover included. */
  max: number;
  disabled?: boolean;
};

/**
 * MemoryImagesEditor (DESIGN.md section 9): manage the extra photos of an
 * existing memory - keep, mark for removal, or add new ones.
 */
export function MemoryImagesEditor({
  images,
  removedIds,
  onToggleRemove,
  newPhotos,
  onNewPhotosChange,
  max,
  disabled,
}: MemoryImagesEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const keptExisting = images.filter(
    (image) => !removedIds.includes(image.id),
  ).length;
  const used = 1 + keptExisting + newPhotos.length; // cover + kept + new
  const remaining = Math.max(0, max - used);

  function handleFiles(list: FileList | null) {
    setLocalError(null);
    const incoming = Array.from(list ?? []);
    if (incoming.length === 0) return;

    const valid: SelectedPhoto[] = [];
    let error: string | null = null;

    for (const file of incoming) {
      if (!(file.type in ALLOWED_IMAGE_TYPES)) {
        error = "Hanya foto JPEG, PNG, atau WebP yang didukung.";
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        error = "Ada foto yang terlalu besar. Gunakan gambar di bawah 5 MB.";
        continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file) });
    }

    const combined = [...newPhotos, ...valid];
    const next = combined.slice(0, remaining);
    combined.slice(remaining).forEach((photo) => URL.revokeObjectURL(photo.preview));
    if (combined.length > remaining) {
      error = `Maksimal ${max} foto per kenangan.`;
    }

    onNewPhotosChange(next);
    setLocalError(error);
  }

  function removeNewAt(index: number) {
    const target = newPhotos[index];
    if (target) URL.revokeObjectURL(target.preview);
    onNewPhotosChange(newPhotos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Foto lainnya</p>
        <span className="text-xs text-ink-soft">
          {used}/{max}
        </span>
      </div>

      {images.length > 0 || newPhotos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => {
            const removed = removedIds.includes(image.id);
            return (
              <li
                key={image.id}
                className={cn(
                  "polaroid relative p-2 transition-opacity",
                  removed && "opacity-40",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/memory-images/${image.id}`}
                  alt="Foto kenangan"
                  className="aspect-square w-full rounded-[8px] object-cover"
                />

                <button
                  type="button"
                  onClick={() => onToggleRemove(image.id)}
                  disabled={disabled}
                  aria-label={
                    removed ? "Batalkan hapus foto" : "Tandai foto untuk dihapus"
                  }
                  className={cn(
                    "absolute right-3 top-3 rounded-full p-1.5 shadow-soft transition-colors disabled:opacity-60",
                    removed
                      ? "bg-pink text-ink"
                      : "bg-white/90 text-ink-soft hover:bg-white hover:text-ink",
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}

          {newPhotos.map((photo, index) => (
            <li key={photo.preview} className="polaroid relative p-2">
              <span className="absolute left-3 top-3 z-10 rounded-full bg-mint px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink shadow-soft">
                Baru
              </span>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt={`Foto baru ${index + 1}`}
                className="aspect-square w-full rounded-[8px] object-cover"
              />

              <button
                type="button"
                onClick={() => removeNewAt(index)}
                disabled={disabled}
                aria-label={`Hapus foto baru ${index + 1}`}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-ink-soft shadow-soft transition-colors hover:bg-white hover:text-ink disabled:opacity-60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || remaining === 0}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-ink/20 bg-white/60 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-pink hover:bg-white disabled:opacity-60"
      >
        <ImagePlus className="h-4 w-4" aria-hidden />
        {remaining === 0 ? "Batas foto tercapai" : "Tambah foto"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {localError ? (
        <p role="alert" className="text-xs font-medium text-[#a13d4a]">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
