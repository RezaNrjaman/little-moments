-- Little Moments
-- Migration: 0002 - Private storage bucket for memory photos
-- Rules (SECURITY.md section 6):
--   * Bucket is PRIVATE (no public URL, no public policies).
--   * Only JPEG / PNG / WebP, max 5 MB.
--   * The database stores only image_path, never a signed URL.
--   * Access happens through the server: /api/uploads/sign (write) and
--     /api/images/[id] (read via short lived signed URL).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'memories',
    'memories',
    false,
    5 * 1024 * 1024,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Intentionally NO storage policies are created here.
-- With RLS enabled and no policies, anon/authenticated key holders cannot
-- read or write the bucket; only the server-side service role can.
