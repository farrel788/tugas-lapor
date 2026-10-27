import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthAbout from '../components/layout/AuthAbout.jsx';
import Button from '../components/ui/Button.jsx';
import Toast from '../components/ui/Toast.jsx';
import { Input, PasswordInput } from '../components/ui/Field.jsx';
import { loginSiswa } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';

export default function LoginSiswa() {
  const [form, setForm] = useState({ nisn: '', password: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.registrationNotice || '');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.nisn.trim()) next.nisn = 'NISN wajib diisi';
    else if (!/^\d{10}$/.test(form.nisn)) next.nisn = 'NISN harus 10 digit angka';
    if (!form.password) next.password = 'Password wajib diisi';
    setErrors(next);
    setAlert('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const data = await loginSiswa({ nisn: form.nisn, password: form.password });
      login({ token: data.token, user: { ...data.user, role: 'siswa' } });
      navigate('/siswa');
    } catch (err) {
      setAlert(
        [401, 404, 422].includes(err.status)
          ? 'NISN atau password salah. Periksa kembali data Anda.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <AuthAbout />
      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <div className="page-head">
          <h2 className="t-page">Masuk sebagai siswa</h2>
          <p className="t-muted">Gunakan NISN dan password Anda untuk melaporkan dan memantau fasilitas sekolah.</p>
        </div>

        {alert && <Toast type="error" title="Tidak dapat masuk" message={alert} onClose={() => setAlert('')} />}
        {notice && <Toast type="success" title="Pendaftaran berhasil" message={notice} onClose={() => setNotice('')} />}

        <div className="auth__fields">
          <Input
            label="NISN" inputMode="numeric" maxLength={10} placeholder="Masukkan 10 digit NISN"
            value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value.replace(/\D/g, '') })}
            error={errors.nisn}
          />
          <PasswordInput
            label="Password" autoComplete="current-password" placeholder="Masukkan password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          <Button type="submit" block loading={loading}>Masuk</Button>
        </div>

        <div className="auth__switch">
          <Link to="/register" className="link-strong">Belum punya akun? Daftar</Link>
          <Link to="/petugas/login" className="link-strong">Masuk sebagai petugas</Link>
          <p className="t-caption">Kesulitan masuk? Hubungi admin sekolah.</p>
        </div>
      </form>
    </div>
  );
}
