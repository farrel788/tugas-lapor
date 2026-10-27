import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImageIcon, Trash2, Upload } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { Select, Textarea } from '../../components/ui/Field.jsx';
import Tracking from '../../components/report/Tracking.jsx';
import { useAuth } from '../../services/auth.jsx';
import { getTugas, updateTugas } from '../../services/teknisi.js';

const STATUS = [{ value: 'diproses', label: 'Diproses' }, { value: 'selesai', label: 'Selesai' }];
const MAX_FOTO = 2;
const MAX_MB = 5;
const ukuran = (b) => `${(b / 1048576).toFixed(1).replace('.', ',')} MB`;
const Info = ({ label, value }) => <div className="info-item"><span>{label}</span><b>{value}</b></div>;

export default function DetailTugasTeknisi() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [t, setT] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('diproses');
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState([]);
  const fotoRef = useRef(foto);
  fotoRef.current = foto;
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => () => fotoRef.current.forEach((file) => URL.revokeObjectURL(file.url)), []);

  useEffect(() => {
    setT(null); setNotFound(false); setLoadError('');
    getTugas(id, user.name)
      .then((d) => { setT(d); setStatus(d.status === 'selesai' ? 'selesai' : 'diproses'); setCatatan(d.catatanTeknisi?.teks || ''); })
      .catch((e) => {
        if (e.status === 404) setNotFound(true);
        else setLoadError(e.message || 'Tugas gagal dimuat.');
      });
  }, [id, user.name]);

  const tambahFoto = (e) => {
    let err = '';
    const next = [...foto];
    Array.from(e.target.files).forEach((file) => {
      if (next.length >= MAX_FOTO) { err = `Maksimal ${MAX_FOTO} foto.`; return; }
      if (!['image/jpeg', 'image/png'].includes(file.type)) { err = `${file.name}: format harus JPG atau PNG.`; return; }
      if (file.size > MAX_MB * 1048576) { err = `${file.name}: ukuran melebihi ${MAX_MB} MB.`; return; }
      next.push({ file, url: URL.createObjectURL(file) });
    });
    setFoto(next);
    setErrors((x) => ({ ...x, foto: err }));
    e.target.value = '';
  };
  const hapusFoto = (i) => { URL.revokeObjectURL(foto[i].url); setFoto(foto.filter((_, idx) => idx !== i)); };

  const simpan = async () => {
    const err = {};
    if (status === 'selesai') {
      if (!catatan.trim()) err.catatan = 'Catatan perbaikan wajib diisi untuk menyelesaikan tugas';
      if (foto.length < 1) err.foto = 'Minimal satu foto hasil perbaikan';
    }
    setErrors(err);
    if (Object.keys(err).length) return;
    setSaving(true);
    try {
      const d = await updateTugas(id, user.name, { status, catatan, jumlahFoto: foto.length });
      setT(d);
      setToast({ type: 'success', title: 'Pembaruan tersimpan', message: `Tugas #${d.id} kini berstatus ${d.status === 'selesai' ? 'Selesai' : 'Diproses'}.` });
    } catch (e) {
      setToast({ type: 'error', title: 'Pembaruan belum tersimpan', message: e.message });
    } finally { setSaving(false); }
  };

  if (loadError) {
    return <div className="card"><EmptyState title="Tugas gagal dimuat" message={loadError}
      action={<Button variant="secondary" onClick={() => navigate('/teknisi')}>Kembali ke Dashboard</Button>} /></div>;
  }
  if (notFound) {
    return <div className="card"><EmptyState title="Tugas tidak ditemukan" message="Tugas ini tidak ada atau bukan ditugaskan kepada Anda."
      action={<Button variant="secondary" onClick={() => navigate('/teknisi')}>Kembali ke Dashboard</Button>} /></div>;
  }
  if (!t) return <><Skeleton height={96} width={360} /><Skeleton height={520} /></>;

  const selesai = t.status === 'selesai';

  return (
    <>
      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-top">
        <p className="crumb"><Link to="/teknisi">Dashboard</Link> / <Link to="/teknisi/tugas">Tugas Saya</Link> / Detail tugas</p>
        <div className="page-head">
          <h1 className="t-page">Detail tugas #{t.id}</h1>
          <p className="t-muted">{t.judul}</p>
        </div>
      </div>
      <div className="badges"><Badge type={t.status} /><Badge type={t.urgensi} /></div>

      <div className="split">
        <div className="split__main">
          <section className="card">
            <h2 className="t-sub">Informasi laporan</h2>
            <div className="info-grid">
              <Info label="Pelapor" value={t.pelapor} />
              <Info label="Kelas siswa" value={t.kelasPelapor} />
              <Info label="Kategori / Lokasi" value={`${t.kategori} / ${t.lokasi}`} />
              <Info label="Jenis Fasilitas" value={t.jenis} />
            </div>
            <Info label="Dilaporkan / Ditugaskan" value={`${t.tanggalLengkap} / ${t.waktuProses || t.diperbarui}`} />
            <p>{t.deskripsi}</p>
          </section>

          {t.foto.length > 0 && (
            <section className="card">
              <h2 className="t-sub">Foto bukti siswa</h2>
              <div className="photos">
                {t.foto.map((f) => f.url
                  ? <img key={f.nama} className="photo" src={f.url} alt={f.nama} />
                  : <div key={f.nama} className="photo" role="img" aria-label={f.nama}><ImageIcon size={32} /></div>)}
              </div>
              <p className="footnote">{t.foto.map((f) => f.nama).join(' • ')}</p>
            </section>
          )}

          {t.catatan && (
            <section className="card">
              <h2 className="t-sub">Catatan penugasan</h2>
              <p>{t.catatan.teks}</p>
              <p className="footnote">{t.catatan.oleh} • {t.catatan.waktu}</p>
            </section>
          )}

          <section className="card">
            <h2 className="t-sub">Riwayat penanganan</h2>
            <Tracking stages={t.tracking} />
          </section>
        </div>

        <aside className="split__side--tek">
          <section className="card">
            <h2 className="t-sub">Update status tugas</h2>
            {selesai ? (
              <>
                <p className="t-muted">Tugas ini sudah diselesaikan pada {t.diperbarui}. Hasilnya terlihat oleh pengelola dan siswa.</p>
                {t.hasil && <p>{t.hasil.teks}</p>}
              </>
            ) : (
              <>
                <p className="footnote">Anda bertugas sebagai {user.name}. Pembaruan akan terlihat oleh pengelola dan siswa.</p>
                <Select label="Status penanganan" options={STATUS} value={status} onChange={(e) => setStatus(e.target.value)}
                  hint="Pilihan: Diproses atau Selesai." />
                <Textarea label="Catatan perbaikan" value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tulis perkembangan perbaikan..." error={errors.catatan} />

                <div className={`field ${errors.foto ? 'field--error' : ''}`}>
                  <label className="field__label">Unggah foto hasil perbaikan</label>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" multiple hidden onChange={tambahFoto} />
                  <button type="button" className="upload" onClick={() => fileRef.current.click()} disabled={foto.length >= MAX_FOTO}>
                    <Upload size={24} />
                    <div><strong>Pilih foto hasil perbaikan</strong><span>JPG atau PNG, maks. {MAX_MB} MB per berkas</span></div>
                  </button>
                  {foto.map((x, i) => (
                    <div className="file-row" key={x.url}>
                      <img className="thumb" src={x.url} alt="" />
                      <div className="file-row__info"><b>{x.file.name}</b><span>{ukuran(x.file.size)} • Terunggah</span></div>
                      <button type="button" className="toast__close" onClick={() => hapusFoto(i)} aria-label={`Hapus ${x.file.name}`}><Trash2 size={18} /></button>
                    </div>
                  ))}
                  {errors.foto ? <p className="field__error">{errors.foto}</p> : <p className="field__hint">{foto.length}/{MAX_FOTO} foto • Maksimal {MAX_FOTO} berkas</p>}
                </div>

                <p className="footnote">Untuk menyelesaikan tugas, sertakan catatan dan minimal satu foto hasil perbaikan.</p>
                <Button block loading={saving} onClick={simpan}>Simpan pembaruan</Button>
              </>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
