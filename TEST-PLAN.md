# Little Moments - Test Plan

Version: 1.1\
Status: Draft Testing Specification

# 1. Overview

Dokumen ini menjelaskan strategi pengujian untuk aplikasi Little
Moments.

Tujuan testing:

-   Memastikan seluruh fitur MVP berjalan sesuai requirement.
-   Memastikan keamanan data scrapbook privat.
-   Memastikan pengalaman pengguna konsisten.
-   Memastikan aplikasi siap deployment production.

Testing mengacu pada:

-   PRD.md
-   DESIGN.md
-   ARCHITECTURE.md
-   DATABASE.md
-   USER-FLOW.md
-   IMPLEMENTATION-PLAN.md

# 2. Testing Objectives

## Functional Quality

Memastikan:

-   User dapat mengakses scrapbook.
-   User dapat mengelola memory.
-   Filter berjalan benar.
-   Upload foto berhasil.

## Security Quality

Memastikan:

-   Data tidak dapat diakses publik.
-   Session berjalan aman.
-   Storage foto terlindungi.

## UI/UX Quality

Memastikan:

-   Responsive.
-   Design konsisten.
-   State aplikasi jelas.

## Performance Quality

Memastikan:

-   Loading cepat.
-   Query efisien.
-   Image handling optimal.

# 3. Testing Scope

## Included

MVP features:

-   Password gate.
-   Session management.
-   Timeline memory.
-   Create memory.
-   Read memory.
-   Update memory.
-   Delete memory.
-   Upload image.
-   Multi-photo per memory (cover + foto tambahan, maks 10).
-   Pengaturan scrapbook (nama, tanggal mulai, pesan pembuka).
-   Filtering.
-   Responsive UI.

## Excluded

Tidak termasuk MVP:

-   Multi user account.
-   Chat.
-   Social feature.
-   AI photo grouping.
-   Native mobile application.

# 4. Test Environment

## Development

Environment:

-   Local Next.js.
-   Local environment variables.
-   Development Supabase project.

## Production

Environment:

-   Vercel deployment.
-   Production Supabase.
-   HTTPS enabled.

# 5. Test Types

# 5.1 Functional Testing

## Authentication Testing

  -----------------------------------------------------------------------
  ID                      Test Case               Expected Result
  ----------------------- ----------------------- -----------------------
  AUTH-001                Login dengan password   User masuk scrapbook
                          benar                   

  AUTH-002                Login password salah    Error message tampil

  AUTH-003                Logout                  Session berakhir

  AUTH-004                Membuka halaman private Redirect ke password
                          tanpa session           gate
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Memory Testing

  ID        Test Case               Expected Result
  --------- ----------------------- ------------------------------------
  MEM-001   Membuka timeline        Memory tampil berdasarkan tanggal
  MEM-002   Membuka detail memory   Detail lengkap tampil
  MEM-003   Membuat memory baru     Data tersimpan
  MEM-004   Edit memory             Data berubah sesuai input
  MEM-005   Delete memory           Memory terhapus setelah konfirmasi
  MEM-006   Membuat memory dengan   Cover = foto pertama, foto tambahan
            beberapa foto           masuk memory_images
  MEM-007   Galeri di detail        Foto tambahan tampil di bawah cerita
  MEM-008   Edit foto tambahan      Tambah/hapus foto tersimpan benar
  MEM-009   Delete memory berfoto   Semua foto ikut terhapus

------------------------------------------------------------------------

# Settings Testing

  ID        Test Case                 Expected Result
  --------- ------------------------- ------------------------------
  SET-001   Buka /settings            Form terisi nilai saat ini
  SET-002   Simpan nama pasangan      Header diperbarui
  SET-003   Simpan tanggal mulai      Penghitung "bersama selama" naik
  SET-004   Simpan pesan pembuka      Pesan tampil di header
  SET-005   Nama kosong               Ditolak dengan pesan validasi
  SET-006   Tanggal kosong            Disimpan sebagai null

------------------------------------------------------------------------

# Upload Testing

  ID       Test Case                             Expected Result
  -------- ------------------------------------- -----------------------
  UP-001   Upload gambar valid                   Foto tersimpan
  UP-002   Upload file bukan gambar              Ditolak
  UP-003   Upload file terlalu besar             Ditolak
  UP-004   Upload gagal setelah database gagal   Cleanup file berjalan
  UP-005   Upload lebih dari 10 foto             Ditolak / dibatasi 10
  UP-006   Upload foto tambahan                   File + baris tersimpan

------------------------------------------------------------------------

