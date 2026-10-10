-- Little Moments
-- Migration: 0003 - Multiple photos per memory
--
-- Model (approved):
--   * memories.image_path stays the COVER photo (timeline stays fast and
--     every existing memory keeps working unchanged).
--   * Additional photos live in public.memory_images (position >= 0).
--
-- Rules:
--   * Bucket stays private; only image_path values are stored, never URLs.
--   * RLS is enabled with NO policies, exactly like public.memories, so the
--     anon/authenticated keys cannot touch the table; only the server side
--     service role can.

create table if not exists public.memory_images (
    id uuid primary key default gen_random_uuid(),

    memory_id uuid not null references public.memories(id) on delete cascade,

    image_path text not null,

    -- Order inside the memory detail gallery (0 = first extra photo).
    position integer not null default 0,

    created_at timestamptz not null default now()
);

create index if not exists memory_images_memory_id_idx
on public.memory_images (memory_id, position);

alter table public.memory_images enable row level security;

-- No policies on purpose: the table is reachable only through the server
-- (service role), never with the publishable/anon key.
drop policy if exists "No public access memory_images" on public.memory_images;
create policy "No public access memory_images"
on public.memory_images
for all
using (false)
with check (false);

-- Data nicety: the stock intro message was English. Only update it while it
-- still has the original default, so a customised value is never overwritten.
update public.scrapbook_settings
set intro_message = 'Buku kecil kita berdua'
where id = 1 and intro_message = 'A little book of us';
