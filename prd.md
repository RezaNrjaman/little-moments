# PRD - Little Moments: Couple Scrapbook

**Versi:** 1.1  
**Status:** Draft perencanaan  
**Platform:** Website responsif  
**Stack utama:** Next.js App Router, TypeScript, Supabase, Vercel

---

## 1. Ringkasan Produk

**Little Moments** adalah website scrapbook digital privat untuk menyimpan perjalanan hubungan pasangan dalam bentuk timeline kenangan. Pengguna dapat mengunggah foto, menambahkan judul dan cerita, mengelola kenangan dengan CRUD, serta memfilter kenangan berdasarkan tanggal, bulan, atau tahun.

Website menggunakan desain **cute playful**: warna pastel, kartu foto bergaya polaroid, stiker, doodle, bentuk membulat, dan animasi ringan. Akses MVP menggunakan satu halaman rahasia dengan password bersama dan satu akun pengelola.

## 2. Latar Belakang

Foto dan cerita pasangan sering tersebar di galeri ponsel, aplikasi chat, dan media sosial. Little Moments menyatukan kenangan tersebut dalam satu jurnal digital yang mudah dibuka, ditelusuri, dan dirawat.

Produk ini bukan media sosial. Fokusnya adalah pengalaman personal, privasi, dan dokumentasi perjalanan hubungan.

## 3. Tujuan Produk

1. Menyimpan foto dan cerita kenangan di satu tempat.
2. Menyusun kenangan berdasarkan tanggal kejadian.
3. Memudahkan pencarian kenangan berdasarkan hari, bulan, dan tahun.
4. Memberikan pengalaman scrapbook digital yang menyenangkan dan personal.
5. Melindungi foto dan metadata dari akses publik yang tidak diizinkan.
6. Menyediakan fondasi yang mudah dikembangkan setelah MVP selesai.

## 4. Target Pengguna

- **Pengelola:** satu orang yang memiliki dan mengelola scrapbook.
- **Pengakses:** orang yang mengetahui password bersama.
- **Perangkat:** ponsel, tablet, dan desktop.
- **Bahasa utama:** Bahasa Indonesia.
- **Koneksi:** internet diperlukan untuk mengakses website dan foto.

> Password bersama memberikan akses kepada siapa pun yang mengetahuinya. Pendekatan ini sesuai untuk proyek personal, tetapi tidak memberikan identitas dan hak akses terpisah bagi setiap orang.

## 5. Ruang Lingkup MVP

### 5.1 Fitur wajib

- Halaman password gate.
- Sesi akses privat dan logout.
- Timeline kenangan.
- CRUD kenangan.
- Upload dan penyimpanan foto.
- Beberapa foto dalam satu kenangan (cover + foto tambahan, maksimal 10).
- Halaman pengaturan scrapbook (nama, tanggal jadian, pesan pembuka).
- Detail kenangan.
- Filter berdasarkan tanggal, bulan, dan tahun.
- Pengurutan kronologis.
- Desain responsif untuk ponsel dan desktop.
- Loading state, empty state, notifikasi, dan error state.
- Validasi input dan file.
- Pembatasan akses database dan Storage.
- Deployment ke Vercel.

### 5.2 Fitur opsional setelah MVP

- Fitur “On This Day” untuk kenangan dari tanggal yang sama pada tahun sebelumnya.
- Surat cinta digital.
- Musik latar opsional.
- Tema atau dekorasi scrapbook tambahan.
- Ekspor kenangan dan backup yang lebih praktis.
- Pencarian judul atau isi cerita.

### 5.3 Di luar cakupan MVP

- Chat pasangan.
- Komentar dan reaksi.
- Sistem pertemanan atau follower.
- Banyak pasangan atau multi-tenant.
- Aplikasi Android/iOS native.
- Pengelompokan foto menggunakan AI.
- Integrasi media sosial.

## 6. User Stories

