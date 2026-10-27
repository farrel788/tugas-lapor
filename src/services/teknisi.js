import { api, USE_MOCK, ApiError } from './api.js';
import { delay } from './mock.js';
import { adminStore, trackingFor, nowFull } from './mockAdmin.js';
import { normalizeReport, normalizeReports } from './reportMapper.js';

const unwrap = (r) => (r && r.data !== undefined ? r.data : r);
const clone = (v) => JSON.parse(JSON.stringify(v));
const milik = (id, nama) => {
  const r = adminStore.reports.find((x) => x.id === Number(id) && x.teknisi === nama);
  if (!r) throw new ApiError('Tugas tidak ditemukan', 404);
  return r;
};

export async function listTugas(nama) {
  if (USE_MOCK) return delay(clone(adminStore.reports.filter((r) => r.teknisi === nama)));
  return normalizeReports(unwrap(await api.get('/technician/tasks')));
}

export async function getTugas(id, nama) {
  if (USE_MOCK) { const r = milik(id, nama); return delay({ ...clone(r), tracking: trackingFor(r) }); }
  return normalizeReport(unwrap(await api.get(`/technician/tasks/${id}`)));
}

export async function updateTugas(id, nama, { status, catatan, jumlahFoto }) {
  if (USE_MOCK) {
    await delay(null, 500);
    const r = milik(id, nama);
    const teks = (catatan || '').trim();
    if (status === 'selesai' && (!teks || jumlahFoto < 1)) {
      throw new ApiError('Untuk menyelesaikan tugas, sertakan catatan dan minimal satu foto hasil perbaikan.', 422);
    }
    const waktu = nowFull();
    r.status = status;
    r.diperbarui = waktu;
    if (teks) r.catatanTeknisi = { teks, oleh: nama, waktu };
    if (status === 'selesai') r.hasil = { teks, waktu };
    return { ...clone(r), tracking: trackingFor(r) };
  }
  return normalizeReport(unwrap(await api.post(`/technician/tasks/${id}/status`, { status, note: catatan })));
}