# Filter Testing

  ID        Test Case      Expected Result
  --------- -------------- --------------------------------
  FIL-001   Filter All     Semua memory tampil
  FIL-002   Filter Day     Memory tanggal tertentu tampil
  FIL-003   Filter Month   Memory bulan tertentu tampil
  FIL-004   Filter Year    Memory tahun tertentu tampil

# 6. Security Testing

# Authentication Security

Checklist:

-   Password tidak muncul pada client bundle.
-   Password tidak tersimpan plaintext.
-   Session menggunakan secure cookie.
-   Token tidak berada di localStorage.
-   Session expired ditangani.

# Database Security

Checklist:

-   RLS aktif.
-   Tidak ada public unrestricted policy.
-   Query dilakukan melalui server.
-   Secret key tidak terekspos.

# Storage Security

Checklist:

-   Bucket bersifat private.
-   Foto tidak dapat diakses langsung.
-   Signed URL memiliki expiration.
-   Path file tidak dapat dimanipulasi user.

# Input Security

Test:

-   Empty input.
-   Invalid date.
-   Invalid file.
-   Malicious input.

Expected:

Input ditolak dengan aman.

# 7. UI/UX Testing

# Responsive Testing

Device:

-   Mobile phone.
-   Tablet.
-   Desktop.

Check:

-   Layout tidak overflow.
-   Foto tampil baik.
-   Form mudah digunakan.
-   Button dapat ditekan.

# Component State Testing

Setiap komponen harus diuji:

## Default State

Tampilan normal.

## Loading State

Skeleton atau loading indicator muncul.

## Empty State

Pesan informatif tampil.

## Error State

Pesan error tampil.

## Success State

Feedback berhasil tampil.

# 8. Performance Testing

Check:

-   Initial page load.
-   Image loading.
-   Timeline rendering.
-   Database query.

Optimization verification:

-   Pagination/infinite scroll.
-   Image optimization.
-   Database index.

# 9. Database Testing

Test:

## Schema

-   Table tersedia.
-   Column sesuai.
-   Constraint berjalan.

## CRUD

Create:

Data masuk.

Read:

Data dapat diambil.

Update:

Data berubah.

Delete:

Data terhapus.

# 10. API Testing

Endpoint:

  Endpoint                  Test
  ------------------------- ---------------------
  /api/auth/login           Validasi login
  /api/auth/logout          Session removal
  /api/uploads/sign         Upload permission
  /api/images/\[id\]        Secure cover access
  /api/memory-images/\[id\] Secure extra photo access

# 11. Error Scenario Testing

Test kondisi:

-   Database unavailable.
-   Storage unavailable.
-   Invalid session.
-   Upload interrupted.
-   Network failure.

Expected:

-   Error ditampilkan.
-   Tidak membocorkan informasi internal.
-   User dapat mencoba kembali.

# 12. Regression Testing

Dilakukan setelah perubahan besar.

Checklist:

-   Login masih berjalan.
-   CRUD memory masih berjalan.
-   Filter masih akurat.
-   Foto masih aman.
-   UI tidak rusak.

# 13. User Acceptance Testing

Scenario:

## Scenario 1

User membuka scrapbook.

Expected:

Password gate tampil.

## Scenario 2

User menambah kenangan.

Expected:

Foto dan cerita tersimpan.

## Scenario 3

User mencari kenangan lama.

Expected:

Filter menemukan data sesuai tanggal.

## Scenario 4

User membuka dari mobile.

Expected:

Layout nyaman digunakan.

## Scenario 5

User menambahkan beberapa foto ke satu kenangan.

Expected:

Cover tampil di linimasa, foto lain tampil di galeri detail.

## Scenario 6

User mengubah pengaturan scrapbook.

Expected:

Nama, tanggal, dan pesan pembuka diperbarui di header.

# 14. Bug Severity

## Critical

Contoh:

-   Data bocor.
-   Foto publik.
-   Tidak bisa login.

## High

Contoh:

-   CRUD gagal.
-   Upload rusak.

## Medium

Contoh:

-   UI issue.
-   Minor validation issue.

## Low

Contoh:

-   Animation issue.
-   Cosmetic problem.

# 15. Definition of Test Completion

Testing selesai apabila:

-   Semua critical test berhasil.
-   Security checklist terpenuhi.
-   Tidak ada bug high severity.
-   Responsive testing selesai.
-   Production deployment berhasil diuji.

# 16. Final Quality Standard

Little Moments dianggap siap production apabila:

    Feature works

    +

    Data is secure

    +

    UI is consistent

    +

    Performance acceptable

    +

    User experience feels personal
