import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Info, Send, ImageIcon } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Tracking from '../../components/report/Tracking.jsx';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { Textarea } from '../../components/ui/Field.jsx';
import { getReport, sendMessage } from '../../services/reports.js';

const Info1 = ({ label, value }) => (
  <div className="info-item"><span>{label}</span><b>{value}</b></div>
);

export default function DetailLaporan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [pesan, setPesan] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setR(null); setNotFound(false); setLoadError('');
    getReport(id).then(setR).catch((e) => {
      if (e.status === 404) setNotFound(true);
      else setLoadError(e.message || 'Laporan gagal dimuat.');
    });
  }, [id]);

  const kirim = async () => {
    if (!pesan.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(id, pesan.trim());
      setR((cur) => ({ ...cur, diskusi: [...cur.diskusi, msg] }));
      setPesan('');
    } catch (e) {
      setToast({ type: 'error', title: 'Pesan belum terkirim', message: e.message || 'Coba lagi.' });
    } finally { setSending(false); }
  };

  if (loadError) {
    return <div className="card"><EmptyState title="Laporan gagal dimuat" message={loadError}
      action={<Button variant="secondary" onClick={() => navigate('/siswa/riwayat')}>Kembali ke Riwayat</Button>} /></div>;
  }
  if (notFound) {
    return (
      <div className="card"><EmptyState title="Laporan tidak ditemukan" message="Laporan ini tidak ada atau bukan milik Anda."
        action={<Button variant="secondary" onClick={() => navigate('/siswa/riwayat')}>Kembali ke Riwayat</Button>} /></div>
    );
  }
  if (!r) return <><Skeleton height={96} width={360} /><Skeleton height={480} /></>;

  return (
    <>
      {toast && <div className="toast-stack"><Toast {...toast} onClose={() => setToast(null)} /></div>}
      <div className="page-top">
        <p className="crumb"><Link to="/siswa/riwayat">Riwayat Laporan</Link> / Detail laporan</p>
        <div className="page-head">
          <h1 className="t-page">Laporan #{r.id}</h1>
          <p className="t-muted">{r.judul}</p>
        </div>
      </div>
      <div className="badges"><Badge type={r.status} /><Badge type={r.urgensi} /></div>

      <div className="split">
        <div className="split__main">
          <section className="card">
            <h2 className="t-sub">Informasi laporan</h2>
            <div className="info-grid">
              <Info1 label="Pelapor" value={r.pelapor} />
              <Info1 label="Kelas pelapor" value={r.kelasPelapor} />
              <Info1 label="Lokasi" value={r.kategori} />
              <Info1 label="Lokasi Spesifik" value={r.lokasi} />
              <Info1 label="Jenis Fasilitas" value={r.jenis} />
              <Info1 label="Tanggal dilaporkan" value={r.tanggalLengkap} />
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
              <h2 className="t-sub">Catatan pengelola</h2>
              <p>{r.catatan.teks}</p>
              <p className="footnote">{r.catatan.oleh} • {r.catatan.waktu}</p>
            </section>
          )}

          {r.hasil && (
            <section className="card">
              <h2 className="t-sub">Hasil perbaikan</h2>
              <p>{r.hasil.teks}</p>
              <p className="footnote">{r.hasil.waktu}</p>
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
                <Button variant="secondary" icon={Send} loading={sending} disabled={!pesan.trim()} onClick={kirim}>Kirim</Button>
              </div>
            </div>
          </section>
        </div>

        <aside className="split__side split__side--wide">
          <section className="card">
            <h2 className="t-sub">Tracking laporan</h2>
            <Tracking stages={r.tracking} />
          </section>
          {r.teknisi && (
            <section className="card">
              <h2 className="t-sub">Teknisi penanggung jawab</h2>
              <b>{typeof r.teknisi === 'string' ? r.teknisi : r.teknisi.nama ?? r.teknisi.name}</b>
              <p className="footnote">{r.teknisiInfo || (typeof r.teknisi === 'object' ? r.teknisi.info : '')}</p>
            </section>
          )}
          <div className="hint-row"><Info size={18} /><p>Perubahan status dan balasan pengelola juga dikirim melalui notifikasi.</p></div>
        </aside>
      </div>
    </>
  );
}
