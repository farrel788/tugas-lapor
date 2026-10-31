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

## Endpoint API

Base URL: `http://localhost:8000/api` (dari `src/config.js`, bisa diubah lewat `.env` → `VITE_API_BASE_URL`).

Token dikirim via header `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Body | Keterangan |
|---|---|---|---|
| POST | `/login` | `{ nisn, password }` atau `{ email, password }` | Login siswa / petugas |
| POST | `/register` | `{ name, nisn, kelas, password, password_confirmation }` | Daftar akun siswa |

### Siswa — Laporan & Notifikasi (`src/services/reports.js`)
| Method | Endpoint | Body | Keterangan |
|---|---|---|---|
| GET | `/reports/quota` | - | Cek kuota laporan harian |
| GET | `/categories` | - | Ambil kategori, lokasi, jenis fasilitas |
| GET | `/reports` | - | Daftar laporan |
| GET | `/reports/{id}` | - | Detail laporan |
| POST | `/reports` | multipart/form-data (`location_id`, `facility_category_id`, `deskripsi`, `urgensi`, `foto[]`) | Buat laporan |
| POST | `/reports/{reportId}/messages` | `{ message }` | Kirim pesan diskusi |
| GET | `/notifications` | - | Ambil notifikasi |
| POST | `/notifications/read-all` | - | Tandai semua notifikasi dibaca |

Respons `GET /categories` untuk formulir siswa memuat `kategori` (kategori fasilitas dengan `id` dan `name`) serta `lokasi` (area yang berisi `locations` dengan `id` dan `name`). Formulir mengirim ID lokasi spesifik sebagai `location_id` dan ID kategori fasilitas sebagai `facility_category_id`.

### Admin (`src/services/admin.js`)
| Method | Endpoint | Body | Keterangan |
|---|---|---|---|
| GET | `/admin/reports` | - | Daftar laporan |
| GET | `/admin/reports/{id}` | - | Detail laporan |
| GET | `/admin/technicians` | - | Daftar teknisi |
| POST | `/admin/reports/{id}/assign` | `{ technician }` | Assign teknisi ke laporan |
| POST | `/admin/reports/{id}/status` | `{ status, note }` | Update status laporan |
| POST | `/admin/reports/{id}/messages` | `{ message }` | Kirim pesan diskusi |
| GET | `/admin/master/{type}` | - | Data master (kategori / lokasi / fasilitas) |
| POST | `/admin/master/{type}` | `{ name, category }` | Tambah data master |
| PUT | `/admin/master/{type}/{id}` | `{ name, category }` | Edit data master |
| DELETE | `/admin/master/{type}/{id}` | - | Hapus data master |

### Teknisi (`src/services/teknisi.js`)
| Method | Endpoint | Body | Keterangan |
|---|---|---|---|
| GET | `/technician/tasks` | - | Daftar tugas saya |
| GET | `/technician/tasks/{id}` | - | Detail tugas |
| POST | `/technician/tasks/{id}/status` | `{ status, note }` | Update status tugas (diproses / selesai) |

## Status konversi
- [x] Kit UI (token + komponen dasar)
- [x] Siswa: Login, Dashboard, Buat laporan, Riwayat, Detail laporan, Notifikasi
- [x] Login petugas (+ state validasi kosong & kredensial salah)
- [x] Admin: Dashboard, Semua laporan, Detail laporan, Data master (3 tab + modal tambah/edit/hapus)
- [x] Teknisi: Dashboard, Tugas Saya, Detail tugas
