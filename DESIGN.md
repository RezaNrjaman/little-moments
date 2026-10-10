# Little Moments - Design System & UI Specification

Version: 1.1\
Status: Draft Design Specification

## 1. Design Overview

Little Moments adalah scrapbook digital privat untuk menyimpan
perjalanan hubungan pasangan dalam bentuk timeline kenangan.

Design direction:

**Digital scrapbook meets cute journal**

Karakter visual: - Cute - Warm - Personal - Playful - Nostalgic

Tujuan desain: - Membuat pengguna merasa membuka album kenangan fisik. -
Menjadikan foto dan cerita sebagai fokus utama. - Memberikan pengalaman
personal dan sederhana.

------------------------------------------------------------------------

# 2. Design Principles

## 2.1 Emotional First

Prioritas tampilan:

1.  Foto
2.  Cerita
3.  Tanggal
4.  Dekorasi

Interface tidak boleh terasa seperti dashboard aplikasi.

## 2.2 Simple Interaction

Gunakan: - One-click action - Feedback visual - Navigasi sederhana

Hindari: - Menu kompleks - Konfigurasi berlebihan

## 2.3 Physical Scrapbook Feeling

Implementasi: - Paper texture background - Polaroid card - Sticker
decoration - Handwritten accent

------------------------------------------------------------------------

# 3. Visual Identity

## 3.1 Color Palette

  Nama            HEX       Penggunaan
  --------------- --------- ---------------------------
  Vanilla Cream   #FFF7F0   Background utama
  Candy Pink      #FFB9CC   Primary action, highlight
  Soft Lavender   #C9BCFF   Secondary action
  Mint            #BFE8D2   Success state
  Butter Yellow   #FFE39A   Sticker/highlight
  Warm Ink        #5E4A50   Text utama

------------------------------------------------------------------------

# 3.2 Typography

## Heading

Recommended: - Fredoka - Nunito

Digunakan untuk: - Judul scrapbook - Memory title - Section heading

## Body

Recommended: - Nunito Sans - Inter

Digunakan untuk: - Cerita - Metadata - Form

------------------------------------------------------------------------

# 4. Layout System

## Desktop

Maximum width: 1200px

Struktur:

    Header
    Relationship Info
    Filter
    Timeline
    Floating Add Button

## Mobile

Mobile-first.

Padding: 16px

Struktur:

    Header
    Counter
    Filter
    Memory Cards
    Floating Action Button

------------------------------------------------------------------------

# 5. Global Components

## Scrapbook Header

Menampilkan: - Nama scrapbook - Pesan pembuka - Dekorasi

Konsep:

    ♡ Little Moments

    Buku kecil kita berdua

    [ Pengaturan ]   [ Keluar ]

Style: - Rounded - Soft shadow - Center aligned

Catatan: tombol "Pengaturan" dan "Keluar" berada di kanan atas header dan
hanya tampil di halaman privat.

------------------------------------------------------------------------

## Relationship Counter

Menampilkan: - Lama hubungan - Tanggal mulai

Contoh:

    Bersama selama

    365 Hari ♡

    Sejak 10 Oktober 2025

------------------------------------------------------------------------

# 6. Memory Timeline

Timeline menjadi pengalaman utama.

Konsep:

    2026

       [ Photo ]

       First Vacation

       12 March 2026

       Our first trip...

Karakter: - Vertical journal timeline - Chronological storytelling -
Visual scanning mudah

------------------------------------------------------------------------

# 7. Memory Card

Komponen: MemoryCard

Isi: - Foto - Judul - Tanggal - Preview cerita

Style: - Polaroid card - Rounded corner - Soft shadow - Slight rotation

Image: - Aspect ratio 4:3 - Object cover

Interaksi: - Mengetuk foto membuka **Photo Lightbox** - Caption (tanggal,
judul, "Buka cerita") menaut ke halaman detail kenangan

Animasi: - Kartu muncul dengan `lm-rise` (stagger ~55ms per kartu) - Foto
zoom halus saat hover - Pita tape muncul saat hover

------------------------------------------------------------------------

# 8. Memory Detail Page

Layout:

    Large Photo (cover)

    Title

    Date

    Location

    Full Story

    Foto lainnya (galeri, jika ada)

    Edit
    Delete

Foto menjadi hero element.

Story width: maksimal 700px

Galeri: grid 2-3 kolom kartu polaroid untuk foto tambahan.

Cover dan foto tambahan dapat diketuk untuk membuka **Photo Lightbox**
(lihat 14.1) yang menampilkan seluruh foto kenangan dengan navigasi
sebelumnya/berikutnya.

------------------------------------------------------------------------

# 9. Add Memory Page

Form:

## Photo Upload

State kosong:

    +
    Unggah foto kenangan

State berhasil:

    [IMAGE] [IMAGE] [IMAGE]
           (foto pertama = cover)

    Tambah foto lagi

Aturan:

-   1 sampai 10 foto per kenangan.
-   Foto pertama menjadi cover timeline.
-   Foto tambahan tampil di galeri detail.
-   Saat mengedit, cover bisa diganti dan foto tambahan bisa ditambah
    atau ditandai untuk dihapus.

## Input

Field: - Judul - Tanggal - Cerita - Lokasi

Style: - Rounded input - Soft background - Clear label

------------------------------------------------------------------------

# 9.1 Scrapbook Settings Page

Form konfigurasi scrapbook:

    Nama pasangan

    Tanggal mulai hubungan

    Pesan pembuka

    [ Batal ]   [ Simpan pengaturan ]

Field:

-   Nama pasangan (wajib).
-   Tanggal mulai hubungan (opsional, dipakai penghitung "bersama
    selama").
-   Pesan pembuka (opsional).

Style: kartu polaroid dengan stiker, konsisten dengan form kenangan.

------------------------------------------------------------------------

# 10. Filter Design

Mode: - All - Day - Month - Year

Mobile: Horizontal chips

Contoh:

    [Semua]
    [2026]
    [Oktober]
    [10 Okt]

Active: Candy Pink background

------------------------------------------------------------------------

# 11. Empty State

Konsep:

    Belum ada kenangan

    Mulai tambahkan momen kecil pertamamu ♡

    + Tambah Kenangan

Gunakan ilustrasi: - Notebook - Scrapbook - Heart

------------------------------------------------------------------------

# 12. Loading State

Gunakan: - Skeleton card - Soft pulse animation

Tidak menampilkan halaman kosong.

------------------------------------------------------------------------

# 13. Toast Notification

Success:

    ♡ Kenangan tersimpan!

Error:

    Aduh, ada yang salah

Style: - Floating card - Rounded - Soft shadow

------------------------------------------------------------------------

# 14. Modal Design

Untuk konfirmasi delete:

    Hapus kenangan ini?

    Tindakan ini tidak bisa dibatalkan.

    Batal
    Hapus

## 14.1 Photo Lightbox

Komponen: `PhotoLightbox`.

Dibuka dengan mengetuk foto di linimasa atau galeri detail:

    [ Tutup ]

  ‹   [ Foto besar, frame putih ]   ›

      Judul kenangan
      Tanggal · Lokasi
      [ Buka cerita lengkap ]

Aturan:

-   Latar gelap `bg-ink/85` dengan blur dan foto berbingkai putih.
-   Navigasi dengan tombol panah kiri/kanan, tombol di layar, atau tombol
    panah keyboard saat ada lebih dari satu foto.
-   Counter `n / total` hanya tampil bila ada lebih dari satu foto.
-   Tombol **Buka cerita lengkap** hanya tampil untuk foto di linimasa.
-   Tutup dengan `Esc`, tombol Tutup, atau mengetuk area gelap.
-   Fokus terperangkap di dalam dialog (Radix Dialog) dan foto diberi
    `lm-pop` saat berganti.

------------------------------------------------------------------------

# 15. Animation Guidelines

Gunakan: - Fade in (`lm-fade-in`) - Rise in (`lm-rise`, kartu & galeri) -
Pop (`lm-pop`, foto di lightbox) - Hover lift / zoom - Floating sticker

Durasi: 150-520ms

Stagger: gunakan CSS variable `--rise-delay` (maksimal ~11 langkah × 55ms)
agar kartu muncul berurutan tanpa terasa lambat.

Hindari: - Animasi berlebihan - Mengganggu membaca

Support: prefers-reduced-motion

------------------------------------------------------------------------

# 16. Responsive Rules

Pendekatan: **mobile-first** dengan breakpoint Tailwind.

## Mobile

-   Single column.
-   Full width button.
-   Large image priority.
-   Tombol aksi form menumpuk vertikal.

## Tablet (min-width 640px)

-   Dua kolom card.
-   Tombol aksi form sejajar ke kanan.

## Desktop (min-width 1024px)

-   Center timeline, maksimal tiga kolom card.
-   Konten dibatasi `max-w-6xl` (linimasa) dan `max-w-3xl` (header/detail)
    agar tetap nyaman dibaca di layar lebar.

## Ketahanan tata letak

-   `viewport-fit: cover` untuk layar berponi; jarak aman memakai
    `env(safe-area-inset-*)` (tombol mengambang dan padding bawah halaman).
-   Teks panjang (judul, cerita, lokasi) memakai `break-words` supaya tidak
    merusak lebar.
-   `overflow-x: clip` pada body mencegah geser samping akibat rotasi kartu
    dekoratif.
-   Modal dibatasi tinggi layar dan dapat di-scroll.
-   Pagination boleh membungkus (`flex-wrap`).

---

# 17. Accessibility

Wajib: - Kontras warna cukup - Keyboard navigation - Label input jelas -
Focus state - Alt text gambar - Reduced motion support

------------------------------------------------------------------------

# 18. Component States

Setiap komponen memiliki:

## Default

Tampilan normal.

## Loading

Skeleton/spinner.

## Empty

Informasi saat tidak ada data.

## Error

Pesan kesalahan yang jelas.

## Success

Feedback berhasil.

------------------------------------------------------------------------

# 19. UI Component Mapping

  Component       Design
  --------------- -------------------------
  PasswordGate    Romantic lock screen
  Header          Scrapbook cover
  Timeline        Journal timeline
  Card            Polaroid memory
  Filter          Sticker chips
  Form            Cute journal form
  PhotoPicker     Multi-photo strip
  SettingsForm    Scrapbook identity card
  Detail          Full scrapbook page
  Delete Dialog   Confirmation paper card
  Photo Lightbox  Framed photo viewer

------------------------------------------------------------------------

# 20. Design Tokens

Spacing: 4px scale

Radius:

Small: 12px

Medium: 20px

Large: 32px

Shadow:

Soft: 0 10px 30px rgba(0,0,0,0.08)

------------------------------------------------------------------------

# 21. Final UX Goal

Little Moments harus terasa seperti membuka album kenangan pribadi,
bukan menggunakan aplikasi database.

Prioritas:

Emotion \> Decoration

Photo \> UI

Story \> Feature

Simple \> Complex
