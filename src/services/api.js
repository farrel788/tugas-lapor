import { API_BASE_URL } from '../config.js';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export class ApiError extends Error {
  constructor(message, status, data) { super(message); this.status = status; this.data = data; }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const isForm = body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || 'Terjadi kesalahan', res.status, data);
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};

export const loginSiswa = async ({ nisn, password }) => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const SISWA = {
      '1234567890': { id: 1, name: 'Baim Pratama', kelas: 'XII.PPLG.1' },
      '1111111111': { id: 2, name: 'Yogi Fernando', kelas: 'XII.PPLG.1' },
      '2222222222': { id: 3, name: 'Novril Yabai Tata', kelas: 'XII.PPLG.2' },
    };
    const user = SISWA[nisn];
    if (!user || password !== 'password') throw new ApiError('NISN atau password salah', 401);
    return { token: 'mock-token', user: { ...user, nisn } };
  }
  return api.post('/login', { nisn, password });
};
export const registerSiswa = ({ name, nisn, kelas, password, password_confirmation }) =>
  api.post('/register', { name, nisn, kelas, password, password_confirmation });

export const loginPetugas = async ({ email, password }) => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    if (password !== 'password') throw new ApiError('Email atau password salah', 401);
    const teknisi = email.toLowerCase().startsWith('teknisi');
    return {
      token: 'mock-token',
      user: teknisi
        ? { id: 3, name: 'Budi Santoso', email, role: 'teknisi', jabatan: 'Teknisi' }
        : { id: 2, name: 'Rina Anggraini', email, role: 'admin', jabatan: 'Admin / Sarpras' },
    };
  }
  return api.post('/login', { email, password });
};