1. Sebagai pemilik, saya ingin memasukkan password agar kenangan tidak langsung terbuka untuk pengunjung.
2. Sebagai pemilik, saya ingin menambahkan foto, judul, tanggal, dan cerita agar setiap momen terdokumentasi.
3. Sebagai pemilik, saya ingin melihat kenangan dalam timeline agar perjalanan hubungan mudah ditelusuri.
4. Sebagai pemilik, saya ingin memfilter berdasarkan tanggal, bulan, atau tahun agar dapat menemukan momen tertentu.
5. Sebagai pemilik, saya ingin mengedit informasi kenangan jika ada kesalahan.
6. Sebagai pemilik, saya ingin menghapus kenangan dengan konfirmasi agar tidak terhapus tanpa sengaja.
7. Sebagai pemilik, saya ingin membuka detail kenangan untuk melihat foto dan cerita dengan lebih nyaman.
8. Sebagai pemilik, saya ingin website nyaman digunakan di ponsel maupun desktop.

## 7. Persyaratan Fungsional

### FR-01: Password Gate

- Halaman awal menampilkan input password dan tombol untuk membuka scrapbook.
- Password diverifikasi di sisi server.
- Password salah menampilkan pesan yang jelas tanpa membocorkan informasi sensitif.
- Percobaan login dibatasi menggunakan rate limiting.
- Setelah verifikasi berhasil, server membuat sesi yang aman.
- Halaman privat dan operasi sensitif harus memvalidasi sesi di server.
- Pengguna dapat logout untuk mengakhiri sesi.

### FR-02: Timeline Kenangan

- Menampilkan kenangan berdasarkan `memory_date`.
- Default pengurutan: tanggal terbaru ke terlama; pengguna dapat memilih urutan bila fitur ini diimplementasikan.
- Setiap kartu menampilkan foto, judul, tanggal, dan cuplikan cerita.
- Klik kartu membuka halaman detail.
- Timeline mendukung pagination atau infinite scroll saat jumlah data meningkat.
- Tampilan kosong menyediakan ajakan untuk menambahkan kenangan.

### FR-03: Create Memory

Form minimal berisi:
- Foto (1 sampai 10; foto pertama menjadi cover, wajib minimal 1).
- Judul (wajib).
- Tanggal kejadian (wajib).
- Cerita/deskripsi (opsional).
- Lokasi (opsional).

Ketika disimpan:
- Validasi dilakukan di server.
- File diunggah ke bucket privat.
- Foto pertama disimpan sebagai cover di `memories.image_path`; foto tambahan disimpan di tabel `memory_images`.
- Metadata disimpan ke database.
- Jika penyimpanan metadata gagal setelah upload, sistem berusaha membersihkan file yang tidak terpakai.
- Pengguna mendapat notifikasi sukses atau gagal.

### FR-04: Read Memory

- Pengguna dapat membuka detail kenangan.
- Halaman menampilkan foto, judul, tanggal kejadian, cerita, dan lokasi jika tersedia.
- Foto tambahan ditampilkan dalam galeri di halaman detail.
- Foto privat hanya dapat ditampilkan melalui akses yang telah diotorisasi, misalnya signed URL berumur pendek.
- Path file internal disimpan di database, bukan signed URL yang kedaluwarsa.

### FR-05: Update Memory

- Form edit menampilkan data saat ini.
- Pengguna dapat mengubah judul, tanggal, cerita, dan lokasi.
- Pengguna dapat mengganti foto cover dan menambah atau menghapus foto tambahan.
- Validasi diterapkan kembali di server.
- Jika foto diganti atau dihapus, file lama dihapus setelah file baru dan perubahan database berhasil, dengan penanganan kegagalan yang sesuai.

### FR-06: Delete Memory

- Penghapusan harus meminta konfirmasi.
- Server memvalidasi sesi dan ID kenangan.
- Metadata dan file terkait dihapus dengan penanganan kegagalan yang konsisten.
- Sistem tidak boleh menghapus file berdasarkan path bebas yang dikirim pengguna.
- Jika sebagian proses gagal, tampilkan error yang dapat ditindaklanjuti dan sediakan mekanisme cleanup.

### FR-07: Filter Kenangan

