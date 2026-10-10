# Little Moments - User Flow Specification

Version: 1.1\
Status: Draft User Flow

# 1. Overview

Dokumen ini menjelaskan alur interaksi pengguna pada aplikasi Little
Moments.

User Flow dibuat berdasarkan:

-   Product Requirement Document (PRD)
-   Design Specification
-   Application Architecture
-   Database Design

Fokus:

-   Perjalanan pengguna.
-   Navigasi antar halaman.
-   Interaksi utama.
-   Kondisi berhasil dan gagal.

# 2. User Roles

Little Moments memiliki dua tipe pengguna:

## 2.1 Pengelola

Hak akses:

-   Login menggunakan password.
-   Menambah memory.
-   Mengedit memory.
-   Menghapus memory.
-   Mengatur scrapbook.

## 2.2 Pengakses

Hak akses:

-   Membuka scrapbook menggunakan password bersama.
-   Melihat timeline.
-   Melihat detail memory.

# 3. Main User Journey

    Open Website

          |

    Password Gate

          |

    Authentication Success

          |

    Scrapbook Timeline

          |

    View Memory

          |

    Read Story

          |

    Create / Edit / Delete Memory

# 4. Entry Flow - Password Gate

## Goal

Memberikan akses privat sebelum membuka scrapbook.

Flow:

    User membuka website

            |

    Halaman Password Gate

            |

    Input password

            |

    Submit

            |

    Server melakukan validasi

            |

    +----------------+

    | Password benar |

    +----------------+

            |

    Masuk Timeline

Jika gagal:

    Password salah

            |

    Tampilkan error message

            |

    User mencoba kembali

Rules:

-   Password tidak dikirim ke client.
-   Session dibuat setelah berhasil.

# 5. Timeline Flow

## Goal

Melihat seluruh perjalanan hubungan.

Flow:

    Timeline Page

          |

    Load memories

          |

    Display Memory Cards

          |

    User memilih memory

          |

    Memory Detail Page

Memory Card menampilkan:

-   Foto.
-   Judul.
-   Tanggal.
-   Cuplikan cerita.

# 6. Filter Memory Flow

## Goal

Menemukan kenangan tertentu.

Flow:

    Timeline

       |

    Klik Filter

       |

    Pilih Mode

       |

    +-----------+
    | Day       |
    | Month     |
    | Year      |
    | All       |
    +-----------+

       |

    Database Query

       |

    Tampilkan hasil

Contoh:

    All

    ↓

    October 2026

    ↓

    10 October 2026

# 7. Create Memory Flow

## Goal

Menambahkan kenangan baru.

Flow:

    Timeline

        |

    Klik Add Memory

        |

    Memory Form

        |

    Upload Photo

        |

    Isi Data

        |

    Submit

        |

    Validation

        |

    Upload Image

        |

    Save Database

        |

    Success Notification

        |

    Return Timeline

Input:

-   Foto (1 sampai 10, foto pertama menjadi cover).
-   Judul.
-   Tanggal.
-   Cerita.
-   Lokasi.

Jika gagal:

    Validation Error

            |

    Show Error

            |

    User memperbaiki input

# 8. Upload Photo Flow

    Select Image

          |

    Validate File

          |

    Check Type

          |

    Check Size

          |

    Upload Storage

          |

    Generate Image Path

          |

    Save Reference

Error:

    Invalid File

          |

    Reject Upload

          |

    Show Message

# 9. Memory Detail Flow

## Goal

Membaca satu kenangan secara penuh.

Flow:

    Click Memory Card

            |

    Detail Page

            |

    Generate Secure Image URL

            |

    Display:

    - Photo
    - Title
    - Date
    - Location
    - Story
    - Foto lainnya (galeri) jika ada

Action tersedia:

-   Edit.
-   Delete.

# 10. Edit Memory Flow

Flow:

    Memory Detail

           |

    Click Edit

           |

    Edit Form

           |

    Modify Data

           |

    Submit

           |

    Validate

           |

    Update Database

           |

    Refresh Detail

Jika mengubah foto:

    Upload New Image (cover opsional)

            |

    Tambah / tandai hapus foto tambahan

            |

    Update Reference

            |

    Remove Old Image

    Cover dan foto tambahan yang dihapus dibersihkan dari Storage setelah
    perubahan database berhasil.

# 11. Delete Memory Flow

Flow:

    Memory Detail

            |

    Click Delete

            |

    Confirmation Dialog

            |

    Confirm

            |

    Validate Session

            |

    Delete Database Record

            |

    Delete Image

            |

    Success Message

Jika batal:

    Cancel

     |

    Return Detail Page

# 12. Logout Flow

Flow:

    User Menu

        |

    Logout

        |

    Destroy Session

        |

    Return Password Gate

# 12.1 Scrapbook Settings Flow

## Goal

Mengubah identitas dan pesan pembuka scrapbook.

Flow:

    Header (tombol "Pengaturan")

        |

    Halaman /settings

        |

    Ubah nama pasangan / tanggal mulai / pesan pembuka

        |

    Submit

        |

    Validasi di server

        |

    Simpan Database

        |

    Header dan halaman diperbarui

Catatan:

-   Tanggal mulai hubungan dipakai untuk penghitung "bersama selama".
-   Boleh dikosongkan.
-   Tombol "Pengaturan" hanya tampil di halaman privat.

# 13. Empty State Flow

Kondisi:

Belum ada memory.

Flow:

    Timeline

          |

    No Data Found

          |

    Show Empty State

          |

    User klik Add Memory

          |

    Create Memory Form

# 14. Error Handling Flow

## General Error

    Action

     |

    Error

     |

    Display Friendly Message

     |

    User Retry

Contoh:

-   Upload gagal.
-   Database gagal.
-   Session expired.

# 15. Session Expired Flow

    User membuka halaman private

            |

    Session Check

            |

    Session Invalid

            |

    Redirect Password Gate

# 16. Navigation Map

    /

    Password Gate

        |

        v


    /memories

    Timeline

        |

        +------------+

        |            |

        v            v


    /new        /[id]


    Create      Detail


                 |

                 |

                 v


              /edit


              Update


        +------------+

        |

        v


    /settings


    Atur nama, tanggal, pesan pembuka

# 17. Mobile User Flow

Mobile priority:

    Open

     |

    Login

     |

    Timeline Scroll

     |

    Tap Card

     |

    Read Memory

     |

    Floating Add Button

     |

    Create Memory

Navigasi dibuat minimal agar pengalaman seperti membuka scrapbook.

# 18. User Flow Summary

Core experience:

    Unlock

       ↓

    Discover

       ↓

    Remember

       ↓

    Create

       ↓

    Preserve

Little Moments bukan aplikasi sosial, tetapi ruang privat untuk
menyimpan cerita hubungan.

Prioritas:

-   Mudah dibuka.
-   Mudah ditemukan.
-   Mudah ditambahkan.
-   Aman disimpan.
