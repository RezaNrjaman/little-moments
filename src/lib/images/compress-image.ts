/**
 * Client-side image preparation for the bulk importer.
 *
 * Phone photos are often several MB and may carry an EXIF orientation flag.
 * The scrapbook only stores JPEG / PNG / WebP up to 5 MB (SECURITY.md 7), so
 * every imported photo is downscaled to a sane size, rotated upright and
 * re-encoded as JPEG before it is uploaded.
 */

type BitmapSource = ImageBitmap | HTMLImageElement;

export type CompressOptions = {
  /** Longest edge of the result, in pixels. */
  maxDimension?: number;
  /** JPEG quality (0-1) to start from. */
  quality?: number;
  /** Keep trying smaller until the result fits this many bytes. */
  maxBytes?: number;
};

const DEFAULT_MAX_DIMENSION = 2000;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_MAX_BYTES = 4.8 * 1024 * 1024; // just under the 5 MB server limit

export async function compressImageToJpeg(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  let quality = options.quality ?? DEFAULT_QUALITY;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  const source = await loadBitmap(file);
  const ratio = Math.min(
    1,
    maxDimension / Math.max(source.width, source.height),
  );
  let width = Math.max(1, Math.round(source.width * ratio));
  let height = Math.max(1, Math.round(source.height * ratio));

  let blob: Blob | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      if (source instanceof ImageBitmap) source.close();
      throw new Error("Perangkat ini tidak bisa memproses foto.");
    }

    context.drawImage(source, 0, 0, width, height);
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );

    if (blob && (blob.size <= maxBytes || attempt === 3)) break;

    width = Math.max(1, Math.round(width * 0.85));
    height = Math.max(1, Math.round(height * 0.85));
    quality = Math.max(0.5, quality - 0.1);
  }

  if (source instanceof ImageBitmap) source.close();

  if (!blob) throw new Error("Foto belum bisa diproses.");

  const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

async function loadBitmap(file: File): Promise<BitmapSource> {
  if (typeof createImageBitmap === "function") {
    try {
      // "from-image" applies the EXIF orientation so portrait photos stay up.
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fall through to the <img> path below.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
      element.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
