# Little Moments - Implementation Plan

Version: 1.1\
Status: Draft Implementation Plan

# 1. Overview

Dokumen ini menjelaskan rencana implementasi teknis Little Moments
berdasarkan:

-   Product Requirement Document
-   Design Specification
-   Architecture Specification
-   Database Specification
-   User Flow Specification

Tujuan:

Membangun website scrapbook digital privat dengan:

-   Password protected access
-   Timeline memory
-   CRUD kenangan
-   Private image storage
-   Responsive scrapbook UI

# 2. Implementation Strategy

Pendekatan implementasi:

    Foundation
        |
        v
    Database & Storage
        |
        v
    Authentication
        |
        v
    Core Features
        |
        v
    UI Enhancement
        |
        v
    Testing
        |
        v
    Deployment

Prioritas:

1.  Functional MVP selesai.
2.  Security diterapkan.
3.  UX diperhalus.
4.  Optimasi dilakukan.

# 3. Phase 1 - Project Initialization

## Objective

Menyiapkan project Next.js.

## Tasks

-   Membuat repository.
-   Membuat Next.js App Router project.
-   Mengaktifkan TypeScript.
-   Konfigurasi Tailwind CSS.
-   Instalasi dependencies.

Dependencies:

    @supabase/supabase-js
    zod
    date-fns
    jose
    react-hook-form
    sonner
    lucide-react

## Output

Project berjalan dengan struktur dasar.

# 4. Phase 2 - Application Structure

## Objective

Membuat struktur folder sesuai architecture.

Structure:

    src/

    app/

    components/

    features/

    lib/

    config/

    supabase/

Tasks:

-   Setup routing.
-   Setup component folder.
-   Setup utility folder.
-   Setup environment variables.

Output:

Fondasi aplikasi siap dikembangkan.

# 5. Phase 3 - Database Implementation

## Objective

Membuat database Supabase.

Tasks:

Create tables:

-   memories
-   memory_images
-   scrapbook_settings

Migration:

-   Create schema.
-   Add indexes.
-   Enable RLS.

Database validation:

-   Primary key.
-   Required fields.
-   Timestamp.

Output:

Database siap digunakan.

# 6. Phase 4 - Storage Implementation

## Objective

Menyimpan foto secara aman.

Tasks:

-   Membuat private bucket memories.
-   Membuat upload flow.
-   Membuat signed URL generation.
-   Validasi file.

Rules:

Allowed:

-   JPG
-   PNG
-   WebP

Validation:

-   File size.
-   MIME type.
-   Content validation.

Output:

Foto dapat disimpan secara privat.

# 7. Phase 5 - Authentication

## Objective

Membuat password gate.

Tasks:

-   Create login endpoint.
-   Verify password hash.
-   Generate session.
-   Set secure cookie.
-   Create logout.

Security:

-   HttpOnly cookie.
-   Secure production cookie.
-   Server validation.

Output:

Private route terlindungi.

# 8. Phase 6 - UI Foundation

## Objective

Implementasi design system.

Tasks:

Create:

-   Color tokens.
-   Typography.
-   Button styles.
-   Card styles.
-   Input styles.

Components:

-   ScrapbookHeader
-   MemoryCard
-   MemoryTimeline
-   EmptyState
-   LoadingState

Output:

UI foundation tersedia.

# 9. Phase 7 - Timeline Feature

## Objective

Menampilkan daftar kenangan.

Tasks:

-   Fetch memories.
-   Sort by memory_date.
-   Render cards.
-   Create responsive layout.

Features:

-   Latest memory first.
-   Empty state.
-   Loading state.

Output:

User dapat melihat scrapbook timeline.

# 10. Phase 8 - Create Memory

## Objective

Membuat fitur tambah kenangan.

Flow:

    Open Form

    Upload Photo

    Input Data

    Validate

    Save Image

    Save Database

    Show Success

Tasks:

-   Create MemoryForm.
-   Add validation schema.
-   Connect storage.
-   Create server action.

Output:

Memory baru dapat dibuat.

# 11. Phase 9 - Memory Detail

## Objective

Menampilkan cerita lengkap.

Tasks:

-   Create detail page.
-   Generate signed image URL.
-   Display complete information.

Output:

User dapat membaca detail memory.

# 12. Phase 10 - Update & Delete

## Update

Tasks:

-   Edit form.
-   Update database.
-   Replace image.

## Delete

Tasks:

-   Confirmation dialog.
-   Delete database.
-   Remove storage file.

Output:

CRUD lengkap.

# 13. Phase 11 - Filtering

## Objective

Pencarian berdasarkan tanggal.

Modes:

-   All
-   Day
-   Month
-   Year

Tasks:

-   Query parameter handling.
-   Database filtering.
-   Preserve filter state.

Output:

Memory mudah ditemukan.

# 14. Phase 12 - UX Enhancement

Tasks:

Tambah:

-   Sticker decoration.
-   Animation.
-   Hover effect.
-   Toast notification.
-   Responsive refinement.

Rules:

Animation tetap ringan.

# 15. Phase 13 - Security Review

Checklist:

Authentication:

-   Session validation.
-   Password protection.

Database:

-   RLS enabled.
-   No public access.

Storage:

-   Private bucket.
-   Signed URL.

Application:

-   Input validation.
-   Error handling.
-   Rate limiting.

# 16. Phase 14 - Testing

## Functional Testing

Test:

-   Login berhasil.
-   Login gagal.
-   Logout.
-   Create memory.
-   Update memory.
-   Delete memory.
-   Upload image.
-   Filter memory.

## Security Testing

Test:

-   Private page tanpa session.
-   Direct image access.
-   Invalid upload.
-   Invalid input.

## Responsive Testing

Device:

-   Mobile.
-   Tablet.
-   Desktop.

# 17. Phase 15 - Deployment

Platform:

-   GitHub
-   Vercel
-   Supabase

Steps:

1.  Push repository.
2.  Configure environment variables.
3.  Deploy Vercel.
4.  Test production.
5.  Monitor errors.

# 18. Development Order

Recommended order:

    1. Setup Project

    2. Database

    3. Storage

    4. Authentication

    5. UI Components

    6. Timeline

    7. CRUD Memory

    8. Filter

    9. Security Review

    10. Deployment

# 19. Estimated Timeline

  Phase                Estimation
  -------------------- ------------
  Project setup        0.5 day
  Database & Storage   1 day
  Authentication       1 day
  UI Foundation        1-2 days
  CRUD Memory          2 days
  Timeline & Filter    1 day
  Testing              1 day
  Deployment           0.5 day

Total:

Approximately 6-10 working days.

# 20. Definition of Done

MVP selesai apabila:

-   UI scrapbook berjalan responsif.
-   Password gate aktif.
-   Session security aktif.
-   CRUD memory berjalan.
-   Multi photo per kenangan berjalan.
-   Pengaturan scrapbook berjalan.
-   Foto tersimpan private.
-   Filter tanggal berjalan.
-   Error handling tersedia.
-   Production deployment berhasil.

# 21. Future Development

Setelah MVP:

-   On This Day feature.
-   Love letter feature.
-   Music background.
-   Export scrapbook.
-   Advanced search.
