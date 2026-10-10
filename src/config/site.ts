/** Static site configuration (no secrets, safe for client). */
export const siteConfig = {
  name: "Little Moments",
  description: "Buku kecil privat kita berdua.",
  defaultCoupleName: "Little Moments",
  defaultIntroMessage: "Buku kecil kita berdua",
} as const;

/** Maximum allowed upload size for a memory photo (5 MB). */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Maximum number of photos attached to a single memory (cover + extras).
 * Enforced on the client and again on the server.
 */
export const MAX_MEMORY_PHOTOS = 10;

/** Allowed photo formats (JPEG, PNG, WebP) - see SECURITY.md section 7. */
export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AllowedImageType = keyof typeof ALLOWED_IMAGE_TYPES;
