import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Info, Upload, Trash2, ImageIcon, CircleAlert } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { Select, Textarea } from '../../components/ui/Field.jsx';
import { createReport, getKategori, getKuota } from '../../services/reports.js';

const URGENSI = [
  { value: 'rendah', desc: 'Tidak mengganggu kegiatan belajar.' },
  { value: 'sedang', desc: 'Menghambat sebagian kegiatan.' },
  { value: 'mendesak', desc: 'Berisiko terhadap keselamatan.' },
];
const MAX_FOTO = 2;
const MAX_MB = 5;
const ukuran = (b) => `${(b / 1048576).toFixed(1).replace('.', ',')} MB`;

export default function BuatLaporan() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [kategori, setKategori] = useState({});
  const [kategoriError, setKategoriError] = useState('');
  const [kuota, setKuota] = useState(null);
  const [kuotaError, setKuotaError] = useState('');
  const [form, setForm] = useState({ kategori: '', lokasi: '', jenis: '', deskripsi: '', urgensi: '' });
  const [foto, setFoto] = useState([]); // [{ file, url }]
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const fotoRef = useRef(foto);
  fotoRef.current = foto;

  useEffect(() => {
    getKategori().then((data) => {
      setKategori(data);
      setKategoriError(Object.keys(data).length ? '' : 'Belum ada pilihan lokasi yang tersedia.');
    }).catch((e) => setKategoriError(e.message || 'Pilihan lokasi gagal dimuat.'));
    getKuota().then((data) => { setKuota(data); setKuotaError(''); })
      .catch((e) => setKuotaError(e.message || 'Kuota gagal dimuat.'));
  }, []);
  useEffect(() => () => fotoRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pilihKategori = (e) => setForm((f) => ({ ...f, kategori: e.target.value, lokasi: '', jenis: '' }));
  const opsi = kategori[form.kategori] || {};
  const lokasi = opsi.lokasi || [];
  const jenis = opsi.jenis || [];
  const namaOpsi = (items) => items.map((item) => typeof item === 'string' ? item : item.label).join(', ');
  const habis = kuota && kuota.sisa === 0;
  const loadWarnings = [kategoriError, kuotaError].filter(Boolean).join(' ');

  const tambahFoto = (e) => {
    const err = [];
    const next = [...foto];
    Array.from(e.target.files).forEach((file) => {
      if (next.length >= MAX_FOTO) return err.push(`Maksimal ${MAX_FOTO} foto.`);
      if (!['image/jpeg', 'image/png'].includes(file.type)) return err.push(`${file.name}: format harus JPG atau PNG.`);
      if (file.size > MAX_MB * 1048576) return err.push(`${file.name}: ukuran melebihi ${MAX_MB} MB.`);
      next.push({ file, url: URL.createObjectURL(file) });
    });
    setFoto(next);
    setErrors((x) => ({ ...x, foto: err[0] }));
    e.target.value = '';
  };
  const hapusFoto = (i) => {
    URL.revokeObjectURL(foto[i].url);
    setFoto(foto.filter((_, idx) => idx !== i));
  };

  const validasi = () => {
    const e = {};
    if (!form.kategori) e.kategori = 'Kategori fasilitas wajib dipilih';
    if (!form.lokasi) e.lokasi = 'Lokasi spesifik wajib dipilih';
    if (!form.jenis) e.jenis = 'Jenis fasilitas wajib dipilih';
    if (form.deskripsi.trim().length < 10) e.deskripsi = 'Deskripsi minimal 10 karakter';
    if (foto.length === 0) e.foto = 'Foto bukti wajib diunggah';
    if (!form.urgensi) e.urgensi = 'Tingkat urgensi wajib dipilih';
    return e;
  };

  const kirim = async (e) => {
    e.preventDefault();
    if (habis) return;
    const err = validasi();
    setErrors(err);
    if (Object.keys(err).length) return;
    setSending(true);
    setToast(null);
    try {
      const r = await createReport({ ...form, foto: foto.map((f) => f.file) });
      navigate('/siswa/riwayat', {
        state: { toast: { title: 'Laporan berhasil dikirim', message: `Laporan #${r.id} menunggu verifikasi pengelola.` } },
      });
    } catch (ex) {
      const isValidationError = [422, 429].includes(ex.status);
      setToast({ title: 'Laporan belum terkirim', message: isValidationError ? ex.message : 'Periksa koneksi Anda, lalu coba kembali.' });
      getKuota().then((data) => { setKuota(data); setKuotaError(''); })
        .catch((e) => setKuotaError(e.message || 'Kuota gagal dimuat.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={kirim} noValidate style={{ display: 'contents' }}>
      {toast && (
        <div className="toast-stack">
          <Toast type="error" title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-top">
        <p className="crumb"><Link to="/siswa">Dashboard</Link> / Buat laporan</p>
        <div className="page-head">
          <h1 className="t-page">Buat laporan baru</h1>
          <p className="t-muted">Jelaskan kendala fasilitas agar pengelola dapat menindaklanjutinya.</p>
        </div>
      </div>

      {loadWarnings && (
        <div className="banner banner--warn"><CircleAlert size={20} /><p>{loadWarnings}</p></div>
      )}

      {kuota && (
        <div className={`banner banner--compact ${habis ? 'banner--warn' : ''}`}>
          <Info size={20} />
          <p>{habis ? 'Kuota laporan hari ini sudah tercapai. Anda dapat membuat laporan lagi besok pukul 00.00.'
            : `Sisa ${kuota.sisa} dari ${kuota.limit} laporan hari ini`}</p>
        </div>
      )}

      <div className="split">
        <div className="split__main">
          <section className="card">
            <h2 className="t-sub">Informasi fasilitas</h2>
            <Select label="Lokasi *" value={form.kategori} onChange={pilihKategori} disabled={Boolean(kategoriError)}
              placeholder="Pilih kategori" options={Object.keys(kategori)} error={errors.kategori}
              hint={`Pilihan dari admin: ${Object.keys(kategori).join(', ')}.`} />
            <Select label="Lokasi Spesifik *" value={form.lokasi} onChange={set('lokasi')} disabled={!form.kategori}
              placeholder="Pilih lokasi" options={lokasi} error={errors.lokasi}
              hint={form.kategori ? `Untuk ${form.kategori}: ${namaOpsi(lokasi)}. Pilihan mengikuti kategori.` : 'Pilih kategori terlebih dahulu.'} />
            <Select label="Jenis Fasilitas *" value={form.jenis} onChange={set('jenis')} disabled={!form.kategori}
              placeholder="Pilih jenis" options={jenis} error={errors.jenis}
              hint={form.kategori ? `${namaOpsi(jenis)}. Pilihan mengikuti kategori.` : 'Pilih kategori terlebih dahulu.'} />
          </section>

          <section className="card">
            <h2 className="t-sub">Deskripsi dan bukti</h2>
            <Textarea label="Deskripsi Masalah *" value={form.deskripsi} onChange={set('deskripsi')}
              placeholder="Jelaskan masalah fasilitas..." error={errors.deskripsi}
              hint="Tuliskan kondisi, letak, dan dampak masalah dengan jelas." />

            <div className={`field ${errors.foto ? 'field--error' : ''}`}>
              <label className="field__label">Foto bukti *</label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" multiple hidden onChange={tambahFoto} />
              <button type="button" className="upload" onClick={() => fileRef.current.click()} disabled={foto.length >= MAX_FOTO}>
                <Upload size={24} />
                <div><strong>Pilih foto bukti</strong><span>JPG atau PNG, maks. {MAX_MB} MB per berkas</span></div>
              </button>
              {foto.map((f, i) => (
                <div className="file-row" key={f.url}>
                  <img className="thumb" src={f.url} alt="" />
                  <div className="file-row__info"><b>{f.file.name}</b><span>{ukuran(f.file.size)} • Terunggah</span></div>
                  <button type="button" className="toast__close" onClick={() => hapusFoto(i)} aria-label={`Hapus ${f.file.name}`}><Trash2 size={18} /></button>
                </div>
              ))}
              {errors.foto ? <p className="field__error">{errors.foto}</p>
                : <p className="field__hint">{foto.length}/{MAX_FOTO} foto • Maksimal {MAX_FOTO} berkas</p>}
            </div>
          </section>

          <section className={`card ${errors.urgensi ? 'field--error' : ''}`}>
            <h2 className="t-sub">Tingkat urgensi *</h2>
            <div className="urgency" role="radiogroup">
              {URGENSI.map((u) => (
                <button type="button" key={u.value} role="radio" aria-checked={form.urgensi === u.value}
                  className={`urgency__card ${form.urgensi === u.value ? 'selected' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, urgensi: u.value }))}>
                  <div className="urgency__top"><Badge type={u.value} /><span className="radio" /></div>
                  <p>{u.desc}</p>
                </button>
              ))}
            </div>
            {errors.urgensi && <p className="field__error">{errors.urgensi}</p>}
          </section>

          <p className="footnote">Dengan mengirim laporan, Anda memastikan informasi dan foto yang dilampirkan sesuai dengan kondisi sebenarnya. * Wajib diisi.</p>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Batal</Button>
            <Button type="submit" loading={sending} disabled={habis}>{sending ? 'Mengirim...' : 'Kirim Laporan'}</Button>
          </div>
        </div>

        <aside className="split__side">
          <section className="card">
            <h2 className="t-sub">Laporan yang baik</h2>
            <div className="guide-step"><b>1. Pilih lokasi yang tepat</b><span>Pastikan kategori dan ruang sesuai dengan fasilitas.</span></div>
            <div className="guide-step"><b>2. Sertakan foto yang jelas</b><span>Ambil foto kerusakan dan area sekitarnya.</span></div>
            <div className="guide-step"><b>3. Pilih urgensi yang sesuai</b><span>Pengelola memverifikasi prioritas penanganan.</span></div>
          </section>
          <p className="footnote">Laporan hanya terlihat oleh Anda dan petugas terkait. Pantau perkembangannya melalui Riwayat Laporan.</p>
        </aside>
      </div>
    </form>
  );
}
