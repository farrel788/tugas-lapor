import { api, USE_MOCK, ApiError } from './api.js';
import { store, delay } from './mock.js';
import { buildKategori } from './mockAdmin.js';

const unwrap = (r) => (r && r.data !== undefined ? r.data : r);
const clone = (v) => JSON.parse(JSON.stringify(v));
const todayShort = () => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const nowFull = () => `${todayShort()}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}`;

export async function getKuota() {
  if (USE_MOCK) return delay({ ...store.kuota, sisa: store.kuota.limit - store.kuota.terpakai }, 150);
  return unwrap(await api.get('/reports/quota'));
}

export async function getKategori() {
  if (USE_MOCK) return delay(buildKategori(), 150);
  return unwrap(await api.get('/categories'));
}

export async function listReports() {
  if (USE_MOCK) return delay(clone(store.reports));
  return unwrap(await api.get('/reports'));
}

export async function getReport(id) {
  if (USE_MOCK) {
    const r = store.reports.find((x) => x.id === Number(id));
    if (!r) throw new ApiError('Laporan tidak ditemukan', 404);
    return delay(clone(r));
  }
  return unwrap(await api.get(`/reports/${id}`));
}

export async function createReport({ kategori, lokasi, jenis, deskripsi, urgensi, foto }) {
  if (USE_MOCK) {
    await delay(null, 900);
    if (store.kuota.terpakai >= store.kuota.limit) throw new ApiError('Kuota laporan hari ini sudah habis', 422);
    const id = store.nextId++;
    const waktu = nowFull();
    const laporan = {
      id, judul: deskripsi.length > 48 ? `${deskripsi.slice(0, 48).trim()}…` : deskripsi,
      kategori, lokasi, jenis, deskripsi, urgensi, status: 'pending',
      tanggal: todayShort(), tanggalLengkap: waktu, pelapor: 'Baim Pratama', kelasPelapor: 'XII.PPLG.1',
      foto: foto.map((f) => ({ nama: f.name, url: URL.createObjectURL(f) })),
      catatan: null, teknisi: null, hasil: null, diskusi: [],
      tracking: [
        { status: 'pending', judul: 'Menunggu Verifikasi', waktu, ket: 'Laporan diterima oleh sistem.', selesai: true },
        { status: 'diproses', judul: 'Dalam Perbaikan', waktu: 'Menunggu verifikasi', ket: 'Teknisi akan ditugaskan oleh pengelola.', selesai: false },
        { status: 'selesai', judul: 'Telah Diperbaiki', waktu: 'Menunggu penyelesaian', ket: 'Hasil perbaikan akan ditampilkan di sini.', selesai: false },
      ],
    };
    store.reports.unshift(laporan);
    store.kuota.terpakai += 1;
    return clone(laporan);
  }
  const fd = new FormData();
  Object.entries({ kategori, lokasi, jenis, deskripsi, urgensi }).forEach(([k, v]) => fd.append(k, v));
  foto.forEach((f) => fd.append('foto[]', f));
  return unwrap(await api.post('/reports', fd));
}

export async function sendMessage(reportId, teks) {
  if (USE_MOCK) {
    const r = store.reports.find((x) => x.id === Number(reportId));
    const msg = { dari: 'siswa', nama: 'Baim Pratama', waktu: nowFull().replace(/^\d+ \w+ \d+, /, `${todayShort().slice(0, 6)}, `), teks };
    r.diskusi.push(msg);
    return delay(msg, 300);
  }
  return unwrap(await api.post(`/reports/${reportId}/messages`, { message: teks }));
}

export async function listNotifications() {
  if (USE_MOCK) return delay(clone(store.notifications), 200);
  return unwrap(await api.get('/notifications'));
}

export async function markAllRead() {
  if (USE_MOCK) { store.notifications.forEach((n) => { n.dibaca = true; }); return delay(true, 150); }
  return api.post('/notifications/read-all', {});
}
