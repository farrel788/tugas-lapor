import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthAbout from '../components/layout/AuthAbout.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Field.jsx';
import { loginSiswa } from '../services/api.js';
import { useAuth } from '../services/auth.jsx';

export default function LoginSiswa() {
  const [nisn, setNisn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!nisn.trim()) return setError('NISN wajib diisi');
    if (!/^\d{10}$/.test(nisn)) return setError('NISN harus 10 digit angka');
    setError('');
    setLoading(true);
    try {
      const data = await loginSiswa(nisn);
      login({ token: data.token, user: { ...data.user, role: 'siswa' } });
      navigate('/siswa');
    } catch (err) {
      setError(err.status === 404 || err.status === 401 ? 'NISN tidak ditemukan' : err.message);
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
          <p className="t-muted">Gunakan NISN Anda untuk melaporkan dan memantau fasilitas sekolah.</p>
        </div>
        <div className="auth__fields">
          <Input
            label="NISN" inputMode="numeric" maxLength={10} placeholder="Masukkan 10 digit NISN"
            value={nisn} onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
            error={error} hint="Tidak perlu password. NISN terdaftar melalui sekolah."
          />
          <Button type="submit" block loading={loading}>Masuk</Button>
        </div>
        <div className="auth__switch">
          <Link to="/petugas/login" className="link-strong">Masuk sebagai petugas</Link>
          <p className="t-caption">Kesulitan masuk? Hubungi admin sekolah.</p>
        </div>
      </form>
    </div>
  );
}