Mode filter:
- **All:** seluruh kenangan.
- **Day:** satu tanggal tertentu.
- **Month:** seluruh kenangan dalam bulan dan tahun yang dipilih.
- **Year:** seluruh kenangan dalam tahun yang dipilih.

Aturan:
- Filter menggunakan tanggal kejadian (`memory_date`), bukan waktu upload.
- Filter diproses di query database, bukan hanya di browser.
- Filter bulan menggunakan rentang awal bulan sampai awal bulan berikutnya.
- Filter tahun menggunakan rentang 1 Januari sampai 1 Januari tahun berikutnya.
- URL query parameter dapat digunakan agar filter dapat dipertahankan saat refresh.

Contoh:
- `/memories?view=day&date=2026-10-10`
- `/memories?view=month&month=2026-10`
- `/memories?view=year&year=2026`

### FR-08: Pengaturan Scrapbook

MVP menyediakan satu konfigurasi scrapbook:
- Nama/judul scrapbook.
- Tanggal jadian.
- Pesan pembuka.

Pengaturan dapat diubah dari halaman `/settings`. Jika pengaturan belum diisi, website menggunakan nilai default yang dapat diubah.

## 8. Persyaratan Nonfungsional

### Keamanan dan privasi
- Password tidak boleh dikirim ke client bundle atau disimpan sebagai plaintext dalam konfigurasi produksi.
- Gunakan hash password yang sesuai dan perbandingan yang aman.
- Sesi menggunakan cookie `HttpOnly`, `Secure` di produksi, `SameSite=Strict` atau kebijakan setara yang sesuai, dan masa berlaku terbatas.
- Jangan menyimpan token sesi di `localStorage`.
- Setiap Server Action dan Route Handler yang sensitif wajib memvalidasi sesi.
- Gunakan secret key Supabase hanya di server; jangan pernah menaruhnya dalam variabel `NEXT_PUBLIC_*`.
- Aktifkan RLS pada tabel dan jangan membuat kebijakan publik yang membuka data.
- Bucket foto harus privat.
- Signed URL foto harus berumur pendek.
- Validasi tipe file, ukuran, dan isi gambar di server.
- Batasi percobaan password dengan rate limiting persisten yang sesuai untuk lingkungan serverless.
- Jangan mencatat password, session secret, atau signed URL di log.
- Gunakan HTTPS di produksi.
- Lindungi operasi perubahan data dari request lintas situs dengan pemeriksaan origin/CSRF yang sesuai.

### Kinerja
- Gunakan optimasi gambar dan format efisien seperti WebP jika sesuai.
- Hindari mengunduh semua foto sekaligus.
- Gunakan pagination/infinite scroll.
- Tambahkan indeks pada kolom tanggal.
- Gunakan ukuran thumbnail yang sesuai untuk kartu timeline.

### Aksesibilitas dan usability
- Kontras teks dan latar harus memadai.
- Form dapat digunakan dengan keyboard.
- Input memiliki label yang jelas.
- Tampilkan indikator loading dan status operasi.
- Hormati `prefers-reduced-motion`.
- Animasi tidak boleh menghambat akses ke fitur utama.

### Maintainability
- Gunakan TypeScript.
- Pisahkan UI, validasi, query, dan autentikasi.
- Gunakan migration SQL yang tersimpan di repository.
- Simpan konfigurasi rahasia di environment variables.

## 9. Desain UI/UX

### 9.1 Arah visual

**Gaya:** cute playful.

Palet awal:
- Vanilla Cream: `#FFF7F0`
- Candy Pink: `#FFB9CC`
- Soft Lavender: `#C9BCFF`
- Mint: `#BFE8D2`
- Butter Yellow: `#FFE39A`
- Warm Ink: `#5E4A50`

Tipografi:
- Heading: Fredoka atau Nunito.
- Body: Nunito Sans atau Inter.

Elemen visual:
- Kartu foto seperti polaroid.
- Stiker hati, bintang, pita, bunga, dan doodle.
- Sudut membulat dan bayangan lembut.
- Latar menyerupai kertas jurnal.
- Animasi hover dan transisi ringan.
- Desain mobile-first.

