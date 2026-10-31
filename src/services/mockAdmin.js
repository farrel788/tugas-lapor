// Data contoh admin (dari desain Figma). Dipakai saat VITE_USE_MOCK != 'false'.
import { store } from './mock.js';

export const ADMIN_NAME = 'Rina Anggraini';
export const TEKNISI = ['Budi Santoso', 'Dedi Kurniawan'];
export const DEFAULT_RANGE = { from: '2026-10-19', to: '2026-10-23', label: '19–23 Okt 2026' };

const pad = (n) => String(n).padStart(2, '0');
export const todayShort = () => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
export const nowFull = () => `${todayShort()}, ${pad(new Date().getHours())}.${pad(new Date().getMinutes())}`;
export const nowChat = () => `${new Date().getDate()} ${new Date().toLocaleDateString('id-ID', { month: 'short' })}, ${pad(new Date().getHours())}.${pad(new Date().getMinutes())}`;

const tgl = (iso) => `${Number(iso.slice(8))} Okt 2026`;
const R = (o) => ({ foto: [], catatan: null, catatanTeknisi: null, hasil: null, diskusi: [], teknisi: null, ditugaskan: null, waktuProses: null, ...o });
const gen = (id, pelapor, nisn, kelasPelapor, kategori, lokasi, jenis, judul, urgensi, status, teknisi, iso, jam) =>
  R({
    id, pelapor, nisn, kelasPelapor, kategori, lokasi, jenis, judul, urgensi, status, teknisi, iso,
    deskripsi: `${judul}.`, tanggal: tgl(iso), tanggalLengkap: `${tgl(iso)}, ${jam}`, diperbarui: `${tgl(iso)}, ${jam}`,
    ditugaskan: teknisi ? `Ditugaskan oleh ${ADMIN_NAME} pada ${tgl(iso)}, ${jam}.` : null,
  });

const r12 = store.reports.find((r) => r.id === 12);

export const adminStore = {
  reports: [
    R({
      id: 12, pelapor: 'Baim Pratama', nisn: '0081234567', kelasPelapor: 'XII.PPLG.1', kategori: 'Kelas', lokasi: 'XII.PPLG.1',
      jenis: 'Proyektor', judul: r12.judul, deskripsi: r12.deskripsi, urgensi: 'sedang', status: 'diproses', teknisi: 'Budi Santoso',
      ditugaskan: 'Ditugaskan oleh Rina Anggraini pada 23 Okt 2026, 09.00.', waktuProses: '23 Okt 2026, 09.00',
      iso: '2026-10-23', tanggal: '23 Okt 2026', tanggalLengkap: '23 Okt 2026, 08.10', diperbarui: '23 Okt 2026, 09.15',
      foto: r12.foto, catatan: r12.catatan, diskusi: r12.diskusi, // diskusi dibagi dengan sisi siswa
      catatanTeknisi: { teks: 'Sedang memeriksa sambungan kabel HDMI dan konektor proyektor.', oleh: 'Budi Santoso', waktu: '23 Okt 2026, 09.30' },
    }),
    gen(11, 'Rizky Pratama', '0081234568', 'XII.PPLG.2', 'Kelas', 'XII.PPLG.2', 'AC/Kipas', 'Kipas angin tidak berputar', 'sedang', 'pending', null, '2026-10-23', '08.00'),
    gen(10, 'Aditya Saputra', '0081234569', 'XII.PPLG.2', 'Lab', 'Lab Komputer 1', 'Stop kontak', 'Stopkontak longgar', 'mendesak', 'diproses', 'Budi Santoso', '2026-10-22', '09.00'),
    gen(9, 'Nabila Putri', '0081234570', 'XII.PPLG.1', 'Kelas', 'XII.PPLG.1', 'Meja/Kursi', 'Kursi kelas patah', 'rendah', 'selesai', 'Dedi Kurniawan', '2026-10-21', '07.45'),
    gen(8, 'Rizky Pratama', '0081234568', 'XII.PPLG.2', 'Toilet', 'Toilet lantai 1', 'Kran/Wastafel', 'Kran wastafel bocor', 'sedang', 'pending', null, '2026-10-21', '10.30'),
    gen(6, 'Nabila Putri', '0081234570', 'XI.PPLG.1', 'Kelas', 'XI.PPLG.1', 'Lampu', 'Lampu kelas mati', 'sedang', 'selesai', 'Budi Santoso', '2026-10-20', '10.20'),
    gen(4, 'Nabila Putri', '0081234570', 'XII.PPLG.1', 'Kelas', 'XII.PPLG.1', 'AC/Kipas', 'AC terasa kurang dingin', 'rendah', 'ditolak', null, '2026-10-19', '09.00'),
  ],
};

