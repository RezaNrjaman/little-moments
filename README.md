# Little Moments

Private Digital Couple Scrapbook

Version: 1.0

# Overview

Little Moments adalah website scrapbook digital privat yang digunakan
untuk menyimpan perjalanan hubungan dalam bentuk timeline kenangan.

Pengguna dapat:

-   Menyimpan foto.
-   Menambahkan cerita.
-   Melihat perjalanan hubungan berdasarkan waktu.
-   Mengelola kenangan secara CRUD.
-   Mencari kenangan berdasarkan tanggal.

# Main Features

## Private Access

Akses scrapbook dilindungi password bersama.

Fitur:

-   Password gate.
-   Secure session.
-   Logout.

## Memory Timeline

Menampilkan kenangan secara kronologis (terbaru lebih dulu).

Informasi:

-   Foto.
-   Judul.
-   Tanggal kejadian.
-   Cerita singkat.

## Memory Management

CRUD:

-   Create memory.
-   Read memory.
-   Update memory.
-   Delete memory.

## Multiple Photos

Setiap kenangan dapat menyimpan 1 sampai 10 foto. Foto pertama menjadi
cover di timeline; foto lainnya tampil di galeri halaman detail.

## Scrapbook Settings

Halaman `/settings` untuk mengubah nama pasangan, tanggal mulai
hubungan, dan pesan pembuka.

## Filtering

Filter berdasarkan:

-   Semua kenangan.
-   Hari.
-   Bulan.
-   Tahun.

# Technology Stack

## Frontend

-   Next.js App Router
-   React
-   TypeScript (strict)
-   Tailwind CSS
-   shadcn/ui (Radix primitives)
-   lucide-react

## Backend

-   Next.js server layer (Route Handlers + Server Actions)
-   Zod + React Hook Form (validation)
-   jose (session & upload tickets)
-   date-fns (date formatting)
-   sonner (toasts)

## Database & Storage

-   Supabase PostgreSQL
-   Supabase Storage (private bucket)

## Deployment

-   Vercel

# Project Structure

    src/
      app/
        (private)/            # session protected route group
          memories/           # timeline, new, [id], [id]/edit
          settings/           # scrapbook configuration
          layout.tsx          # validates the session server side
        api/
          auth/login          # password gate endpoint
          auth/logout
          uploads/sign        # authorised upload URLs
          images/[id]         # secure cover photo access
          memory-images/[id]  # secure extra photo access
        page.tsx              # Password Gate
        layout.tsx
      components/
        ui/                   # shadcn/ui primitives
        auth/                 # PasswordGate, LogoutButton
        scrapbook/            # header, timeline, cards, filter, states
        forms/                # MemoryForm, PhotoPicker, MemoryImagesEditor,
                              # UploadPreview, SettingsForm, DeleteMemoryDialog
      features/
        memories/
          actions.ts          # Server Actions (CRUD)
          queries.ts          # data access layer
          schemas.ts          # Zod validation
          types.ts            # domain types
        settings/
          actions.ts          # updateScrapbookSettings
          queries.ts          # settings data access
          schemas.ts          # Zod validation
          types.ts            # domain types
      lib/
        auth/                 # password hashing, session
        security/             # origin checks, rate limiting, file validation
        supabase/             # server-only Supabase client + image proxy
      config/                 # shared config (upload limits, allowed types)
    supabase/
      schema.sql              # full schema
      migrations/             # 0001 schema, 0002 storage bucket, 0003 memory_images
    scripts/
      hash-password.mjs       # generate SCRAPBOOK_PASSWORD_HASH

# Getting Started

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

1. Create a project at https://supabase.com.
2. Run the migrations from `supabase/migrations/` (via the SQL editor or
   the Supabase CLI):

   ```bash
   supabase db push
   # or paste each file in order into the SQL editor:
   #   0001_initial_schema.sql
   #   0002_storage_bucket.sql
   #   0003_memory_images.sql
   ```

3. Copy the project URL and the **secret (service role) key** from
   Project Settings -> API.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (safe to expose). |
| `SUPABASE_SECRET_KEY` | Supabase secret / service role key. **Server only.** |
| `SCRAPBOOK_PASSWORD_HASH` | Hash of the shared password (see below). |
| `SESSION_SECRET` | High entropy random secret for session signing. |
| `UPSTASH_REDIS_REST_URL` | Optional, persistent login rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Optional, persistent login rate limiting. |

Generate the shared password hash:

```bash
npm run hash-password "your shared password"
# -> SCRAPBOOK_PASSWORD_HASH=scrypt:<salt>:<hash>
```

Generate the session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

> Never use `NEXT_PUBLIC_*` for secrets, and never commit `.env.local`.

## 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter the shared
password at the gate.

## 5. Available scripts

```bash
npm run dev            # development server
npm run build          # production build
npm run start          # run the production build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run hash-password  # generate SCRAPBOOK_PASSWORD_HASH
```

# Routes

| Route | Description |
| --- | --- |
| `/` | Password gate. |
| `/memories` | Timeline scrapbook + filter. |
| `/memories/new` | Create a memory. |
| `/memories/[id]` | Memory detail. |
| `/memories/[id]/edit` | Edit a memory. |
| `/settings` | Scrapbook settings (name, start date, intro). |
| `POST /api/auth/login` | Verify password, create session. |
| `POST /api/auth/logout` | Destroy session. |
| `POST /api/uploads/sign` | Authorised, short lived upload URL. |
| `GET /api/images/[id]` | Session-checked cover photo proxy. |
| `GET /api/memory-images/[id]` | Session-checked extra photo proxy. |

# Security

Implemented controls (see `SECURITY.md` for the full specification):

-   **RLS enabled** on both tables, no public access policy. Only the
    server-side service role key touches the database.
-   **Private storage bucket** (`memories`), 5 MB limit, JPEG/PNG/WebP
    only, **no storage policies** - only the service role can read/write.
-   **Password** stored as an `scrypt` hash; verification is constant
    time and only happens on the server.
-   **Sessions** use signed JWTs (`jose`, HS256) in `HttpOnly`,
    `SameSite=Lax`, `Secure` (production) cookies with a limited lifetime.
-   **No tokens in localStorage**; the browser never sees a secret key.
-   **Every Server Action and Route Handler validates the session** and
    checks the request Origin (CSRF protection).
-   **File validation** on the server: size, declared MIME type, and
    actual file content (magic bytes). Filenames are server generated
    `UUID.extension`; the database stores only `image_path`.
-   **Upload tickets** bind an upload path to the session so a client can
    never submit an arbitrary `image_path`.
-   **Images** are proxied through `GET /api/images/[id]` (cover) and
    `GET /api/memory-images/[id]` (extra photos) using short lived signed
    URLs that never reach the browser.
-   **Login rate limiting** (5 attempts / 15 minutes). Uses Upstash Redis
    when configured, otherwise a best effort in-memory limiter.

# Testing

See `TEST-PLAN.md` for the full plan and `TEST-REPORT.md` for executed
results.

# Learn More

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Supabase Documentation](https://supabase.com/docs)

# Deploy on Vercel

See `DEPLOYMENT.md` for the full step-by-step guide. In short:

1. Push the repository to Git.
2. Import the project into Vercel.
3. Add all environment variables from `.env.local` in the Vercel
   dashboard (never commit them).
4. Deploy. Ensure the Supabase project has migrations `0001`-`0003`
   applied and the private `memories` bucket created.

Final principle:

    Build simple.
    Protect privacy.
    Preserve memories.
