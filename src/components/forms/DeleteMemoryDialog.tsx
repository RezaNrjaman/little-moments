"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteMemory } from "@/features/memories/actions";

type DeleteMemoryDialogProps = {
  memoryId: string;
  className?: string;
};

/**
 * DeleteMemoryDialog (DESIGN.md section 14): confirmation paper card.
 * Deletion is confirmed by the user, validated on the server, and removes
 * both the database record and the storage file.
 */
export function DeleteMemoryDialog({ memoryId, className }: DeleteMemoryDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (isDeleting) return;
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteMemory({ id: memoryId });

      if (!result.ok) {
        setError(result.error);
        setIsDeleting(false);
        return;
      }

      if (result.message) {
        toast.warning(result.message);
      } else {
        toast.success("Kenangan dihapus.");
      }

      setOpen(false);
      router.push("/memories");
      router.refresh();
    } catch {
      setError("Kenangan belum bisa dihapus. Coba lagi ya.");
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="danger" className={className}>
          <Trash2 className="h-4 w-4" aria-hidden />
          Hapus
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus kenangan ini?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak bisa dibatalkan. Semua foto dan cerita akan
            dihapus dari buku kenangan.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            role="alert"
            className="rounded-[var(--radius-sm)] bg-[#ffe3e6] px-4 py-3 text-sm font-medium text-[#a13d4a]"
          >
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden />
                Hapus
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
