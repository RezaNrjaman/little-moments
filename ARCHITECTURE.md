# Little Moments - Application Architecture Specification

Version: 1.1\
Status: Draft Architecture Specification

# 1. Architecture Overview

Little Moments adalah website scrapbook digital privat untuk menyimpan
perjalanan hubungan pasangan dalam bentuk timeline kenangan.

Arsitektur dirancang untuk:

-   Menjaga privasi foto dan metadata.
-   Mendukung CRUD memory.
-   Mudah dikembangkan setelah MVP.
-   Memisahkan UI, business logic, database access, dan security layer.

Platform:

-   Next.js App Router
-   TypeScript
-   Supabase PostgreSQL
-   Supabase Storage
-   Vercel Deployment

# 2. Architecture Goals

## Security First

Data scrapbook bersifat privat.

Prinsip:

-   Tidak ada akses publik langsung.
-   Foto menggunakan private bucket.
-   Operasi sensitif harus memvalidasi sesi di server.

## Maintainability

Kode harus memiliki pemisahan:

    UI Layer
    Business Logic
    Data Access Layer
    Infrastructure

## Scalability

Fondasi harus memungkinkan:

-   Multi photo memory (sudah tersedia)
-   Export memory
-   Additional themes
-   Additional scrapbook features

# 3. High Level Architecture

                        USER

                         |
                         |
                     Browser

                         |
                         |

                  Next.js Application

            +------------+-------------+
            |                          |
       Server Components        Client Components

            |                          |
            +------------+-------------+

                         |

                  Server Actions
                  Route Handlers

                         |

            +------------+-------------+

            |                          |

     Supabase Database          Supabase Storage

     PostgreSQL                 Private Bucket


                         |

                      Vercel

------------------------------------------------------------------------

# 4. Technology Stack

## Frontend

Technology:

-   Next.js App Router
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

Responsibilities:

-   Rendering UI
-   User interaction
-   Form handling
-   Client state

------------------------------------------------------------------------

## Backend Layer

Tidak menggunakan backend terpisah.

Next.js Server menjadi backend layer.

Responsibilities:

-   Authentication
-   Validation
-   CRUD operation
-   Database access
-   Storage access

------------------------------------------------------------------------

## Database

Supabase PostgreSQL.

Menyimpan:

-   Memory metadata
-   Scrapbook configuration

------------------------------------------------------------------------

## Storage

Supabase Storage.

Menyimpan:

-   Memory photos

Karakter:

-   Private bucket
-   Signed URL access

------------------------------------------------------------------------

# 5. Application Layers

# 5.1 Presentation Layer

Location:

    src/app
    src/components

Tanggung jawab:

-   Page rendering
-   UI components
-   User interaction

Contoh:

    MemoryCard
    MemoryTimeline
    MemoryForm
    PasswordGate

------------------------------------------------------------------------

# 5.2 Feature Layer

Location:

    src/features

Berisi domain logic.

Contoh:

    features/
    └── memories/
        ├── actions.ts
        ├── schemas.ts
        ├── queries.ts
        └── types.ts

Tanggung jawab:

-   Memory CRUD
-   Validation schema
-   Database query

------------------------------------------------------------------------

# 5.3 Infrastructure Layer

Location:

    src/lib

Berisi:

-   Supabase client
-   Session management
-   Security utility
-   Date utility

Contoh:

    lib/
    ├── supabase/
    ├── auth/
    ├── security/
    └── utils.ts

------------------------------------------------------------------------

# 6. Request Flow Architecture

## Login Flow

    User

     |
     |
    Enter Password

     |
     |
    POST /api/auth/login

     |
     |
    Server Verify Password Hash

     |
     |
    Create Signed Session

     |
     |
    Set Secure Cookie

     |
     |
    Redirect /memories

------------------------------------------------------------------------

# 7. Memory Creation Flow

    User

     |
     |
    Upload Image

     |
     |
    Validate File

     |
     |
    Upload Storage

     |
     |
    Get image path

     |
     |
    Validate Memory Data

     |
     |
    Insert Database

     |
     |
    Return Success

Jika database gagal:

    Database Failed

            |

    Cleanup Uploaded File

            |

    Return Error

Catatan multi-photo: foto pertama menjadi cover (`memories.image_path`),
foto berikutnya disimpan ke `memory_images`.

------------------------------------------------------------------------

# 8. Memory Read Flow

    Request Memory Page

            |

    Validate Session

            |

    Query Database

            |

    Generate Signed Image URL

            |

    Render Memory Card

Foto tidak menggunakan URL permanen.

# 9. Update Memory Flow

    User Edit

        |

    Validate Session

        |

    Validate Input

        |

    Upload New Image (optional)

        |

    Update Database

        |

    Delete Old Image

        |

    Refresh Cache

Catatan multi-photo: cover boleh diganti, foto tambahan boleh ditambah
atau dihapus. File lama dihapus setelah perubahan database berhasil.

------------------------------------------------------------------------

