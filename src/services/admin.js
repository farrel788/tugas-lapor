import { api, USE_MOCK, ApiError } from './api.js';
import { delay } from './mock.js';
import { adminStore, master, trackingFor, ADMIN_NAME, TEKNISI, nowFull, nowChat } from './mockAdmin.js';

const unwrap = (r) => (r && r.data !== undefined ? r.data : r);
const clone = (v) => JSON.parse(JSON.stringify(v));
const find = (id) => {
  const r = adminStore.reports.find((x) => x.id === Number(id));
  if (!r) throw new ApiError('Laporan tidak ditemukan', 404);
  return r;
};
const withTracking = (r) => ({ ...clone(r), tracking: trackingFor(r) });

// ---------- Laporan ----------
export async function listAdminReports() {
  if (USE_MOCK) return delay(clone(adminStore.reports));
  return unwrap(await api.get('/admin/reports'));
}

export async function getAdminReport(id) {
  if (USE_MOCK) return delay(withTracking(find(id)));
  return unwrap(await api.get(`/admin/reports/${id}`));
}

export async function listTeknisi() {
  if (USE_MOCK) return delay([...TEKNISI], 100);
  return unwrap(await api.get('/admin/technicians'));
}

export async function assignTeknisi(id, nama) {
  if (USE_MOCK) {
    const r = find(id);
    const waktu = nowFull();
    r.teknisi = nama;
    r.ditugaskan = `Ditugaskan oleh ${ADMIN_NAME} pada ${waktu}.`;
    if (r.status === 'pending') { r.status = 'diproses'; r.waktuProses = waktu; }
    r.diperbarui = waktu;
    return delay(withTracking(r), 400);
  }
  return unwrap(await api.post(`/admin/reports/${id}/assign`, { technician: nama }));
}

export async function updateStatus(id, { status, catatan }) {
  if (USE_MOCK) {
    const r = find(id);
    const teks = (catatan || '').trim();
    if (status === 'ditolak' && !teks) throw new ApiError('Alasan penolakan wajib diisi', 422);
    const waktu = nowFull();
    if (status === 'diproses' && !r.waktuProses) r.waktuProses = waktu;
    r.status = status;
    r.diperbarui = waktu;
    if (teks) r.catatan = { teks, oleh: ADMIN_NAME, waktu };
    if (status === 'selesai') r.hasil = { teks: teks || 'Perbaikan telah diselesaikan.', waktu };
    return delay(withTracking(r), 400);
  }
  return unwrap(await api.post(`/admin/reports/${id}/status`, { status, note: catatan }));
}

export async function sendAdminMessage(id, teks) {
  if (USE_MOCK) {
    const msg = { dari: 'pengelola', nama: 'Rina • Pengelola', waktu: nowChat(), teks };
    find(id).diskusi.push(msg);
    return delay(msg, 250);
  }
  return unwrap(await api.post(`/admin/reports/${id}/messages`, { message: teks }));
}

// ---------- Data master ----------
export const MASTER_KEY = { 'kategori-area': 'kategori', 'lokasi-spesifik': 'lokasi', 'kategori-fasilitas': 'fasilitas' };

export async function listMaster(type) {
  if (USE_MOCK) {
    const key = MASTER_KEY[type];
    const rows = clone(master[key]).map((x) =>
      key === 'kategori'
        ? { ...x, jumlah: master.lokasi.filter((l) => l.kategori === x.nama).length }
        : x);
    return delay(rows, 200);
  }
  return unwrap(await api.get(`/admin/master/${type}`));
}

export async function saveMaster(type, { id, nama, kategori }) {
  if (USE_MOCK) {
    await delay(null, 300);
    const key = MASTER_KEY[type];
    const name = (nama || '').trim();
    if (!name) throw new ApiError('Nama wajib diisi', 422);
    if (key !== 'kategori' && !kategori) throw new ApiError('Kategori induk wajib dipilih', 422);
    const dup = master[key].some((x) => x.id !== id && x.nama.toLowerCase() === name.toLowerCase() && (key === 'kategori' || x.kategori === kategori));
    if (dup) throw new ApiError('Nama sudah terdaftar', 422);
    if (id) {
      const row = master[key].find((x) => x.id === id);
      if (key === 'kategori') {
        master.lokasi.forEach((l) => { if (l.kategori === row.nama) l.kategori = name; });
        master.fasilitas.forEach((f) => { if (f.kategori === row.nama) f.kategori = name; });
      }
      row.nama = name;
      if (key !== 'kategori') row.kategori = kategori;
    } else {
      master[key].push(key === 'kategori' ? { id: master.nextId++, nama: name } : { id: master.nextId++, nama: name, kategori });
    }
    return true;
  }
  const body = { name: nama, category: kategori };
  return id ? api.put(`/admin/master/${type}/${id}`, body) : api.post(`/admin/master/${type}`, body);
}

export async function deleteMaster(type, id) {
  if (USE_MOCK) {
    await delay(null, 300);
    const key = MASTER_KEY[type];
    const row = master[key].find((x) => x.id === id);
    if (key === 'kategori' && (master.lokasi.some((l) => l.kategori === row.nama) || master.fasilitas.some((f) => f.kategori === row.nama))) {
      throw new ApiError('Kategori masih memiliki lokasi atau fasilitas. Hapus data terkait terlebih dahulu.', 422);
    }
    master[key] = master[key].filter((x) => x.id !== id);
    return true;
  }
  return api.del(`/admin/master/${type}/${id}`);
}
