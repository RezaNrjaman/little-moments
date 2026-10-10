import "server-only";

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  type AllowedImageType,
} from "@/config/site";

/**
 * Server side file validation (SECURITY.md section 7).
 *
 * Checks, in order:
 * 1. File size limit.
 * 2. Declared MIME type against the allow list.
 * 3. Actual file content (magic bytes) - extensions and Content-Type
 *    headers are never trusted on their own.
 */

export type ImageValidationResult =
  | { valid: true; contentType: AllowedImageType }
  | { valid: false; reason: string };

function startsWith(buffer: Uint8Array, bytes: number[], offset = 0): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function asciiAt(buffer: Uint8Array, text: string, offset: number): boolean {
  if (buffer.length < offset + text.length) return false;
  for (let i = 0; i < text.length; i += 1) {
    if (buffer[offset + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

/** Detect the real image format from the file content. */
export function detectImageType(
  buffer: Uint8Array,
): AllowedImageType | null {
  // JPEG: FF D8 FF
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }
  // WebP: "RIFF" .... "WEBP"
  if (asciiAt(buffer, "RIFF", 0) && asciiAt(buffer, "WEBP", 8)) {
    return "image/webp";
  }
  return null;
}

export function validateImageFile(file: {
  size: number;
  type: string;
  bytes: Uint8Array;
}): ImageValidationResult {
  if (file.size <= 0 || file.bytes.length === 0) {
    return { valid: false, reason: "Fotonya kosong." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      reason: "Foto terlalu besar. Gunakan gambar di bawah 5 MB.",
    };
  }

  if (!(file.type in ALLOWED_IMAGE_TYPES)) {
    return {
      valid: false,
      reason: "Hanya foto JPEG, PNG, atau WebP yang didukung.",
    };
  }

  const detected = detectImageType(file.bytes);
  if (!detected) {
    return {
      valid: false,
      reason: "File itu sepertinya bukan foto yang valid.",
    };
  }

  if (detected !== file.type) {
    return {
      valid: false,
      reason: "Isi foto tidak cocok dengan tipe filenya.",
    };
  }

  return { valid: true, contentType: detected };
}