export function trackingFor(r) {
  const t = [{ status: 'pending', judul: 'Menunggu Verifikasi', waktu: r.tanggalLengkap, ket: 'Laporan diterima oleh sistem.', selesai: true }];
  if (r.status === 'ditolak') {
    t.push({ status: 'ditolak', judul: 'Laporan Ditolak', waktu: r.diperbarui, ket: 'Laporan tidak dapat ditindaklanjuti.', selesai: true });
    return t;
  }
  const maju = r.status === 'diproses' || r.status === 'selesai';
  t.push({
    status: 'diproses', judul: 'Dalam Perbaikan', selesai: maju,
    waktu: maju ? (r.waktuProses || r.diperbarui) : 'Menunggu verifikasi',
    ket: maju ? `${r.teknisi || 'Teknisi'} ditugaskan oleh pengelola.` : 'Teknisi akan ditugaskan oleh pengelola.',
  });
  const selesai = r.status === 'selesai';
  t.push({
    status: 'selesai', judul: 'Telah Diperbaiki', selesai,
    waktu: selesai ? r.diperbarui : 'Menunggu penyelesaian',
    ket: selesai ? (r.hasil?.teks || 'Perbaikan telah diselesaikan.') : 'Hasil perbaikan akan ditampilkan di sini.',
  });
  return t;
}

// ---------- Data master ----------
const L = (nama, kategori) => ({ nama, kategori });
const F = (nama, kategori) => ({ nama, kategori });
export const master = {
  nextId: 100,
  kategori: ['Toilet', 'Kelas', 'Lab', 'Lapangan', 'Listrik', 'AC'].map((nama, i) => ({ id: i + 1, nama })),
  lokasi: [
    L('Toilet lantai 1', 'Toilet'), L('Toilet lantai 2', 'Toilet'),
    L('XII.PPLG.1', 'Kelas'), L('XII.PPLG.2', 'Kelas'), L('XI.PPLG.1', 'Kelas'),
    L('Lab Komputer 1', 'Lab'), L('Lab Komputer 2', 'Lab'),
    L('Lapangan Basket', 'Lapangan'),
    L('Gedung A', 'Listrik'), L('Gedung B', 'Listrik'),
    L('Ruang Guru', 'AC'), L('Perpustakaan', 'AC'),
  ].map((x, i) => ({ id: 200 + i, ...x })),
  fasilitas: [
    F('Kran/Wastafel', 'Toilet'), F('Pintu', 'Toilet'), F('Lampu', 'Toilet'),
    F('Meja/Kursi', 'Kelas'), F('AC/Kipas', 'Kelas'), F('Proyektor', 'Kelas'), F('Lampu', 'Kelas'),
    F('Komputer', 'Lab'), F('AC/Kipas', 'Lab'), F('Jaringan', 'Lab'),
    F('Ring/Tiang', 'Lapangan'), F('Lantai', 'Lapangan'), F('Lampu', 'Lapangan'),
    F('Stop kontak', 'Listrik'), F('Saklar', 'Listrik'), F('Lampu', 'Listrik'),
    F('AC tidak dingin', 'AC'), F('AC bocor', 'AC'),
  ].map((x, i) => ({ id: 300 + i, ...x })),
};

// Bentuk pilihan untuk formulir "Buat laporan" siswa.
export function buildKategori() {
  return Object.fromEntries(master.kategori.map((k) => [k.nama, {
    lokasi: master.lokasi.filter((l) => l.kategori === k.nama).map((l) => l.nama),
    jenis: master.fasilitas.filter((f) => f.kategori === k.nama).map((f) => f.nama),
  }]));
}
