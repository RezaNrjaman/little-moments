"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, RefreshCcw, X } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/config/site";

type UploadPreviewProps = {
  /** Newly selected photo, or null when the existing photo is kept. */
  file: File | null;
  onChange: (file: File | null) => void;
  /** Existing photo to show while editing (session protected route). */
  currentImageUrl?: string | null;
  /** Client side validation message (server re-validates everything). */
  error?: string | null;
  disabled?: boolean;
};

/**
 * UploadPreview (DESIGN.md section 9).
 *
 * Empty state:      +  Upload your memory photo
 * Success state:    [IMAGE]  Change photo
 */
export function UploadPreview({
  file,
  onChange,
  currentImageUrl,
  error,
  disabled,
}: UploadPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  // Revoke the last object URL when the component unmounts.
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  /** Swap the preview URL for a newly selected file. */
  function setPreview(selected: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = selected ? URL.createObjectURL(selected) : null;
    setPreviewUrl(previewRef.current);
  }

  const url = previewUrl ?? currentImageUrl ?? null;
  const message = error ?? localError;

  function handleFile(selected: File | null) {
    setLocalError(null);

    if (!selected) {
      setPreview(null);
      onChange(null);
      return;
    }

    if (!(selected.type in ALLOWED_IMAGE_TYPES)) {
      setLocalError("Hanya foto JPEG, PNG, atau WebP yang didukung.");
      return;
    }

    if (selected.size > MAX_IMAGE_SIZE_BYTES) {
      setLocalError("Foto terlalu besar. Gunakan gambar di bawah 5 MB.");
      return;
    }

    setPreview(selected);
    onChange(selected);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        {url ? (
          <div className="polaroid overflow-hidden p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={file ? "Pratinjau foto terpilih" : "Foto saat ini"}
              className="aspect-[4/3] w-full rounded-[8px] object-cover"
            />

            <div className="flex items-center justify-between px-1 pb-1 pt-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-full bg-lavender px-4 py-1.5 text-xs font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
              >
                <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
                Ganti foto
              </button>

              {file ? (
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  disabled={disabled}
                  aria-label="Hapus foto yang dipilih"
                  className="rounded-full p-2 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            aria-label="Unggah foto kenangan"
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-ink/20 bg-white/60 px-4 text-center transition-colors hover:border-pink hover:bg-white disabled:opacity-60"
          >
            <span className="sticker h-12 w-12 bg-pink text-xl">
              <Camera className="h-5 w-5 text-ink" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-ink">
              Unggah foto kenangan
            </span>
            <span className="text-xs text-ink-soft">
              JPEG, PNG, atau WebP - maksimal 5 MB
            </span>
          </button>
        )}

        {disabled ? (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-md)] bg-white/50"
          >
            <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
          </span>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />

      {message ? (
        <p role="alert" className="text-xs font-medium text-[#a13d4a]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
