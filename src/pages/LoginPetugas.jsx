import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthAbout from '../components/layout/AuthAbout.jsx';
import Button from '../components/ui/Button.jsx';
import Toast from '../components/ui/Toast.jsx';
import { Input, PasswordInput } from '../components/ui/Field.jsx';
import { loginPetugas } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';

export default function LoginPetugas() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = 'Email wajib diisi';          // frame: Validasi kosong
    if (!form.password) next.password = 'Password wajib diisi';
    setErrors(next);
    setAlert('');
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const data = await loginPetugas({ email: form.email.trim(), password: form.password });
      login({ token: data.token, user: data.user });
      navigate(data.user.role === 'teknisi' ? '/teknisi' : '/admin');
    } catch (err) {
      // frame: Kredensial salah
      setAlert(err.status === 401 || err.status === 422 ? 'Email atau password salah. Periksa kembali data Anda.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <AuthAbout />
      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <div className="page-head">
          <h2 className="t-page">Masuk sebagai petugas</h2>
          <p className="t-muted">Untuk Admin / Sarpras dan Teknisi. Gunakan akun petugas yang telah terdaftar.</p>
        </div>

        {alert && <Toast type="error" title="Tidak dapat masuk" message={alert} onClose={() => setAlert('')} />}

        <div className="auth__fields">
          <Input label="Email" type="email" autoComplete="username" placeholder="nama@sekolah.sch.id"
            value={form.email} onChange={set('email')} error={errors.email} />
          <PasswordInput label="Password" autoComplete="current-password" placeholder="Masukkan password"
            value={form.password} onChange={set('password')} error={errors.password} />
          <Button type="submit" block loading={loading}>Masuk</Button>
        </div>

        <div className="auth__switch">
          <Link to="/" className="link-strong">Masuk sebagai siswa</Link>
          <p className="t-caption">Kesulitan masuk? Hubungi admin sekolah.</p>
        </div>
      </form>
    </div>
  );
}
