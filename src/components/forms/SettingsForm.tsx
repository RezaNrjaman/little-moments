"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { settingsSchema, type SettingsInput } from "@/features/settings/schemas";
import { updateScrapbookSettings } from "@/features/settings/actions";
import type { ScrapbookSettings } from "@/features/settings/types";

type SettingsFormProps = {
  settings: ScrapbookSettings;
};

/**
 * SettingsForm (PRD FR-08): edit the couple name, relationship start date
 * and the opening message shown on the scrapbook cover.
 */
export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      coupleName: settings.couple_name,
      relationshipStartDate: settings.relationship_start_date ?? "",
      introMessage: settings.intro_message,
    },
  });

  async function onSubmit(values: SettingsInput) {
    setFormError(null);

    try {
      const result = await updateScrapbookSettings(values);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      toast.success(result.message ?? "Pengaturan tersimpan.");
      router.refresh();
    } catch {
      setFormError("Pengaturan belum bisa disimpan. Coba lagi ya.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-busy={isSubmitting}
    >
      <div className="space-y-1.5">
        <Label htmlFor="coupleName">Nama pasangan</Label>
        <Input
          id="coupleName"
          placeholder="Nama kalian berdua"
          aria-invalid={Boolean(errors.coupleName)}
          {...register("coupleName")}
        />
        {errors.coupleName ? (
          <p role="alert" className="text-xs font-medium text-[#a13d4a]">
            {errors.coupleName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="relationshipStartDate">Tanggal mulai hubungan</Label>
        <Input
          id="relationshipStartDate"
          type="date"
          aria-invalid={Boolean(errors.relationshipStartDate)}
          {...register("relationshipStartDate")}
        />
        <p className="text-xs text-ink-soft">
          Dipakai untuk menghitung penghitung &quot;bersama selama&quot;. Boleh
          dikosongkan.
        </p>
        {errors.relationshipStartDate ? (
          <p role="alert" className="text-xs font-medium text-[#a13d4a]">
            {errors.relationshipStartDate.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="introMessage">Pesan pembuka</Label>
        <Textarea
          id="introMessage"
          placeholder="Kalimat kecil di bawah nama kalian"
          aria-invalid={Boolean(errors.introMessage)}
          {...register("introMessage")}
        />
        {errors.introMessage ? (
          <p role="alert" className="text-xs font-medium text-[#a13d4a]">
            {errors.introMessage.message}
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
              Simpan pengaturan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
