import { z } from "zod";
import { isValid, parseISO } from "date-fns";

/**
 * Validation schema for the scrapbook settings form. The server never
 * trusts browser input; the same schema is reused by React Hook Form.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const coupleName = z
  .string()
  .trim()
  .min(1, "Nama pasangan belum diisi.")
  .max(80, "Nama pasangan terlalu panjang (maks 80 karakter).");

const introMessage = z
  .string()
  .trim()
  .max(160, "Pesan pembuka terlalu panjang (maks 160 karakter).");

/** Empty string is allowed and stored as NULL (date not set). */
const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || (DATE_PATTERN.test(value) && isValid(parseISO(value))),
    { message: "Gunakan tanggal yang valid." },
  );

export const settingsSchema = z.object({
  coupleName,
  relationshipStartDate: optionalDate,
  introMessage,
});

export type SettingsInput = z.infer<typeof settingsSchema>;
