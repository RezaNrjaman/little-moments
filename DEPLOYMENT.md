# Little Moments - Panduan Deployment

Version: 1.0\
Status: Panduan langkah demi langkah untuk production

Dokumen ini menjelaskan cara men-deploy Little Moments ke Vercel dengan
Supabase sebagai database dan Storage. Ikuti berurutan.

---

# 1. Ringkasan Arsitektur Production

    Browser (HTTPS)
        |
    Vercel (Next.js App Router)
        |-- Server Actions + Route Handlers
        |
    Supabase
        |-- PostgreSQL (memories, memory_images, scrapbook_settings)
        |-- Storage (bucket privat "memories")

Yang perlu disiapkan:

-   Satu project Supabase (database + storage).
-   Satu akun Vercel (hosting).
-   Repository Git (GitHub/GitLab/Bitbucket) atau Vercel CLI.

---

# 2. Prasyarat

| Kebutuhan | Catatan |
| --- | --- |
| Node.js 20+ | Untuk build lokal dan menjalankan script. |
| Akun Supabase | https://supabase.com |
| Akun Vercel | https://vercel.com |
| Repository Git | Disarankan; bisa juga pakai Vercel CLI. |
| `.env.local` | Berisi semua secret (jangan di-commit). |

Pastikan build lokal lulus lebih dulu:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

---

# 3. Langkah 1 - Siapkan Supabase

## 3.1 Buat project

1. Buka https://supabase.com/dashboard.
2. **New project** -> pilih organisasi, nama, region terdekat, dan
   database password (simpan).
3. Tunggu project selesai di-provision.

## 3.2 Jalankan migrasi (WAJIB, berurutan)

Buka **SQL Editor** di dashboard Supabase, lalu jalankan isi file
berikut **satu per satu, sesuai urutan**:

| Urutan | File | Isi |
| --- | --- | --- |
| 1 | `supabase/migrations/0001_initial_schema.sql` | Tabel `memories`, `scrapbook_settings`, RLS. |
| 2 | `supabase/migrations/0002_storage_bucket.sql` | Bucket privat `memories` (5 MB, JPEG/PNG/WebP). |
| 3 | `supabase/migrations/0003_memory_images.sql` | Tabel `memory_images` (multi-photo) + RLS. |

> Catatan: migrasi `0003` **harus** dijalankan sebelum fitur multi-photo
> dipakai. Tanpa tabel `memory_images`, upload foto tambahan akan gagal.

Alternatif dengan Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## 3.3 Verifikasi

Di **Table Editor** harus terlihat tabel:

-   `memories`
-   `memory_images`
-   `scrapbook_settings` (berisi 1 baris dengan `id = 1`)

Di **Storage** harus ada bucket `memories` dengan tanda **Private**.

---

# 4. Langkah 2 - Siapkan secret aplikasi

## 4.1 Ambil kredensial Supabase

Di **Project Settings -> API**:

-   **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL` (origin saja,
    `https://<ref>.supabase.co`, tanpa `/rest/v1`).
-   **Secret key** (`sb_secret_...`) -> `SUPABASE_SECRET_KEY`.
    (Jika project memakai key lama, gunakan `service_role`.)

> Jangan pernah memakai publishable/anon key untuk `SUPABASE_SECRET_KEY`.

## 4.2 Buat hash password bersama

```bash
npm run hash-password "password-bersama-kalian"
# -> SCRAPBOOK_PASSWORD_HASH=scrypt:<salt>:<hash>
```

Salin seluruh nilai (termasuk awalan `scrypt:`) ke env.

## 4.3 Buat session secret

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Salin hasilnya ke `SESSION_SECRET`.

## 4.4 (Opsional) Rate limiting persisten

Login rate limiting memakai Upstash jika tersedia. Isi
`UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` dari
https://console.upstash.com. Bila kosong, limiter in-memory dipakai
(cukup untuk pemakaian personal, kurang andal di serverless multi-instance).

---

# 5. Langkah 3 - Uji lokal

Buat `.env.local` dari contoh:

```bash
cp .env.example .env.local
```

Isi semua variabel:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
SCRAPBOOK_PASSWORD_HASH=scrypt:<salt>:<hash>
SESSION_SECRET=<random-64-char>
# opsional
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Jalankan:

```bash
npm run build
npm run start
```

Buka http://localhost:3000, masuk dengan password, lalu uji:

-   Tambah kenangan dengan beberapa foto.
-   Lihat galeri di halaman detail.
-   Ubah dan hapus kenangan.
-   Ubah pengaturan di `/settings`.

---

# 6. Langkah 4 - Push ke Git

Jika belum ada repository:

```bash
git init
git add .
git commit -m "chore: prepare Little Moments for deploy"
git branch -M main
git remote add origin <URL_REPOSITORY>
git push -u origin main
```

Pastikan `.env.local` **tidak** ikut ter-commit (sudah ada di `.gitignore`).

---

