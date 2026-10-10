/** Domain types for the scrapbook settings feature. */

/** Row shape of public.scrapbook_settings (DATABASE.md section 4.2). */
export type ScrapbookSettings = {
  id: number;
  couple_name: string;
  relationship_start_date: string | null;
  intro_message: string;
  created_at: string;
  updated_at: string;
};
