# Little Moments - Database Specification

Version: 1.1\
Status: Draft Database Design

# 1. Database Overview

Little Moments menggunakan database relational PostgreSQL melalui
Supabase.

Database bertanggung jawab menyimpan:

-   Metadata kenangan.
-   Konfigurasi scrapbook.
-   Referensi file foto pada Storage.
-   Data pendukung aplikasi.

Prinsip desain:

-   Data terstruktur.
-   Mudah di-query berdasarkan tanggal.
-   Aman untuk data privat.
-   Mendukung pengembangan fitur berikutnya.

# 2. Database Technology

Database:

    Supabase PostgreSQL

Storage:

    Supabase Storage

ORM / Access Layer:

    Supabase Client
    Server-side database access

# 3. Entity Relationship Diagram

    +-------------------------+

    | scrapbook_settings      |

    +-------------------------+

    | id                      |

    | couple_name             |

    | relationship_start_date |

    | intro_message           |

    +-------------------------+



    +-------------------------+

    | memories                |

    +-------------------------+

    | id                      |

    | title                   |

    | description             |

    | memory_date             |

    | location                |

    | image_path              |

    | created_at              |

    | updated_at              |

    +-------------------------+


              |

              |

              |

              v


    +-------------------------+

    | memory_images           |

    +-------------------------+

    | id                      |

    | memory_id               |

    | image_path              |

    | position                |

    | created_at              |

    +-------------------------+

              |

              |

              |

              v

    +-------------------------+

    | Supabase Storage        |

    +-------------------------+

    | memory photos           |

    +-------------------------+

# 4. Database Tables

# 4.1 Table: memories

## Purpose

Menyimpan seluruh data kenangan pasangan.

## Schema

  Column        Type          Required   Description
  ------------- ------------- ---------- -------------------
  id            UUID          Yes        Primary key
  title         TEXT          Yes        Judul kenangan
  description   TEXT          No         Cerita/deskripsi
  memory_date   DATE          Yes        Tanggal kejadian
  location      TEXT          No         Lokasi kejadian
  image_path    TEXT          Yes        Path foto Storage
  created_at    TIMESTAMPTZ   Yes        Waktu dibuat
  updated_at    TIMESTAMPTZ   Yes        Waktu diperbarui

## Rules

id:

-   UUID.
-   Generated otomatis.

title:

-   Tidak boleh kosong.

description:

-   Default string kosong.

memory_date:

-   Menggunakan tanggal kejadian.
-   Bukan tanggal upload.

image_path:

-   Menyimpan path internal Storage.
-   Tidak menyimpan signed URL.

created_at:

-   Default now().

updated_at:

-   Diperbarui setiap perubahan data.

------------------------------------------------------------------------

# 4.2 Table: scrapbook_settings

## Purpose

Menyimpan konfigurasi utama scrapbook.

## Schema

  Column                    Type          Required   Description
  ------------------------- ------------- ---------- ------------------------
  id                        INTEGER       Yes        Primary key
  couple_name               TEXT          Yes        Nama scrapbook
  relationship_start_date   DATE          No         Tanggal mulai hubungan
  intro_message             TEXT          Yes        Pesan pembuka
  created_at                TIMESTAMPTZ   Yes        Waktu dibuat
  updated_at                TIMESTAMPTZ   Yes        Waktu diperbarui

## Rules

id:

-   Nilai tetap 1.
-   Hanya ada satu konfigurasi scrapbook.

------------------------------------------------------------------------

# 4.3 Table: memory_images

## Purpose

Menyimpan foto tambahan untuk satu kenangan (multi-photo). Foto utama
tetap berada di `memories.image_path` sebagai cover, sehingga query
timeline tetap cepat dan kompatibel ke belakang.

## Schema

  Column       Type          Required   Description
  ------------ ------------- ---------- ---------------------------
  id           UUID          Yes        Primary key
  memory_id    UUID          Yes        Foreign key -> memories.id
  image_path   TEXT          Yes        Path foto Storage
  position     INTEGER       Yes        Urutan di galeri (mulai 0)
  created_at   TIMESTAMPTZ   Yes        Waktu dibuat

## Rules

id:

-   UUID, generated otomatis.

memory_id:

-   Foreign key ke `memories.id`.
-   `ON DELETE CASCADE`: menghapus kenangan menghapus semua foto
    tambahannya.

image_path:

-   Menyimpan path internal Storage.
-   Tidak menyimpan signed URL.

position:

-   Menentukan urutan tampil di galeri detail.
-   Default 0.

-----------------------------------------------------------------------

# 5. Index Design

## memories_date_idx

Purpose:

Mempercepat query timeline dan filter tanggal.

Index:

    memory_date DESC

Digunakan untuk:

-   Timeline terbaru.
-   Filter tahun.
-   Filter bulan.
-   Filter hari.

## memory_images_memory_id_idx

Purpose:

Mempercepat pengambilan foto tambahan satu kenangan dan menjaga urutan
galeri.

Index:

    (memory_id, position)

# 6. Data Relationship

## Current MVP

    scrapbook_settings

            1

            |

            |

            N

    memories

Satu scrapbook memiliki banyak memory.

Multiple photo:

    memories

        1

        |

        |

        N

    memory_images

Satu memory memiliki satu cover (`memories.image_path`) dan nol atau
lebih foto tambahan (`memory_images`).

# 7. Storage Database Relationship

Database:

    memories.image_path

Storage:

    memories bucket

Contoh:

Database:

    image_path:

    2026/a8f8-image.webp

Storage:

    memories/

       2026/

          a8f8-image.webp

# 8. SQL Schema

``` sql
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

on public.memories(memory_date desc);



create table public.memory_images (

    id uuid primary key default gen_random_uuid(),

    memory_id uuid not null references public.memories(id) on delete cascade,

    image_path text not null,

    position integer not null default 0,

    created_at timestamptz not null default now()

);



create index memory_images_memory_id_idx

on public.memory_images(memory_id, position);



create table public.scrapbook_settings (

    id integer primary key default 1,

    couple_name text not null default 'Little Moments',

    relationship_start_date date,

    intro_message text not null default 'A little book of us',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint single_settings_row check(id = 1)

);



alter table public.memories enable row level security;

alter table public.memory_images enable row level security;

alter table public.scrapbook_settings enable row level security;


insert into public.scrapbook_settings(id)

values(1)

on conflict(id)

do nothing;
```

# 9. Security Design

## Row Level Security

Semua tabel harus:

    ENABLE ROW LEVEL SECURITY

Tidak menggunakan:

    Public read access

Akses diberikan melalui:

-   Server validation.
-   Application session.

# 10. Storage Security

Bucket:

    memories

Configuration:

    Private

Rules:

-   Tidak dapat diakses langsung publik.
-   Menggunakan signed URL.
-   URL memiliki masa berlaku terbatas.

# 11. File Naming Strategy

Format:

    UUID.extension

Contoh:

    550e8400-e29b.webp

Keuntungan:

-   Menghindari collision.
-   Tidak membocorkan informasi file.

# 12. Validation Rules

## Memory

title:

    min length > 0

image:

Allowed:

-   JPEG
-   PNG
-   WebP

Validation:

-   File size limit.
-   MIME validation.
-   Content validation.

photos:

-   Maksimal 10 foto per kenangan (cover + foto tambahan).

# 13. CRUD Operations

## Create Memory

Input:

    title
    description
    memory_date
    location
    photos (1-10, foto pertama menjadi cover)

Process:

1.  Validate input.
2.  Upload photos.
3.  Save metadata + cover.
4.  Save foto tambahan ke memory_images.
5.  Return memory.

------------------------------------------------------------------------

## Read Memory

Query:

    ORDER BY memory_date DESC

------------------------------------------------------------------------

## Update Memory

Update:

-   title
-   description
-   date
-   location
-   image

Jika image berubah:

1.  Upload baru.
2.  Update database.
3.  Delete file lama.

------------------------------------------------------------------------

## Delete Memory

Process:

1.  Validate ID.
2.  Delete database record.
3.  Delete Storage file.

# 14. Query Examples

## Latest Memories

``` sql
select *

from memories

order by memory_date desc;
```

## Filter Year

``` sql
select *

from memories

where memory_date >= '2026-01-01'

and memory_date < '2027-01-01';
```

## Filter Month

``` sql
select *

from memories

where memory_date >= '2026-10-01'

and memory_date < '2026-11-01';
```

# 15. Future Database Extension

## Multi Photo (implemented)

Multi-photo sudah diimplementasikan melalui tabel `memory_images`
(migration `0003_memory_images.sql`). Foto utama tetap sebagai cover di
`memories.image_path`.

## Ide lanjutan

-   Full text search judul dan cerita.
-   Kategori atau tag kenangan.
-   Export dan backup yang lebih praktis.
-   Tabel `users` bila kelak memerlukan lebih dari satu akun.

# 16. Backup Strategy

Database:

-   Backup PostgreSQL.

Storage:

-   Backup file foto terpisah.

Jangan hanya melakukan backup database karena file gambar berada di
Storage.

# 17. Database Summary

Database Little Moments menggunakan desain sederhana dengan tiga tabel
utama:

1.  memories
2.  memory_images
3.  scrapbook_settings

Fokus desain:

-   Private scrapbook.
-   Efficient timeline query.
-   Secure image storage.
-   Multi photo per kenangan.
-   Easy future expansion.