### 9.2 Halaman

1. `/` — Password Gate.
2. `/memories` — Timeline dan filter.
3. `/memories/new` — Tambah kenangan.
4. `/memories/[id]` — Detail kenangan.
5. `/memories/[id]/edit` — Edit kenangan.
6. `/settings` — Pengaturan scrapbook.

Route dalam grup `(private)` hanya pengelompokan Next.js; grup tersebut tidak menggantikan pemeriksaan autentikasi.

### 9.3 Komponen UI

- `PasswordGate`
- `ScrapbookHeader`
- `RelationshipCounter`
- `MemoryTimeline`
- `MemoryCard`
- `MemoryFilter`
- `MemoryForm`
- `PhotoPicker`
- `MemoryImagesEditor`
- `SettingsForm`
- `MemoryDetail`
- `DeleteMemoryDialog`
- `UploadPreview`
- `EmptyState`
- `LoadingState`
- `ToastNotifications`

## 10. Arsitektur Teknologi

### Frontend dan server
- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui untuk komponen dasar yang dikustomisasi.
- Server Components untuk data awal.
- Client Components untuk interaksi.
- Server Actions untuk operasi CRUD.
- Route Handlers untuk login, logout, dan operasi HTTP khusus.

### Data dan storage
- Supabase PostgreSQL.
- Supabase Storage dengan bucket privat.
- `@supabase/supabase-js`.
- Lapisan akses database server-only.

### Validasi dan utilitas
- Zod untuk validasi input.
- React Hook Form untuk form.
- `date-fns` untuk tanggal.
- `jose` untuk sesi bertanda tangan.
- `lucide-react` untuk ikon.
- Sonner untuk notifikasi.
- Upstash Redis atau layanan sejenis jika dibutuhkan untuk rate limiting persisten.

### Deployment
- GitHub untuk version control.
- Vercel untuk hosting dan deployment.
- Supabase untuk layanan database dan storage.

Backend terpisah seperti Express atau Go tidak diperlukan untuk MVP.

## 11. Arsitektur Aplikasi

Alur request:
1. Browser membuka halaman password.
2. Browser mengirim password melalui HTTPS ke endpoint server.
3. Server memverifikasi hash password.
4. Server membuat sesi bertanda tangan dan menyimpan token sesi dalam cookie aman.
5. Setiap halaman privat dan operasi sensitif memvalidasi sesi di sisi server.
6. Server melakukan query database atau operasi Storage.
7. Foto ditampilkan melalui signed URL berumur pendek atau endpoint gambar yang memeriksa sesi.

Prinsip utama:
- Jangan mengandalkan middleware atau UI saja untuk keamanan.
- Setiap Server Action dan Route Handler sensitif harus melakukan pemeriksaan sesi sendiri.
- Kredensial administratif Supabase hanya digunakan di server.
- RLS tetap aktif dan tidak memiliki kebijakan publik yang membuka data.
- Validasi input dan kepemilikan path dilakukan di server.

## 12. Desain Database

### Tabel `memories`

| Kolom | Tipe | Ketentuan |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `title` | TEXT | Wajib |
| `description` | TEXT | Wajib, default string kosong |
| `memory_date` | DATE | Wajib |
| `location` | TEXT | Opsional |
| `image_path` | TEXT | Wajib; path internal Storage |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |

Indeks:
- `memories_date_idx` pada `memory_date DESC`.

### Tabel `scrapbook_settings`

| Kolom | Tipe | Ketentuan |
|---|---|---|
| `id` | INTEGER | Primary key, nilai tetap `1` untuk satu scrapbook |
| `couple_name` | TEXT | Nama scrapbook |
| `relationship_start_date` | DATE | Opsional |
| `intro_message` | TEXT | Pesan pembuka |
| `created_at` | TIMESTAMPTZ | Default `now()` |
| `updated_at` | TIMESTAMPTZ | Default `now()` |

### Tabel `memory_images`

