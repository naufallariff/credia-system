# Credia System - Backend API

Backend service untuk IMS Finance yang menangani logika bisnis perbankan, autentikasi, dan database.

## Teknologi

* Node.js & Express
* MongoDB & Mongoose
* JWT (JSON Web Token)
* Zod (Validasi Input Ketat)

## Konfigurasi Environment (.env)

Buat file .env di dalam folder server dan isi dengan:

**[MULAI CODE BLOCK env DISINI]**
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ims_finance_db
JWT_SECRET=rahasia_negara_api_2025_secure_key
JWT_EXPIRE=1d
**[AKHIR CODE BLOCK]**

## Script Tersedia

* `npm start`: Menjalankan server (node src/app.js).
* `npm run dev`: Menjalankan server dengan Nodemon (hot reload).
* `node src/seeder.js`: **RESET DATABASE** dan mengisi data dummy (Admin, Staff, Config, Kontrak).
* `node test-contract.js`: Menjalankan skenario tes integrasi kontrak & pembayaran.

## API Security

API ini dilindungi oleh berbagai layer:

1. **Helmet**: Mengamankan HTTP Headers.
2. **Rate Limit**: Mencegah Brute Force (100 req / 10 menit).
3. **Zod**: Mencegah data sampah/malicious masuk ke logic.