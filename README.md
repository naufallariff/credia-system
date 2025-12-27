# Creadia System - Professional Loan Management System

Sistem manajemen pinjaman (Loan Management System) berbasis MERN Stack (MongoDB, Express, React, Node.js) yang dirancang untuk menangani siklus hidup kontrak kredit, mulai dari pengajuan, persetujuan, perhitungan bunga flat/efektif, manajemen denda keterlambatan (real-time), hingga pelunasan.

## Fitur Utama

* **Role-Based Access Control (RBAC):**
* **Admin:** Mengatur konfigurasi bunga, DP, dan manajemen user.
* **Staff:** Input kontrak baru, memproses pembayaran angsuran.
* **Client:** Melihat roadmap angsuran dan sisa hutang sendiri.


* **Dynamic Rule Engine:** Aturan bunga dan DP tersimpan di database, bukan hardcode.
* **Financial Engine:**
* Kalkulasi Bunga Flat Yearly.
* Penanganan Denda Harian (0.1% per hari) secara otomatis.
* Embedded Amortization Schedule (Jadwal angsuran tersimpan atomik).


* **Security:** Helmet, Rate Limiting, Zod Validation, JWT Authentication.

## Struktur Proyek

* **/client**: Frontend (Vite + React + Tailwind CSS).
* **/server**: Backend (Node.js + Express + MongoDB).

## Prasyarat

* Node.js (v18+)
* MongoDB (Local atau Atlas)

## Cara Menjalankan (Quick Start)

### 1. Setup Backend

**[MULAI CODE BLOCK bash DISINI]**
cd server
npm install

# Buat file .env (lihat server/README.md)

node src/seeder.js # (Opsional: Untuk isi data dummy awal)
node src/app.js
**[AKHIR CODE BLOCK]**

### 2. Setup Frontend

**[MULAI CODE BLOCK bash DISINI]**
cd client
npm install
npm run dev
**[AKHIR CODE BLOCK]**

Akses aplikasi di http://localhost:5173.

## Lisensi

Project ini dilisensikan di bawah [MIT License](https://www.google.com/search?q=LICENSE).