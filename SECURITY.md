# Little Moments - Security Specification

Version: 1.0

# 1. Security Overview

Little Moments merupakan scrapbook digital privat sehingga keamanan dan
privasi menjadi prioritas utama.

Security goals:

-   Melindungi foto pribadi.
-   Mencegah akses tanpa izin.
-   Menjaga credential aplikasi.
-   Memastikan operasi sensitif tervalidasi.

# 2. Security Principles

## Privacy First

Data scrapbook tidak boleh tersedia secara publik.

## Server Trust Boundary

Operasi sensitif harus dilakukan di server.

Client tidak boleh dipercaya untuk:

-   Authorization.
-   Database permission.
-   File permission.

## Least Privilege

Setiap akses hanya mendapatkan permission yang diperlukan.

# 3. Authentication Security

Authentication menggunakan:

-   Shared password.
-   Server-side session.

Rules:

-   Password disimpan dalam bentuk hash.
-   Password tidak dikirim ke client bundle.
-   Session menggunakan secure cookie.
-   Token tidak disimpan di localStorage.

Cookie requirement:

-   HttpOnly.
-   Secure pada production.
-   SameSite sesuai kebutuhan.
-   Expiration terbatas.

# 4. Session Security

Setiap halaman private wajib:

    Request

    ↓

    Validate Session

    ↓

    Allow Access

Jika session invalid:

    Redirect Password Gate

Operasi sensitif wajib melakukan validasi ulang.

# 5. Database Security

Database:

Supabase PostgreSQL

Security requirements:

-   Row Level Security aktif.
-   Tidak ada unrestricted public policy.
-   Query dilakukan melalui server layer.

Dilarang:

-   Mengekspos service role key.
-   Menggunakan secret pada client.

# 6. Storage Security

Photo storage:

    Supabase Storage

    Bucket:

    memories

Rules:

-   Bucket private.
-   Tidak ada public URL.
-   Menggunakan signed URL.
-   URL memiliki masa berlaku.

Database hanya menyimpan:

    memories.image_path        (cover)

    memory_images.image_path   (foto tambahan)

Tidak menyimpan:

    permanent image URL

# 7. File Upload Security

Sebelum upload:

Validation:

-   File extension.
-   MIME type.
-   File size.
-   Image content.

Allowed format:

-   JPEG.
-   PNG.
-   WebP.

Filename strategy:

    UUID.extension

Tujuan:

-   Mencegah collision.
-   Tidak membocorkan nama asli file.

# 8. Input Validation

Semua input user harus divalidasi.

Input:

-   Title.
-   Description.
-   Date.
-   Location.
-   File.

Gunakan:

-   Schema validation.
-   Server-side validation.

Tidak boleh:

-   Mempercayai input browser.

# 9. API Security

Sensitive endpoints:

    /api/auth/login

    /api/auth/logout

    /api/uploads/sign

    /api/images/[id]

    /api/memory-images/[id]

Setiap endpoint harus:

1.  Validate request.
2.  Validate session.
3.  Handle error.
4.  Avoid information leakage.

# 10. CSRF Protection

Operasi perubahan data harus memiliki perlindungan terhadap request
tidak sah.

Implementasi:

-   Origin checking.
-   Secure cookie policy.
-   Server validation.

# 11. Rate Limiting

Protection:

-   Login brute force.
-   Abuse request.

Target:

-   Password endpoint.
-   Sensitive operations.

# 12. Error Handling Security

Error message harus aman.

Contoh aman:

    Unable to process request.

Hindari:

    Database password incorrect.
    Internal service configuration failed.

Jangan mencatat:

-   Password.
-   Session secret.
-   Signed URL.
-   Secret key.

# 13. Environment Security

Secret variables:

    SUPABASE_SECRET_KEY

    SCRAPBOOK_PASSWORD_HASH

    SESSION_SECRET

Rules:

-   Tidak masuk Git.
-   Tidak menggunakan NEXT_PUBLIC.
-   Gunakan environment provider.

# 14. Dependency Security

Maintain:

-   Update dependency.
-   Audit package.
-   Remove unused package.

# 15. Security Testing Checklist

Authentication:

-   [ ] Password benar berhasil.
-   [ ] Password salah ditolak.
-   [ ] Session expired ditangani.

Database:

-   [ ] RLS aktif.
-   [ ] Tidak ada public access.

Storage:

-   [ ] Bucket private.
-   [ ] Signed URL bekerja.

Application:

-   [ ] Input tervalidasi.
-   [ ] Secret tidak bocor.
-   [ ] Error aman.

# 16. Incident Response

Jika terjadi masalah:

1.  Cabut credential yang bocor.
2.  Rotasi secret.
3.  Periksa access log.
4.  Perbaiki vulnerability.
5.  Deploy patch.

# 17. Security Summary

Little Moments menerapkan pendekatan:

    Private by default

    Server validated

    Minimal access

    Secure storage

    No exposed secrets
