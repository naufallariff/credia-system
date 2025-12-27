# Credia System - Frontend Client

Aplikasi web modern untuk dashboard manajemen pinjaman IMS Finance. Dibangun dengan pendekatan **Atomic Design**.

## Teknologi

* **React (Vite)**: Framework utama super cepat.
* **Tailwind CSS**: Utility-first CSS framework.
* **Axios**: HTTP Client dengan Interceptor otomatis (Auth Token).
* **Lucide React**: Icon set modern.

## Struktur Folder

* `src/components/ui`: Komponen dasar (Button, Input, Card) yang reusable.
* `src/pages`: Halaman utama (Login, Dashboard).
* `src/services`: Konfigurasi API terpusat (`api.js`).
* `src/utils`: Helper function (Formatter Rupiah, Tanggal).

## Cara Menjalankan

1. Pastikan Backend sudah berjalan di port 5000.
2. Install dependensi:
**[MULAI CODE BLOCK bash DISINI]**
npm install
**[AKHIR CODE BLOCK]**
3. Jalankan development server:
**[MULAI CODE BLOCK bash DISINI]**
npm run dev
**[AKHIR CODE BLOCK]**

## Konfigurasi Proxy

Frontend ini menggunakan Proxy di `vite.config.js` untuk menghindari CORS issue saat development. Semua request ke `/api` akan diteruskan ke `http://localhost:5000`.