Foto tambahan milik satu kenangan (multi-photo). Cover tetap di `memories.image_path`.

| Kolom | Tipe | Ketentuan |
|---|---|---|
| `id` | UUID | Primary key, default `gen_random_uuid()` |
| `memory_id` | UUID | Foreign key ke `memories.id`, `ON DELETE CASCADE` |
| `image_path` | TEXT | Wajib; path internal Storage |
| `position` | INTEGER | Urutan galeri, default `0` |
| `created_at` | TIMESTAMPTZ | Default `now()` |

Indeks:

- `memory_images_memory_id_idx` pada `(memory_id, position)`.

### Contoh SQL awal

```sql
create extension if not exists pgcrypto;

create table public.memories (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null default '',
    memory_date date not null,
    location text,
    image_path text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index memories_date_idx
    on public.memories (memory_date desc);

create table public.memory_images (
    id uuid primary key default gen_random_uuid(),
    memory_id uuid not null references public.memories (id) on delete cascade,
    image_path text not null,
    position integer not null default 0,
    created_at timestamptz not null default now()
);

create index memory_images_memory_id_idx
    on public.memory_images (memory_id, position);

create table public.scrapbook_settings (
    id integer primary key default 1 check (id = 1),
    couple_name text not null default 'Little Moments',
    relationship_start_date date,
    intro_message text not null default 'A little book of us',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.memories enable row level security;
alter table public.memory_images enable row level security;
alter table public.scrapbook_settings enable row level security;

insert into public.scrapbook_settings (id)
values (1)
on conflict (id) do nothing;
```

Catatan: SQL di atas merupakan fondasi awal. Tambahkan trigger `updated_at`, kebijakan akses yang sesuai, serta migration lanjutan sebelum produksi. Jika operasi menggunakan secret/service role, jangan mengekspos key tersebut dan jangan mengandalkan RLS sebagai satu-satunya pemeriksaan sesi aplikasi.

## 13. Strategi Penyimpanan Foto

- Buat bucket Supabase Storage bernama `memories`.
- Atur bucket sebagai privat.
- Gunakan nama file acak, misalnya UUID dengan ekstensi hasil validasi.
- Simpan path file di `memories.image_path`.
- Jangan simpan signed URL yang kedaluwarsa sebagai data permanen.
- Buat signed upload URL dengan masa berlaku terbatas jika upload dilakukan langsung dari browser.
- Batasi ukuran dan tipe file.
- Periksa isi file di server dan jangan hanya mempercayai ekstensi atau `Content-Type`.
- Hapus file lama setelah penggantian foto berhasil.
- Jika operasi database gagal setelah upload, lakukan cleanup untuk mencegah file yatim.
- Siapkan backup foto secara terpisah dari backup database.

## 14. Kontrak Operasi

### Route Handlers

| Endpoint | Metode | Kegunaan |
|---|---|---|
| `/api/auth/login` | POST | Verifikasi password dan membuat sesi |
| `/api/auth/logout` | POST | Mengakhiri sesi |
| `/api/uploads/sign` | POST | Membuat izin upload terbatas |
| `/api/images/[id]` | GET | Memeriksa sesi dan memberi akses foto cover yang sah |
| `/api/memory-images/[id]` | GET | Memeriksa sesi dan memberi akses foto tambahan yang sah |

### Server Actions

- `createMemory`
- `updateMemory`
- `deleteMemory`
- `updateScrapbookSettings`

Setiap operasi harus:
1. Memvalidasi sesi.
2. Memvalidasi input dengan Zod.
3. Memvalidasi path file dan ID.
4. Menjalankan operasi server.
5. Menangani error.
6. Memperbarui atau menginvalidasi cache/halaman yang terkait.

### Contoh tipe input

```ts
type MemoryImageUpload = {
  imagePath: string;
  uploadTicket: string;
};

type CreateMemoryInput = {
  title: string;
  description: string;
  memoryDate: string; // YYYY-MM-DD
  location?: string;
  images: MemoryImageUpload[]; // foto pertama menjadi cover
};
```

