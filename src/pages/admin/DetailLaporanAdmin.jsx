import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImageIcon, Send, Trash2, Upload } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { Select, Textarea } from '../../components/ui/Field.jsx';
import Tracking from '../../components/report/Tracking.jsx';
import { assignTeknisi, getAdminReport, listTeknisi, sendAdminMessage, updateStatus } from '../../services/admin.js';

const STATUS = [['pending', 'Pending'], ['diproses', 'Diproses'], ['selesai', 'Selesai'], ['ditolak', 'Ditolak']].map(([value, label]) => ({ value, label }));
const MAX_FOTO = 2;
const MAX_MB = 5;
const ukuran = (b) => `${(b / 1048576).toFixed(1).replace('.', ',')} MB`;

const Info = ({ label, value }) => <div className="info-item"><span>{label}</span><b>{value}</b></div>;

export default function DetailLaporanAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [r, setR] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [teknisiList, setTeknisiList] = useState([]);
  const [teknisi, setTeknisi] = useState('');
  const [status, setStatus] = useState('pending');
  const [catatan, setCatatan] = useState('');
  const [errors, setErrors] = useState({});
  const [foto, setFoto] = useState([]);
  const [pesan, setPesan] = useState('');
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setR(null); setNotFound(false);
    getAdminReport(id).then((d) => { setR(d); setTeknisi(d.teknisi || ''); setStatus(d.status); }).catch(() => setNotFound(true));
    listTeknisi().then(setTeknisiList).catch(() => {});
  }, [id]);

  const tampil = (type, title, message) => setToast({ type, title, message });

  const tugaskan = async () => {
    setBusy('tugas');
    try {
      const d = await assignTeknisi(id, teknisi);
      setR(d); setStatus(d.status);
      tampil('success', 'Teknisi ditugaskan', `${teknisi} ditugaskan untuk laporan #${d.id}.`);
    } catch (e) { tampil('error', 'Gagal menugaskan teknisi', e.message); } finally { setBusy(''); }
  };

  const simpanStatus = async () => {
    if (status === 'ditolak' && !catatan.trim()) return setErrors({ catatan: 'Alasan penolakan wajib diisi' });
    setErrors({});
    setBusy('status');
    try {
      const d = await updateStatus(id, { status, catatan });
      setR(d); setCatatan('');
      tampil('success', 'Status diperbarui', `Laporan #${d.id} kini berstatus ${STATUS.find((s) => s.value === d.status).label}.`);
    } catch (e) { tampil('error', 'Gagal menyimpan status', e.message); } finally { setBusy(''); }
  };

  const kirimPesan = async () => {
    if (!pesan.trim()) return;
    setBusy('pesan');
    try {
      const msg = await sendAdminMessage(id, pesan.trim());
      setR((cur) => ({ ...cur, diskusi: [...cur.diskusi, msg] }));
      setPesan('');
    } catch (e) { tampil('error', 'Pesan belum terkirim', e.message); } finally { setBusy(''); }
  };

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

  if (notFound) {
    return <div className="card"><EmptyState title="Laporan tidak ditemukan" message="Laporan ini tidak ada atau sudah dihapus."
      action={<Button variant="secondary" onClick={() => navigate('/admin/laporan')}>Kembali ke Laporan</Button>} /></div>;
  }
  if (!r) return <><Skeleton height={96} width={360} /><Skeleton height={520} /></>;

  return (
    <>
      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-top">
        <p className="crumb"><Link to="/admin/laporan">Laporan</Link> / Detail laporan</p>
        <div className="page-head">
          <h1 className="t-page">Laporan #{r.id}</h1>
          <p className="t-muted">{r.judul}</p>
        </div>
      </div>
      <div className="badges" style={{ alignItems: 'center' }}>
        <Badge type={r.status} /><Badge type={r.urgensi} />
        <span className="t-caption">Diperbarui {r.diperbarui}</span>
      </div>

      <div className="split">
        <div className="split__main">
          <section className="card">
            <h2 className="t-sub">Informasi laporan</h2>
            <div className="info-grid">
              <Info label="Nama siswa" value={r.pelapor} />
              <Info label="NISN / Kelas" value={`${r.nisn} / ${r.kelasPelapor}`} />
              <Info label="Lokasi" value={r.kategori} />
              <Info label="Lokasi Spesifik" value={r.lokasi} />
              <Info label="Jenis Fasilitas" value={r.jenis} />
              <Info label="Tanggal dilaporkan" value={r.tanggalLengkap} />
            </div>
            <div className="info-item"><span>Deskripsi Masalah</span><p>{r.deskripsi}</p></div>
          </section>

          {r.foto.length > 0 && (
            <section className="card">
              <h2 className="t-sub">Foto bukti laporan</h2>
              <div className="photos">
                {r.foto.map((f) => f.url
                  ? <img key={f.nama} className="photo" src={f.url} alt={f.nama} />
                  : <div key={f.nama} className="photo" role="img" aria-label={f.nama}><ImageIcon size={32} /></div>)}
              </div>
              <p className="footnote">{r.foto.map((f) => f.nama).join(' • ')}</p>
            </section>
          )}

          {r.catatan && (
            <section className="card">
              <h2 className="t-sub">Catatan dan tanggapan</h2>
              <p>{r.catatan.teks}</p>
              <p className="footnote">{r.catatan.oleh} • {r.catatan.waktu}</p>
            </section>
          )}

          {r.catatanTeknisi && (
            <section className="card">
              <h2 className="t-sub">Catatan teknisi</h2>
              <p>{r.catatanTeknisi.teks}</p>
              <p className="footnote">{r.catatanTeknisi.oleh} • {r.catatanTeknisi.waktu}</p>
            </section>
          )}

          <section className="card">
            <h2 className="t-sub">Diskusi laporan</h2>
            <p className="footnote">Percakapan antara siswa dan pengelola sekolah.</p>
            <div className="chat">
              {r.diskusi.length === 0 && <p className="footnote">Belum ada pesan.</p>}
              {r.diskusi.map((m, i) => (
                <div key={i} className={`msg ${m.dari === 'siswa' ? 'msg--own' : ''}`}>
                  <span className="msg__meta">{m.nama} • {m.waktu}</span>
                  <div className="bubble">{m.teks}</div>
                </div>
              ))}
            </div>
            <div className="chat-form">
              <Textarea label="Pesan Anda" placeholder="Tulis tanggapan..." value={pesan} onChange={(e) => setPesan(e.target.value)} />
              <div className="chat-form__row">
                <p className="footnote">Jangan bagikan informasi pribadi.</p>
                <Button variant="secondary" icon={Send} loading={busy === 'pesan'} disabled={!pesan.trim()} onClick={kirimPesan}>Kirim</Button>
              </div>
            </div>
          </section>
        </div>

        <aside className="split__side--admin">
          <section className="card">
            <h2 className="t-sub">Tunjuk Teknisi</h2>
            <Select label="Teknisi penanggung jawab" placeholder="Pilih teknisi" options={teknisiList} value={teknisi}
              onChange={(e) => setTeknisi(e.target.value)} hint={`Pilihan: ${teknisiList.join(', ')}.`} />
            <Button variant="secondary" block loading={busy === 'tugas'} disabled={!teknisi || teknisi === r.teknisi} onClick={tugaskan}>Tugaskan</Button>
            {r.ditugaskan && <p className="footnote">{r.ditugaskan}</p>}
          </section>

          <section className="card">
            <h2 className="t-sub">Ubah Status</h2>
            <Select label="Status laporan" options={STATUS} value={status} onChange={(e) => setStatus(e.target.value)}
              hint="Pending, Diproses, Selesai, Ditolak." />
            <Textarea label="Catatan / Tanggapan" value={catatan} onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tulis catatan untuk siswa..." error={errors.catatan} hint="Wajib menyertakan alasan jika laporan ditolak." />
            <Button block loading={busy === 'status'} onClick={simpanStatus}>Simpan</Button>
          </section>

          <section className="card">
            <h2 className="t-sub">Unggah Bukti Hasil Perbaikan</h2>
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
            <p className="footnote">Pratinjau berkas. Bukti ditampilkan kepada siswa setelah status Selesai disimpan.</p>
          </section>

          <section className="card">
            <h2 className="t-sub">Riwayat status</h2>
            <Tracking stages={r.tracking} />
          </section>
        </aside>
      </div>
    </>
  );
}