# 10. Delete Memory Flow

    User Confirm Delete

            |

    Validate Session

            |

    Validate Memory ID

            |

    Delete Database Record

            |

    Delete Storage File

            |

    Return Result

------------------------------------------------------------------------

# 11. Authentication Architecture

Authentication menggunakan:

-   Shared password
-   Server-side session

Flow:

    Password

       |

    Hash Comparison

       |

    Session Token

       |

    HttpOnly Cookie

       |

    Server Validation

Security rules:

-   Password tidak dikirim ke client bundle.
-   Tidak menyimpan token di localStorage.
-   Session memiliki expiration.
-   Semua operasi sensitif melakukan pengecekan session.

# 12. Database Architecture

## Entity Relationship

    scrapbook_settings

            |
            |
            |
            (single configuration)


    memories

            |
            |
            |
         image_path

            |
            |
            |
    Supabase Storage


    memories

            |
            |
            |
    memory_images (1 : N, foto tambahan, on delete cascade)

------------------------------------------------------------------------

# 13. Database Tables

## memories

Purpose:

Menyimpan data kenangan.

Fields:

  Field         Type
  ------------- -----------
  id            UUID
  title         TEXT
  description   TEXT
  memory_date   DATE
  location      TEXT
  image_path    TEXT
  created_at    TIMESTAMP
  updated_at    TIMESTAMP

------------------------------------------------------------------------

## memory_images

Purpose:

Menyimpan foto tambahan satu kenangan (multi-photo). Foto utama tetap
sebagai cover di `memories.image_path`.

Fields:

  Field         Type
  ------------- -----------
  id            UUID
  memory_id     UUID (FK -> memories.id, on delete cascade)
  image_path    TEXT
  position      INTEGER
  created_at    TIMESTAMP

------------------------------------------------------------------------

## scrapbook_settings

Purpose:

Konfigurasi scrapbook.

Fields:

  Field                     Type
  ------------------------- -----------
  id                        INTEGER
  couple_name               TEXT
  relationship_start_date   DATE
  intro_message             TEXT
  created_at                TIMESTAMP
  updated_at                TIMESTAMP

# 14. Storage Architecture

Bucket:

    memories

Structure:

    memories/

       uuid-image-1.webp

       uuid-image-2.webp

Rules:

-   Private bucket
-   Random filename
-   Validate image content
-   Signed URL temporary
-   Cover: `memories.image_path`
-   Foto tambahan: `memory_images.image_path`

# 15. API Architecture

## Route Handlers

  Endpoint                  Method   Purpose
  ------------------------- -------- -------------------------------
  /api/auth/login           POST     Login
  /api/auth/logout          POST     Logout
  /api/uploads/sign         POST     Upload permission
  /api/images/\[id\]        GET      Secure cover photo access
  /api/memory-images/\[id\] GET      Secure extra photo access

------------------------------------------------------------------------

## Server Actions

    createMemory()

    updateMemory()

    deleteMemory()

    updateScrapbookSettings()

Setiap action:

1.  Validate session
2.  Validate input
3.  Execute operation
4.  Handle error
5.  Update cache

# 16. Folder Architecture

    little-moments/

    src/

    ├── app/
    │
    ├── components/
    │
    ├── features/
    │   ├── memories/
    │   └── settings/
    │
    ├── lib/
    │   ├── auth/
    │   ├── supabase/
    │   └── security/
    │
    └── config/


    supabase/

    └── migrations/


    public/

    package.json

    .env.example

# 17. Deployment Architecture

    Developer

       |

    GitHub Repository

       |

    Vercel Build

       |

    Production Deployment


                 |

          Next.js Runtime


                 |

          Supabase Services

Environment variables:

    NEXT_PUBLIC_SUPABASE_URL

    SUPABASE_SECRET_KEY

    SCRAPBOOK_PASSWORD_HASH

    SESSION_SECRET

# 18. Security Architecture

Protection:

## Application

-   Server validation
-   Session checking
-   Rate limiting

## Database

-   Row Level Security
-   No public access policy

## Storage

-   Private bucket
-   Signed URL

## Network

-   HTTPS production
-   Secure cookies

# 19. Performance Architecture

Optimization:

-   Server Components untuk initial rendering.
-   Image optimization.
-   Pagination/infinite scroll.
-   Database index pada memory_date.
-   Thumbnail untuk timeline.

# 20. Future Extension Architecture

Architecture mendukung:

## Multiple Photos (implemented)

Tersedia melalui tabel `memory_images` (migration 0003) dan endpoint
`/api/memory-images/[id]`. Cover tetap di `memories.image_path`.

## Advanced Search

Tambah:

-   title index
-   full text search

## Multiple Users

Tambah:

-   users table
-   permission layer

# 21. Architecture Summary

Little Moments menggunakan arsitektur modern berbasis Next.js full-stack
dengan Supabase sebagai backend service.

Fokus utama:

Security

-   

Simple Maintenance

-   

Private Digital Scrapbook Experience

Prinsip utama:

    UI sederhana

    Business logic terpisah

    Security di server

    Data tetap privat
