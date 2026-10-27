// Ubah di file .env (VITE_API_BASE_URL) agar mudah disesuaikan dengan backend Laravel.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
