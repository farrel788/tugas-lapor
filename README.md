# Lapor Sekolah (React + Vite)

Frontend Pengaduan Fasilitas Sekolah, dikonversi dari desain Figma.

## Menjalankan (cara cepat)
Pasang [Node.js](https://nodejs.org) versi LTS (18 atau lebih baru), lalu:
- **Windows:** klik dua kali `jalankan.bat`
- **Mac/Linux:** `./jalankan.sh`

Skrip ini otomatis menjalankan `npm install` (sekali saja) lalu membuka aplikasi di http://localhost:5173.
File `.env` sudah disiapkan dengan mode demo (tanpa backend).

Cara manual:
```bash
npm install
npm run dev
```

## Akun demo
- Siswa: NISN 10 digit apa saja, misalnya `1234567890`
- Admin: email `admin@sekolah.sch.id`, password `password`
- Teknisi: email `teknisi@sekolah.sch.id`, password `password`

## Struktur
- `src/styles/tokens.css` : design token (warna, radius, badge) dari Kit UI Figma
- `src/components/ui` : Button, Input/Select/Textarea, Badge, Card, Table, Toast, Modal, EmptyState
- `src/components/layout` : Navbar, Sidebar, SiswaLayout / AdminLayout / TeknisiLayout
- `src/services` : `api.js` (fetch ke Laravel), `auth.jsx` (login state)
- `src/pages` : halaman (`siswa/`, `admin/`, `teknisi/`, plus login)

## Mode demo (tanpa backend)
Secara default `VITE_USE_MOCK` aktif, jadi semua halaman siswa jalan memakai data contoh dari Figma
(`src/services/mock.js`). Login siswa: isi NISN 10 digit apa saja (`0000000000` = "NISN tidak ditemukan").
Login petugas: password `password` + email apa saja (diawali `teknisi` = teknisi (Budi Santoso, punya 3 tugas), selain itu admin); password lain = "Email atau password salah".
Untuk memakai API Laravel asli, isi `.env`:
```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000/api
```
Endpoint & bentuk respons yang diasumsikan ada di `src/services/reports.js` (sesuaikan dengan API tim).

## Status konversi
- [x] Kit UI (token + komponen dasar)
- [x] Siswa: Login, Dashboard, Buat laporan, Riwayat, Detail laporan, Notifikasi
- [x] Login petugas (+ state validasi kosong & kredensial salah)
- [x] Admin: Dashboard, Semua laporan, Detail laporan, Data master (3 tab + modal tambah/edit/hapus)
- [x] Teknisi: Dashboard, Tugas Saya, Detail tugas
