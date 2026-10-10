# Little Moments - AGENTS.md

Version: 1.0\
Status: Development Guidelines

# 1. Purpose

Dokumen ini berisi aturan dan panduan bagi AI Agent, developer, dan
contributor ketika melakukan pengembangan project Little Moments.

Tujuan utama:

-   Menjaga konsistensi implementasi.
-   Memastikan kode mengikuti architecture.
-   Menjaga keamanan data privat.
-   Mempertahankan kualitas UI/UX scrapbook.

# 2. Project Context

Little Moments adalah website scrapbook digital privat untuk menyimpan
perjalanan hubungan pasangan.

Karakter produk:

-   Personal.
-   Private.
-   Emotional.
-   Simple.
-   Cute playful.

Tech stack utama:

-   Next.js App Router.
-   TypeScript.
-   React.
-   Tailwind CSS.
-   Supabase PostgreSQL.
-   Supabase Storage.
-   Vercel.

# 3. Core Development Principles

## 3.1 Follow Existing Architecture

Agent wajib mengikuti struktur:

    UI Layer

    ↓

    Feature Layer

    ↓

    Data Access Layer

    ↓

    Infrastructure Layer

Jangan membuat:

-   Backend terpisah tanpa kebutuhan.
-   Query database langsung dari component UI.
-   Logic bisnis bercampur dengan presentation.

# 4. Code Organization Rules

## Components

Lokasi:

    src/components/

Berisi:

-   Reusable UI components.
-   Presentation components.

Contoh:

    MemoryCard
    MemoryTimeline
    ScrapbookHeader

------------------------------------------------------------------------

## Features

Lokasi:

    src/features/

Berisi:

-   Business logic.
-   Actions.
-   Validation.
-   Queries.
-   Types.

Contoh:

    features/memories/

    actions.ts
    schemas.ts
    queries.ts
    types.ts

------------------------------------------------------------------------

## Lib

Lokasi:

    src/lib/

Berisi:

-   Authentication.
-   Supabase client.
-   Security utilities.
-   Helpers.

# 5. TypeScript Rules

Wajib:

-   Gunakan TypeScript strict mode.
-   Hindari penggunaan any.
-   Buat type untuk data model.
-   Validasi input eksternal.

Contoh:

    type Memory = {
     id: string;
     title: string;
     memoryDate: string;
    }

# 6. Server and Client Component Rules

Gunakan Server Components untuk:

-   Data fetching.
-   Database query.
-   Initial rendering.

Gunakan Client Components untuk:

-   User interaction.
-   Form state.
-   Animation.

Jangan:

-   Mengakses secret key dari client.
-   Menggunakan database langsung dari browser.

# 7. Database Rules

Database access harus:

-   Melalui server layer.
-   Menggunakan schema yang telah ditentukan.

Tabel utama:

    memories

    scrapbook_settings

Rules:

-   Jangan mengubah schema tanpa migration.
-   Jangan menghapus field existing tanpa review.
-   Gunakan migration file.

# 8. Supabase Rules

## Database

Wajib:

-   Enable RLS.
-   Tidak membuat public unrestricted access.

## Storage

Wajib:

-   Bucket private.
-   Gunakan signed URL.
-   Simpan image_path, bukan URL permanen.

Dilarang:

-   Menaruh service key pada client.
-   Menggunakan NEXT_PUBLIC untuk secret.

# 9. Authentication Rules

Authentication menggunakan:

-   Shared password.
-   Server-side session.

Agent wajib:

-   Validasi session pada operasi sensitif.
-   Menggunakan secure cookie.
-   Tidak menyimpan token pada localStorage.

# 10. Security Rules

Semua input pengguna harus:

-   Divalidasi.
-   Dibersihkan.
-   Tidak dipercaya langsung.

Wajib memperhatikan:

-   File validation.
-   Session validation.
-   Authorization check.
-   Error handling.

Jangan:

-   Log password.
-   Log secret.
-   Log token.

# 11. UI/UX Rules

Design harus mengikuti:

-   Cute playful style.
-   Pastel color palette.
-   Scrapbook feeling.

Prioritas:

    Photo > UI decoration

    Story > Feature complexity

    Emotion > Visual effects

Komponen harus mendukung:

-   Loading state.
-   Empty state.
-   Error state.
-   Success feedback.

# 12. Styling Rules

Gunakan:

-   Tailwind CSS.
-   Design tokens.
-   Existing component styles.

Hindari:

-   Inline style berlebihan.
-   Warna random.
-   Komponen tidak konsisten.

# 13. Feature Development Rules

Setiap fitur baru harus memiliki:

## 1. Requirement

Jelaskan:

-   Tujuan fitur.
-   User flow.
-   Data yang digunakan.

## 2. Implementation

Pisahkan:

-   UI.
-   Logic.
-   Database operation.

## 3. Testing

Pastikan:

-   Happy path.
-   Error case.
-   Security case.

# 14. Memory Feature Rules

Memory object wajib menggunakan:

    title

    description

    memory_date

    location

    image_path

    created_at

    updated_at

Jangan menggunakan:

-   Upload date sebagai tanggal kenangan.
-   Public image URL.

# 15. File Upload Rules

Sebelum upload:

Check:

-   Extension.
-   MIME type.
-   File size.
-   Image validity.

Storage filename:

Gunakan:

    UUID + extension

Jangan:

-   Menggunakan nama file asli sebagai path.

# 16. Error Handling Rules

Error harus:

-   User friendly.
-   Tidak membocorkan informasi internal.

Contoh:

Baik:

    Unable to save memory. Please try again.

Buruk:

    Database connection failed at postgres node xxx.

# 17. Git Rules

Commit harus jelas.

Format:

    type: description

Contoh:

    feat: add memory upload flow

    fix: handle image validation error

    docs: update architecture guide

# 18. Testing Requirements

Sebelum merge:

Check:

## Functional

-   Login.
-   CRUD memory.
-   Filter.
-   Upload.

## Security

-   Private route protection.
-   Storage protection.
-   Input validation.

## Responsive

-   Mobile.
-   Tablet.
-   Desktop.

# 19. Agent Behavior Rules

AI Agent harus:

-   Membaca dokumentasi project sebelum melakukan perubahan.
-   Mengikuti existing pattern.
-   Menjelaskan perubahan yang dibuat.
-   Tidak membuat keputusan architecture besar tanpa alasan.

Jika requirement tidak jelas:

Prioritaskan:

1.  Security.
2.  Maintainability.
3.  User experience.

# 20. Documentation Rules

Perubahan besar harus memperbarui:

-   PRD.md jika requirement berubah.
-   DESIGN.md jika UI berubah.
-   ARCHITECTURE.md jika struktur berubah.
-   DATABASE.md jika schema berubah.
-   USER-FLOW.md jika interaction berubah.

# 21. Definition of Quality

Implementasi dianggap berkualitas apabila:

-   Kode mudah dipahami.
-   Security terjaga.
-   UI konsisten.
-   Database aman.
-   Dokumentasi sesuai.

Final principle:

    Build simple.

    Protect privacy.

    Preserve memories.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
