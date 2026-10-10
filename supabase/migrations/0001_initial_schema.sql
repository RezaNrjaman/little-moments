-- Little Moments
-- Supabase Database Schema
-- Version: 1.0
-- Purpose: Initial database migration for MVP


-- ============================================
-- Extensions
-- ============================================

create extension if not exists pgcrypto;


-- ============================================
-- Table: memories
-- ============================================

create table if not exists public.memories (

    id uuid primary key default gen_random_uuid(),

    title text not null,

    description text not null default '',

    memory_date date not null,

    location text,

    image_path text not null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);


-- Index for timeline and date filtering

create index if not exists memories_date_idx
on public.memories (memory_date desc);



-- ============================================
-- Table: scrapbook_settings
-- ============================================

create table if not exists public.scrapbook_settings (

    id integer primary key default 1,

    couple_name text not null default 'Little Moments',

    relationship_start_date date,

    intro_message text not null default 'A little book of us',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint scrapbook_settings_single_row
    check (id = 1)

);



-- Ensure default configuration exists

insert into public.scrapbook_settings (id)
values (1)
on conflict (id) do nothing;



-- ============================================
-- Updated At Trigger
-- ============================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$

begin

    new.updated_at = now();

    return new;

end;

$$;


drop trigger if exists update_memories_updated_at
on public.memories;


create trigger update_memories_updated_at

before update on public.memories

for each row

execute function public.update_updated_at_column();



drop trigger if exists update_scrapbook_settings_updated_at
on public.scrapbook_settings;


create trigger update_scrapbook_settings_updated_at

before update on public.scrapbook_settings

for each row

execute function public.update_updated_at_column();



-- ============================================
-- Row Level Security
-- ============================================

alter table public.memories enable row level security;

alter table public.scrapbook_settings enable row level security;



-- ============================================
-- RLS Policies
-- ============================================
--
-- NOTE:
-- Access control is handled through application server session.
-- Do not create public access policies.
--
-- Policies below are intentionally restrictive.
-- Server-side operations should use the appropriate Supabase server client.


drop policy if exists "No public access memories"
on public.memories;


create policy "No public access memories"

on public.memories

for all

using (false)

with check (false);



drop policy if exists "No public access scrapbook settings"
on public.scrapbook_settings;


create policy "No public access scrapbook settings"

on public.scrapbook_settings

for all

using (false)

with check (false);



-- ============================================
-- Storage Setup Reference
-- ============================================
--
-- Create manually in Supabase Dashboard:
--
-- Bucket:
-- memories
--
-- Configuration:
-- Private bucket
--
-- Files:
-- UUID based names
-- Example:
-- 550e8400-e29b.webp
--
-- Database stores only:
-- memories.image_path
--
-- Never store signed URL permanently.


-- ============================================
-- Example Queries
-- ============================================

-- Latest memories:
--
-- select *
-- from public.memories
-- order by memory_date desc;


-- Filter year:
--
-- select *
-- from public.memories
-- where memory_date >= '2026-01-01'
-- and memory_date < '2027-01-01';


-- Filter month:
--
-- select *
-- from public.memories
-- where memory_date >= '2026-10-01'
-- and memory_date < '2026-11-01';


-- ============================================
-- End Schema
-- ============================================
