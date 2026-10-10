"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/config/site";
import type { SelectedPhoto } from "@/components/forms/photo-selection";

type PhotoPickerProps = {
  /** Selected photos; the first one becomes the memory cover. */
  photos: SelectedPhoto[];
  onChange: (photos: SelectedPhoto[]) => void;
  /** Maximum number of photos for one memory. */
  max: number;
  disabled?: boolean;
};

/**
 * PhotoPicker (DESIGN.md section 9): pick one or more photos at once.
 * The first photo is the cover shown on the timeline. Everything is
 * validated again on the server, which never trusts this input.
 */
export function PhotoPicker({
  photos,
  onChange,
  max,
  disabled,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

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

    const combined = [...photos, ...valid];
    const next = combined.slice(0, max);
    // Free any preview that overflowed the limit.
    combined.slice(max).forEach((photo) => URL.revokeObjectURL(photo.preview));
    if (combined.length > max) {
      error = `Maksimal ${max} foto per kenangan.`;
    }

    onChange(next);
    setLocalError(error);
  }

  function removeAt(index: number) {
    setLocalError(null);
    const target = photos[index];
    if (target) URL.revokeObjectURL(target.preview);
    onChange(photos.filter((_, i) => i !== index));
  }

  const full = photos.length >= max;

  return (
    <div className="space-y-2">
      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.preview} className="polaroid relative p-2">
              {index === 0 ? (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-pink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink shadow-soft">
                  Cover
                </span>
              ) : null}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt={`Foto ${index + 1}`}
                className="aspect-square w-full rounded-[8px] object-cover"
              />

              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={`Hapus foto ${index + 1}`}
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
        disabled={disabled || full}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-ink/20 bg-white/60 px-4 py-6 text-center transition-colors hover:border-pink hover:bg-white disabled:opacity-60"
      >
        <span className="sticker h-11 w-11 bg-pink text-lg">
          <ImagePlus className="h-5 w-5 text-ink" aria-hidden />
        </span>
        <span className="text-sm font-semibold text-ink">
          {photos.length === 0 ? "Unggah foto kenangan" : "Tambah foto lagi"}
        </span>
        <span className="text-xs text-ink-soft">
          JPEG, PNG, atau WebP - maksimal 5 MB per foto - {photos.length}/{max}
        </span>
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

      {disabled ? (
        <p className="flex items-center gap-2 text-xs text-ink-soft">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Mengunggah foto...
        </p>
      ) : null}

      {localError ? (
        <p role="alert" className="text-xs font-medium text-[#a13d4a]">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