`imagePath` tidak boleh diterima sebagai path bebas tanpa pemeriksaan bahwa path tersebut dibuat atau diotorisasi untuk operasi pengguna yang sedang berlangsung (upload ticket).

## 15. Struktur Folder

```text
little-moments/
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   ├── (private)/
│   │   │   ├── layout.tsx
│   │   │   ├── memories/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── uploads/sign/route.ts
│   │       ├── images/[id]/route.ts
│   │       └── memory-images/[id]/route.ts
│   ├── components/
│   │   ├── scrapbook/
│   │   ├── forms/
│   │   ├── auth/
│   │   └── ui/
│   ├── features/
│   │   ├── memories/
│   │   │   ├── actions.ts
│   │   │   ├── schemas.ts
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   └── settings/
│   │       ├── actions.ts
│   │       ├── schemas.ts
│   │       ├── queries.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── supabase/admin.ts
│   │   ├── supabase/image-response.ts
│   │   ├── auth/session.ts
│   │   ├── auth/password.ts
│   │   ├── security/rate-limit.ts
│   │   ├── dates.ts
│   │   └── utils.ts
│   └── config/site.ts
├── supabase/
│   └── migrations/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 16. Environment Variables

File `.env.local` untuk development:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SECRET_KEY=
SCRAPBOOK_PASSWORD_HASH=
SESSION_SECRET=
```

Ketentuan:
- `NEXT_PUBLIC_SUPABASE_URL`: URL proyek Supabase.
- `SUPABASE_SECRET_KEY`: secret key Supabase yang hanya digunakan di server. Pada proyek dengan format key lama, `service_role` hanya boleh digunakan di server.
- `SCRAPBOOK_PASSWORD_HASH`: hash password bersama.
- `SESSION_SECRET`: secret acak dengan entropi tinggi untuk sesi.

Jangan commit `.env.local` ke Git. Jangan menaruh secret key, hash password, atau session secret pada variabel `NEXT_PUBLIC_*`. Buat `.env.example` hanya dengan nama variabel dan nilai kosong.

## 17. Rencana Testing

### Fungsional
- Login berhasil dengan password yang benar.
- Password salah ditolak.
- Logout mengakhiri sesi.
- CRUD kenangan berjalan.
- Upload, ganti, dan hapus foto ditangani dengan benar.
- Filter day, month, year menghasilkan hasil yang tepat.
- Detail kenangan menampilkan informasi sesuai database.
- Empty state muncul saat tidak ada hasil.

### Keamanan
- Halaman privat tidak dapat dibuka tanpa sesi.
- Server Actions tidak dapat dipanggil tanpa sesi.
- Route Handlers sensitif memvalidasi sesi.
- Foto tidak bisa diakses secara publik.
- Signed URL kedaluwarsa sesuai konfigurasi.
- File terlalu besar atau format yang tidak diizinkan ditolak.
- Input berbahaya divalidasi dan tidak dieksekusi sebagai HTML.
- Percobaan password dibatasi.
- Secret tidak muncul dalam client bundle atau log.
- Request lintas situs untuk operasi sensitif ditangani dengan pemeriksaan yang sesuai.

### Responsif dan aksesibilitas
- Uji lebar layar ponsel, tablet, dan desktop.
- Form dapat digunakan dengan keyboard.
- Label input terbaca.
- Kontras warna memadai.
- Animasi menghormati `prefers-reduced-motion`.
- Timeline tidak menyebabkan horizontal overflow.

### Produksi
- Environment variables Vercel benar.
- Login, CRUD, filter, dan foto berfungsi pada URL produksi.
- Error log tidak membocorkan informasi sensitif.
- Backup database dan foto memiliki prosedur yang jelas.

## 18. Tahapan Implementasi dan Estimasi

Estimasi untuk satu developer yang memahami dasar React/Next.js:

