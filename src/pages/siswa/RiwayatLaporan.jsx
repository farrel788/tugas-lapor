import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import Toast from '../../components/ui/Toast.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import ReportTable from '../../components/report/ReportTable.jsx';
import { useAuth } from '../../services/auth.jsx';
import { listReports } from '../../services/reports.js';

const TABS = [
  { value: 'semua', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
];
const PER_PAGE = 10;

export default function RiwayatLaporan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('semua');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(location.state?.toast || null); // state "Berhasil dikirim"

  useEffect(() => {
    listReports().then(setReports).catch((e) => {
      setLoadError(e.message || 'Riwayat laporan gagal dimuat.');
      setReports([]);
    });
  }, []);
  useEffect(() => { setPage(1); }, [tab, q]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase().replace('#', '');
    return (reports || []).filter((r) =>
      (tab === 'semua' || r.status === tab) &&
      (!kw || String(r.id).includes(kw) || r.judul.toLowerCase().includes(kw)));
  }, [reports, tab, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const visible = filtered.slice(start, start + PER_PAGE);

  const baru = <Button icon={Plus} onClick={() => navigate('/siswa/buat-laporan')}>Buat Laporan Baru</Button>;

  return (
    <>
      {toast && (
        <div className="toast-stack">
          <Toast type="success" title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-title-row">
        <div className="page-head">
          <h1 className="t-page">Riwayat laporan</h1>
          <p className="t-muted">Semua laporan yang Anda kirim, beserta perkembangan terbarunya.</p>
        </div>
        {baru}
      </div>

      {reports === null ? (
        <Skeleton height={320} />
      ) : loadError ? (
        <div className="card"><EmptyState title="Riwayat gagal dimuat" message={loadError} /></div>
      ) : reports.length === 0 ? (
        <div className="card"><EmptyState title="Belum ada laporan" message="Laporan yang Anda kirim akan muncul di sini."
          action={<Button icon={Plus} onClick={() => navigate('/siswa/buat-laporan')}>Buat Laporan Baru</Button>} /></div>
      ) : (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Tabs tabs={TABS} value={tab} onChange={setTab} />
          <div className="toolbar">
            <label className="search">
              <Search size={18} />
              <input placeholder="Cari ID atau laporan..." value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            <p className="footnote" style={{ whiteSpace: 'nowrap' }}>Hanya laporan milik {user?.name}</p>
          </div>

          {visible.length === 0 ? (
            <div className="card"><EmptyState title="Tidak ada hasil" message="Coba ganti filter atau kata kunci pencarian." /></div>
          ) : (
            <ReportTable reports={visible} />
          )}

          <div className="pagination">
            <p className="footnote">
              {filtered.length === 0 ? 'Tidak ada laporan' : `Menampilkan ${start + 1}–${start + visible.length} dari ${filtered.length} laporan`}
            </p>
            <div className="pagination__pages">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Sebelumnya"><ChevronLeft size={16} /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" disabled={page === pages} onClick={() => setPage(page + 1)} aria-label="Berikutnya"><ChevronRight size={16} /></button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
