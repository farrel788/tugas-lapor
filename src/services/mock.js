// Data contoh dari desain Figma. Dipakai saat VITE_USE_MOCK != 'false'.
export const delay = (v, ms = 350) => new Promise((r) => setTimeout(() => r(v), ms));

export const MOCK_USER = { id: 1, name: 'Baim Pratama', kelas: 'XII.PPLG.1', role: 'siswa' };

const T = (status, judul, waktu, ket, selesai = true) => ({ status, judul, waktu, ket, selesai });

const base = (o) => ({
  kategori: 'Kelas', lokasi: 'XII.PPLG.1', jenis: 'Meja/Kursi', pelapor: 'Baim Pratama', kelasPelapor: 'XII.PPLG.1',
  foto: [], catatan: null, teknisi: null, diskusi: [], hasil: null, ...o,
});

export const store = {
  kuota: { limit: 2, terpakai: 1 },
  nextId: 13,
  reports: [
    base({
      id: 12, judul: 'Proyektor tidak menampilkan gambar', jenis: 'Proyektor', tanggal: '23 Okt 2026', tanggalLengkap: '23 Okt 2026, 08.10',
      urgensi: 'sedang', status: 'diproses',
      deskripsi: 'Proyektor di kelas XII.PPLG.1 menyala, tetapi tidak menampilkan gambar dari laptop. Kabel HDMI sudah dicoba disambungkan kembali, namun layar tetap kosong.',
      foto: [{ nama: 'proyektor.jpg', url: null }, { nama: 'kabel-hdmi.jpg', url: null }],
      catatan: { teks: 'Laporan telah diverifikasi. Pak Budi akan memeriksa kabel HDMI setelah jam pelajaran pertama. Mohon pastikan ruang dapat diakses saat istirahat.', oleh: 'Rina Anggraini', waktu: '23 Okt 2026, 09.15' },
      teknisi: { nama: 'Budi Santoso', info: 'Ditugaskan pada 23 Okt 2026, 09.00 oleh Rina Anggraini.' },
      tracking: [
        T('pending', 'Menunggu Verifikasi', '23 Okt 2026, 08.10', 'Laporan diterima oleh sistem.'),
        T('diproses', 'Dalam Perbaikan', '23 Okt 2026, 09.00', 'Budi Santoso ditugaskan oleh pengelola.'),
        T('selesai', 'Telah Diperbaiki', 'Menunggu penyelesaian', 'Hasil perbaikan akan ditampilkan di sini.', false),
      ],
      diskusi: [
        { dari: 'siswa', nama: 'Baim Pratama', waktu: '23 Okt, 08.15', teks: 'Proyektor menyala, tetapi gambar tidak muncul saat kabel disambungkan.' },
        { dari: 'pengelola', nama: 'Rina • Pengelola', waktu: '23 Okt, 09.15', teks: 'Terima kasih, Baim. Pak Budi akan memeriksa kabel HDMI setelah jam pelajaran pertama.' },
        { dari: 'siswa', nama: 'Baim Pratama', waktu: '23 Okt, 09.20', teks: 'Baik, Bu. Ruang kelas bisa diakses saat istirahat pukul 10.00.' },
      ],
    }),
    base({
      id: 9, judul: 'Kursi kelas patah', tanggal: '21 Okt 2026', tanggalLengkap: '21 Okt 2026, 07.45', urgensi: 'rendah', status: 'selesai',
      deskripsi: 'Salah satu kursi di baris belakang patah di bagian kaki.',
      catatan: { teks: 'Laporan diverifikasi dan diteruskan ke teknisi.', oleh: 'Rina Anggraini', waktu: '21 Okt 2026, 09.00' },
      teknisi: { nama: 'Budi Santoso', info: 'Ditugaskan pada 21 Okt 2026, 09.30 oleh Rina Anggraini.' },
      hasil: { teks: 'Kursi sudah diperbaiki. Terima kasih atas laporan Anda.', waktu: '22 Okt 2026, 14.00' },
      tracking: [
        T('pending', 'Menunggu Verifikasi', '21 Okt 2026, 07.45', 'Laporan diterima oleh sistem.'),
        T('diproses', 'Dalam Perbaikan', '21 Okt 2026, 09.30', 'Budi Santoso ditugaskan oleh pengelola.'),
        T('selesai', 'Telah Diperbaiki', '22 Okt 2026, 14.00', 'Kursi sudah diperbaiki.'),
      ],
    }),
    base({
      id: 6, judul: 'Lampu kelas mati', lokasi: 'XI.PPLG.1', jenis: 'Lampu', tanggal: '20 Okt 2026', tanggalLengkap: '20 Okt 2026, 10.20', urgensi: 'sedang', status: 'selesai',
      deskripsi: 'Dua lampu di bagian depan kelas tidak menyala.',
      catatan: { teks: 'Laporan diverifikasi.', oleh: 'Rina Anggraini', waktu: '20 Okt 2026, 11.00' },
      teknisi: { nama: 'Budi Santoso', info: 'Ditugaskan pada 20 Okt 2026, 11.15 oleh Rina Anggraini.' },
      hasil: { teks: 'Lampu telah diganti.', waktu: '21 Okt 2026, 08.30' },
      tracking: [
        T('pending', 'Menunggu Verifikasi', '20 Okt 2026, 10.20', 'Laporan diterima oleh sistem.'),
        T('diproses', 'Dalam Perbaikan', '20 Okt 2026, 11.15', 'Budi Santoso ditugaskan oleh pengelola.'),
        T('selesai', 'Telah Diperbaiki', '21 Okt 2026, 08.30', 'Lampu telah diganti.'),
      ],
    }),
    base({
      id: 4, judul: 'AC terasa kurang dingin', jenis: 'AC/Kipas', tanggal: '19 Okt 2026', tanggalLengkap: '19 Okt 2026, 09.00', urgensi: 'rendah', status: 'ditolak',
      deskripsi: 'AC terasa kurang dingin sejak pagi.',
      catatan: { teks: 'AC berfungsi normal. Tidak ditemukan kerusakan saat pemeriksaan.', oleh: 'Rina Anggraini', waktu: '19 Okt 2026, 10.00' },
      tracking: [
        T('pending', 'Menunggu Verifikasi', '19 Okt 2026, 09.00', 'Laporan diterima oleh sistem.'),
        T('ditolak', 'Laporan Ditolak', '19 Okt 2026, 10.00', 'Laporan tidak dapat ditindaklanjuti.'),
      ],
    }),
  ],
  notifications: [
    { id: 1, judul: 'Laporan #12 diubah menjadi Diproses', isi: 'Budi Santoso mulai menangani proyektor kelas XII.PPLG.1.', waktu: '23 Okt 2026, 09.00', dibaca: false, laporanId: 12 },
    { id: 2, judul: 'Pengelola membalas laporan Anda', isi: 'Terima kasih, Baim. Pak Budi akan memeriksa kabel HDMI.', waktu: '23 Okt 2026, 09.15', dibaca: false, laporanId: 12 },
    { id: 3, judul: 'Laporan #09 telah selesai', isi: 'Kursi kelas sudah diperbaiki. Terima kasih atas laporan Anda.', waktu: '22 Okt 2026, 14.00', dibaca: true, laporanId: 9 },
    { id: 4, judul: 'Laporan #04 ditolak', isi: 'AC berfungsi normal. Lihat catatan pengelola untuk detailnya.', waktu: '19 Okt 2026, 10.00', dibaca: true, laporanId: 4 },
  ],
};