# 7. Langkah 5 - Deploy ke Vercel

## 7.1 Import project

1. Buka https://vercel.com/new.
2. Pilih repository Little Moments.
3. Framework terdeteksi otomatis sebagai **Next.js**. Biarkan default.

## 7.2 Environment Variables

Tambahkan di **Settings -> Environment Variables** (Production,
Preview, dan Development) sebelum deploy pertama:

| Name | Value | Rahasia |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Tidak |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | **Ya** |
| `SCRAPBOOK_PASSWORD_HASH` | `scrypt:<salt>:<hash>` | **Ya** |
| `SESSION_SECRET` | random 64 char | **Ya** |
| `UPSTASH_REDIS_REST_URL` | opsional | **Ya** |
| `UPSTASH_REDIS_REST_TOKEN` | opsional | **Ya** |

> Hanya variabel `NEXT_PUBLIC_*` yang boleh sampai ke browser. Saat
> menempel nilai, jangan tambahkan tanda kutip.

## 7.3 Deploy

Klik **Deploy**. Tunggu build selesai, lalu buka domain produksi
(`https://<project>.vercel.app`).

Alternatif memakai CLI:

```bash
npm i -g vercel
vercel login
vercel            # deploy preview
vercel --prod     # deploy production
```

---

# 8. Langkah 6 - Checklist setelah deploy

## Fungsional

-   [ ] Password gate tampil di `/`.
-   [ ] Password benar membuka `/memories`.
-   [ ] Tambah kenangan dengan 1 dan beberapa foto.
-   [ ] Galeri foto tambahan tampil di detail.
-   [ ] Edit: ganti cover, tambah foto, hapus foto.
-   [ ] Hapus kenangan menghapus semua fotonya.
-   [ ] Filter hari/bulan/tahun bekerja.
-   [ ] Pagination bekerja.
-   [ ] `/settings` menyimpan nama, tanggal, pesan pembuka.
-   [ ] Logout mengakhiri sesi.

## Keamanan

-   [ ] `/memories` tanpa sesi redirect ke `/`.
-   [ ] `/api/uploads/sign` tanpa sesi -> `401`.
-   [ ] `/api/images/[id]` dan `/api/memory-images/[id]` tanpa sesi -> `401`.
-   [ ] URL foto Supabase langsung tidak bisa diakses publik.
-   [ ] Cookie sesi `Secure`, `HttpOnly`, `SameSite`.
-   [ ] Percobaan login berulang dibatasi (`429`).
-   [ ] Tidak ada secret di bundle client (cek tab Network/Sources).

## Responsif

-   [ ] Ponsel (satu kolom).
-   [ ] Tablet (dua kolom).
-   [ ] Desktop (tiga kolom).

---

# 9. Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `401` saat membuka buku | `SESSION_SECRET` berubah / kosong | Isi `SESSION_SECRET`, login ulang. |
| Foto error `500` | `SUPABASE_SECRET_KEY` / URL salah | Pakai secret key + origin URL (tanpa `/rest/v1`). |
| Upload foto tambahan gagal | Migrasi `0003` belum dijalankan | Jalankan `0003_memory_images.sql`. |
| `401` di `/api/uploads/sign` | Sesi kedaluwarsa | Login ulang. |
| Build Vercel gagal: "supabaseUrl is required" | Env belum diisi saat build | Tambahkan env, lalu redeploy. |
| Timeline menampilkan error | Data/query bermasalah | Cek log Vercel; pastikan migrasi lengkap. |
| Password benar tapi ditolak | Hash tidak cocok | Regenerasi hash, tempel ulang, redeploy. |

Log build dan runtime ada di **Vercel -> Project -> Deployments -> Logs**.

---

# 10. Rotasi secret

Bila password atau secret bocor:

1. **Password**: `npm run hash-password "<password-baru>"`, tempel ke
   `SCRAPBOOK_PASSWORD_HASH`, redeploy.
2. **Session secret**: buat nilai baru, tempel ke `SESSION_SECRET`,
   redeploy (semua sesi lama otomatis berakhir).
3. **Supabase secret key**: rotate di dashboard Supabase, perbarui env
   Vercel, redeploy.

---

# 11. Backup

-   Database: aktifkan backup terjadwal Supabase (atau `pg_dump` berkala).
-   Storage: unduh/backup bucket `memories` secara terpisah.
-   Jangan hanya mem-backup database; file foto berada di Storage.

---

# 12. Rollback

-   Vercel: **Deployments** -> pilih deployment stabil sebelumnya ->
    **Promote to Production**.
-   Database: hindari rollback destruktif tanpa backup terbaru. Migrasi
    bersifat menambah (additive) sehingga aman untuk dibiarkan.

---

# 13. Referensi

-   Next.js: https://nextjs.org/docs/app
-   Supabase Auth/database: https://supabase.com/docs
-   Supabase Storage: https://supabase.com/docs/guides/storage
-   Vercel deployments: https://vercel.com/docs/deployments/git