| Fase | Pekerjaan | Estimasi |
|---|---|---|
| 1 | Setup Next.js, TypeScript, Tailwind, repository | 0,5 hari |
| 2 | Design system dan UI dasar | 1–2 hari |
| 3 | Database, migration, dan Storage | 0,5–1 hari |
| 4 | Password gate, sesi, dan rate limiting | 1 hari |
| 5 | CRUD dan upload foto | 1–2 hari |
| 6 | Timeline dan filter tanggal | 1 hari |
| 7 | Testing, keamanan, dan responsivitas | 1 hari |
| 8 | Deployment dan verifikasi produksi | 0,5 hari |

**Total perkiraan: 6–10 hari kerja.** Ini merupakan estimasi perencanaan, bukan jaminan.

Urutan pengerjaan:
1. Bangun UI timeline dengan data dummy.
2. Hubungkan Supabase dan implementasikan CRUD.
3. Implementasikan password gate dan sesi.
4. Selesaikan filter tanggal, bulan, dan tahun.
5. Tambahkan animasi serta dekorasi.
6. Jalankan testing dan deploy.

## 19. Deployment ke Vercel

### Langkah 1: Buat proyek

```bash
npx create-next-app@latest little-moments
cd little-moments
```

Pilih TypeScript, App Router, Tailwind CSS, dan `src/` directory saat setup.

### Langkah 2: Pasang dependensi

```bash
npm install @supabase/supabase-js zod date-fns jose
npm install react-hook-form @hookform/resolvers sonner lucide-react
```

Inisialisasi shadcn/ui mengikuti dokumentasi resminya.

### Langkah 3: Siapkan Supabase

- Buat proyek Supabase.
- Jalankan migration SQL.
- Buat bucket privat `memories`.
- Konfigurasikan akses database dan Storage.
- Uji operasi dengan data contoh.

### Langkah 4: Push ke GitHub

```bash
git init
git add .
git commit -m "chore: initialize Little Moments scrapbook"
git branch -M main
git remote add origin <URL_REPOSITORY_GITHUB>
git push -u origin main
```

Ganti `<URL_REPOSITORY_GITHUB>` dengan URL repository milik proyek.

### Langkah 5: Deploy

1. Buka https://vercel.com/.
2. Impor repository GitHub.
3. Masukkan environment variables pada pengaturan proyek.
4. Deploy.
5. Uji semua fitur pada URL produksi.
6. Push perubahan berikutnya ke GitHub untuk memicu deployment otomatis.

Dokumentasi:
- Next.js App Router: https://nextjs.org/docs/app
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vercel Git deployments: https://vercel.com/docs/deployments/git

## 20. Biaya dan Operasional

MVP dapat dimulai dengan paket gratis yang tersedia selama penggunaan masih sesuai dengan kuota dan ketentuan masing-masing layanan.

Perhatikan:
- Kuota database, storage, bandwidth, dan deployment dapat berubah.
- Foto resolusi tinggi meningkatkan kebutuhan storage dan bandwidth.
- Gunakan optimasi gambar dan pagination.
- Pantau pemakaian Supabase dan Vercel.
- Jangan mengasumsikan layanan gratis selalu tersedia tanpa batas.
- Backup database dan file Storage secara terpisah.

## 21. Definition of Done

MVP dinyatakan selesai apabila:

- [ ] UI cute playful konsisten dan responsif.
- [ ] Password gate, sesi, dan logout berfungsi.
- [ ] Operasi sensitif memvalidasi sesi di server.
- [ ] CRUD kenangan berjalan dengan benar.
- [ ] Filter tanggal, bulan, dan tahun akurat.
- [ ] Foto disimpan dalam bucket privat.
- [ ] Pengunjung tanpa izin tidak dapat mengakses data atau foto.
- [ ] Validasi form, file, dan rate limiting aktif.
- [ ] Tidak ada secret yang masuk ke repository atau client bundle.
- [ ] Website berjalan pada Vercel production.
- [ ] Prosedur backup database dan foto ditetapkan.

## 22. Referensi Resmi

- Next.js: https://nextjs.org/docs/app
- Supabase: https://supabase.com/docs
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vercel: https://vercel.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
- Zod: https://zod.dev/
- date-fns: https://date-fns.org/
