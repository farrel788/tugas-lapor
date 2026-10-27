import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthAbout from '../components/layout/AuthAbout.jsx';
import Button from '../components/ui/Button.jsx';
import Toast from '../components/ui/Toast.jsx';
import { Input, PasswordInput } from '../components/ui/Field.jsx';
import { registerSiswa } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';

const FIELD_KEYS = {
  name: 'nama', nisn: 'nisn', kelas: 'kelas', password: 'password', password_confirmation: 'konfirmasi',
};

export default function RegisterSiswa() {
  const [form, setForm] = useState({ name: '', nisn: '', kelas: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Nama wajib diisi';
    if (!/^\d{10}$/.test(form.nisn)) next.nisn = 'NISN harus 10 digit angka';
    if (!form.kelas.trim()) next.kelas = 'Kelas wajib diisi';
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter';
    if (form.password_confirmation !== form.password) next.password_confirmation = 'Konfirmasi password tidak sama';
    setErrors(next);
    setAlert('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const response = await registerSiswa({
        ...form,
        name: form.name.trim(),
        nisn: form.nisn.trim(),
        kelas: form.kelas.trim(),
      });
      const data = response?.data ?? response;
      if (data?.token && data?.user) {
        login({ token: data.token, user: { ...data.user, role: data.user.role || 'siswa' } });
        navigate('/siswa', { replace: true });
      } else {
        navigate('/', {
          replace: true,
          state: { registrationNotice: data?.message || 'Pendaftaran berhasil. Silakan masuk dengan NISN dan password baru.' },
        });
      }
    } catch (error) {
      const serverErrors = error.data?.errors || {};
      const mapped = Object.entries(serverErrors).reduce((result, [key, messages]) => {
        const field = FIELD_KEYS[key];
        if (field) result[field] = Array.isArray(messages) ? messages[0] : String(messages);
        return result;
      }, {});
      setErrors(mapped);
      setAlert(Object.keys(mapped).length ? '' : error.message || 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <AuthAbout />
      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <div className="page-head">
          <h2 className="t-page">Daftar sebagai siswa</h2>
          <p className="t-muted">Buat akun untuk melaporkan dan memantau fasilitas sekolah.</p>
        </div>

        {alert && <Toast type="error" title="Pendaftaran gagal" message={alert} onClose={() => setAlert('')} />}

        <div className="auth__fields">
          <Input label="Nama lengkap" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="NISN" inputMode="numeric" maxLength={10} autoComplete="username"
            value={form.nisn} onChange={(event) => setForm((current) => ({ ...current, nisn: event.target.value.replace(/\D/g, '') }))}
            error={errors.nisn} />
          <Input label="Kelas" placeholder="Contoh: XII.PPLG.1" value={form.kelas} onChange={set('kelas')} error={errors.kelas} />
          <PasswordInput label="Password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
          <PasswordInput label="Konfirmasi password" autoComplete="new-password" value={form.password_confirmation}
            onChange={set('password_confirmation')} error={errors.password_confirmation} />
          <Button type="submit" block loading={loading}>Daftar</Button>
        </div>

        <div className="auth__switch">
          <Link to="/" className="link-strong">Sudah punya akun? Masuk</Link>
        </div>
      </form>
    </div>
  );
}
