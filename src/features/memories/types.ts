/** Domain types for the memories feature. */

/** Row shape of public.memories (DATABASE.md section 4.1). */
export type Memory = {
  id: string;
  title: string;
  description: string;
  /** Date of the moment itself, YYYY-MM-DD (never the upload date). */
  memory_date: string;
  location: string | null;
  /** Internal Storage path only - never a signed or public URL. */
  image_path: string;
  created_at: string;
  updated_at: string;
};

/** Row shape of public.memory_images (DATABASE.md section 4.3). */
export type MemoryImage = {
  id: string;
  memory_id: string;
  /** Internal Storage path only - never a signed or public URL. */
  image_path: string;
  position: number;
  created_at: string;
};

/** A memory together with its extra photos (the cover is in image_path). */
export type MemoryWithImages = Memory & { images: MemoryImage[] };

/** One uploaded photo authorised by /api/uploads/sign. */
export type MemoryImageUpload = {
  imagePath: string;
  uploadTicket: string;
};

/** Supported timeline filters (PRD FR-07). */
export type MemoryFilter =
  | { view: "all" }
  | { view: "day"; date: string }
  | { view: "month"; month: string }
  | { view: "year"; year: string };

export type MemoryPage = {
  memories: Memory[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** Result contract shared by every Server Action. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

export type CreateMemoryInput = {
  title: string;
  description: string;
  memoryDate: string;
  location?: string | null;
  /** Ordered photos; the first one becomes the cover. */
  images: MemoryImageUpload[];
};

export type UpdateMemoryInput = {
  id: string;
  title: string;
  description: string;
  memoryDate: string;
  location?: string | null;
  /** Current cover Storage path (staleness guard). */
  currentImagePath: string;
  /** Present only when the cover photo is replaced. */
  imagePath?: string;
  uploadTicket?: string;
  /** Newly added extra photos. */
  addedImages?: MemoryImageUpload[];
  /** Existing extra photo row ids to delete. */
  removedImageIds?: string[];
};
