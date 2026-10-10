"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoPicker } from "@/components/forms/PhotoPicker";
import { MemoryImagesEditor } from "@/components/forms/MemoryImagesEditor";
import { UploadPreview } from "@/components/forms/UploadPreview";
import { MAX_MEMORY_PHOTOS } from "@/config/site";
import type { SelectedPhoto } from "@/components/forms/photo-selection";
import { memoryFormSchema } from "@/features/memories/schemas";
import { createMemory, updateMemory } from "@/features/memories/actions";
import type {
  Memory,
  MemoryImage,
  MemoryImageUpload,
} from "@/features/memories/types";

type MemoryFormValues = z.infer<typeof memoryFormSchema>;

type MemoryFormProps = {
  /** Present when editing an existing memory. */
  memory?: Memory;
  /** Extra photos of the memory being edited. */
  images?: MemoryImage[];
};

/**
 * MemoryForm (DESIGN.md section 9) - "cute journal form".
 *
 * Flow: validate -> authorise upload (/api/uploads/sign) -> upload photos ->
 * save metadata (Server Action) -> success toast -> back to the scrapbook.
 * The first photo is the cover; the rest go to the gallery.
 */
export function MemoryForm({ memory, images = [] }: MemoryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(memory);

  // Create: all chosen photos, the first one is the cover.
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  // Edit: an optional replacement cover + new extra photos + removals.
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [newPhotos, setNewPhotos] = useState<SelectedPhoto[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Free every remaining preview object URL when the form unmounts.
  const previewsRef = useRef<SelectedPhoto[]>([]);
  useEffect(() => {
    previewsRef.current = [...photos, ...newPhotos];
  }, [photos, newPhotos]);
  useEffect(
    () => () => {
      previewsRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.preview),
      );
    },
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(memoryFormSchema),
    defaultValues: {
      title: memory?.title ?? "",
      description: memory?.description ?? "",
      memoryDate: memory?.memory_date ?? format(new Date(), "yyyy-MM-dd"),
      location: memory?.location ?? "",
    },
  });

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
      throw new Error(
        signed?.error ?? "Unggahan foto belum bisa disiapkan.",
      );
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

  async function onSubmit(values: MemoryFormValues) {
    setFormError(null);
    setPhotoError(null);

    try {
      if (!isEditing) {
        if (photos.length === 0) {
          setPhotoError("Pilih minimal satu foto untuk kenangan ini.");
          return;
        }

        const uploads: MemoryImageUpload[] = [];
        for (const photo of photos) {
          uploads.push(await requestUpload(photo.file));
        }

        const result = await createMemory({
          title: values.title,
          description: values.description,
          memoryDate: values.memoryDate,
          location: values.location,
          images: uploads,
        });

        if (!result.ok) {
          setFormError(result.error);
          return;
        }

        toast.success("♡ Kenangan tersimpan!");
        router.push("/memories");
        router.refresh();
        return;
      }

      // Editing: optionally replace the cover, add or remove extra photos.
      let cover: MemoryImageUpload | undefined;
      if (coverFile) cover = await requestUpload(coverFile);

      const addedImages: MemoryImageUpload[] = [];
      for (const photo of newPhotos) {
        addedImages.push(await requestUpload(photo.file));
      }

      const result = await updateMemory({
        id: memory!.id,
        title: values.title,
        description: values.description,
        memoryDate: values.memoryDate,
        location: values.location,
        currentImagePath: memory!.image_path,
        ...(cover
          ? { imagePath: cover.imagePath, uploadTicket: cover.uploadTicket }
          : {}),
        addedImages,
        removedImageIds: removedIds,
      });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      if (result.message) {
        toast.warning(result.message);
      } else {
        toast.success("♡ Kenangan diperbarui!");
      }

      router.push(`/memories/${memory!.id}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kenangan belum bisa disimpan. Coba lagi ya.";
      setFormError(message);
    }
  }

  function toggleRemove(id: string) {
    setRemovedIds((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-busy={isSubmitting}
    >
      {isEditing ? (
        <div className="space-y-4">
          <UploadPreview
            file={coverFile}
            onChange={setCoverFile}
            currentImageUrl={memory ? `/api/images/${memory.id}` : null}
            disabled={isSubmitting}
          />
          <MemoryImagesEditor
            images={images}
            removedIds={removedIds}
            onToggleRemove={toggleRemove}
            newPhotos={newPhotos}
            onNewPhotosChange={setNewPhotos}
            max={MAX_MEMORY_PHOTOS}
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <PhotoPicker
          photos={photos}
          onChange={setPhotos}
          max={MAX_MEMORY_PHOTOS}
          disabled={isSubmitting}
        />
      )}

      {photoError ? (
        <p role="alert" className="text-xs font-medium text-[#a13d4a]">
          {photoError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          placeholder="Perjalanan kecil pertama kita"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        {errors.title ? (
          <p role="alert" className="text-xs font-medium text-[#a13d4a]">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memoryDate">Tanggal</Label>
        <Input
          id="memoryDate"
          type="date"
          aria-invalid={Boolean(errors.memoryDate)}
          {...register("memoryDate")}
        />
        {errors.memoryDate ? (
          <p role="alert" className="text-xs font-medium text-[#a13d4a]">
            {errors.memoryDate.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Cerita</Label>
        <Textarea
          id="description"
          placeholder="Ceritakan kisah di balik momen ini..."
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
        {errors.description ? (
          <p role="alert" className="text-xs font-medium text-[#a13d4a]">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Lokasi (opsional)</Label>
        <Input
          id="location"
          placeholder="Bandung, Indonesia"
          aria-invalid={Boolean(errors.location)}
          {...register("location")}
        />
        {errors.location ? (
          <p role="alert" className="text-xs font-medium text-[#a13d4a]">
            {errors.location.message}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-[var(--radius-sm)] bg-[#ffe3e6] px-4 py-3 text-sm font-medium text-[#a13d4a]"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden />
              {isEditing ? "Simpan perubahan" : "Simpan kenangan"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
