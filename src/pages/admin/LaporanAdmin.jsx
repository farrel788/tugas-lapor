import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Select } from '../../components/ui/Field.jsx';
import AdminReportTable from '../../components/report/AdminReportTable.jsx';
import { listAdminReports, listMaster } from '../../services/admin.js';
import { DEFAULT_RANGE } from '../../services/mockAdmin.js';

const PER_PAGE = 10;
const STATUS = [['pending', 'Pending'], ['diproses', 'Diproses'], ['selesai', 'Selesai'], ['ditolak', 'Ditolak']].map(([value, label]) => ({ value, label }));
const URGENSI = [['rendah', 'Rendah'], ['sedang', 'Sedang'], ['mendesak', 'Mendesak']].map(([value, label]) => ({ value, label }));
const RANGE = [{ value: 'default', label: DEFAULT_RANGE.label }, { value: 'semua', label: 'Semua tanggal' }];
const INIT = { status: '', urgensi: '', kategori: '', rentang: 'default', q: '' };

export default function LaporanAdmin() {
  const [reports, setReports] = useState(null);
  const [kategori, setKategori] = useState([]);
  const [f, setF] = useState(INIT);
  const [page, setPage] = useState(1);

  useEffect(() => {
    listAdminReports().then(setReports).catch(() => setReports([]));
    listMaster('kategori-area').then((k) => setKategori(k.map((x) => ({ value: x.nama, label: x.nama })))).catch(() => {});
  }, []);
  useEffect(() => { setPage(1); }, [f]);

  const set = (k) => (e) => setF((cur) => ({ ...cur, [k]: e.target.value }));

  const filtered = useMemo(() => {
    const kw = f.q.trim().toLowerCase().replace('#', '');
    return (reports || []).filter((r) =>
      (!f.status || r.status === f.status) &&
      (!f.urgensi || r.urgensi === f.urgensi) &&
      (!f.kategori || r.kategori === f.kategori) &&
      (f.rentang === 'semua' || (r.iso >= DEFAULT_RANGE.from && r.iso <= DEFAULT_RANGE.to)) &&
      (!kw || String(r.id).includes(kw) || r.pelapor.toLowerCase().includes(kw) || r.lokasi.toLowerCase().includes(kw)));
  }, [reports, f]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const visible = filtered.slice(start, start + PER_PAGE);

  return (
    <>
      <div className="page-head">
        <h1 className="t-page">Semua laporan</h1>
        <p className="t-muted">Verifikasi, tetapkan teknisi, dan pantau penanganan setiap laporan.</p>
      </div>

      <section className="card">
        <h2 className="t-sub">Filter laporan</h2>
        <div className="filter-row">
          <Select label="Status" placeholder="Semua status" options={STATUS} value={f.status} onChange={set('status')} />
          <Select label="Urgensi" placeholder="Semua urgensi" options={URGENSI} value={f.urgensi} onChange={set('urgensi')} />
          <Select label="Kategori" placeholder="Semua kategori" options={kategori} value={f.kategori} onChange={set('kategori')} />
          <Select label="Rentang tanggal" options={RANGE} value={f.rentang} onChange={set('rentang')} />
        </div>
        <div className="search-row">
          <label className="search">
            <Search size={18} />
            <input placeholder="Cari ID, nama pelapor, atau lokasi..." value={f.q} onChange={set('q')} />
          </label>
          <Button variant="secondary" onClick={() => setF(INIT)}>Reset filter</Button>
        </div>
      </section>

      <div className="section-head">
        <h2 className="t-sub">Daftar laporan</h2>
        <span className="t-caption">{filtered.length} laporan</span>
      </div>

      {reports === null ? <Skeleton height={360} /> : visible.length === 0 ? (
        <div className="card"><EmptyState title="Tidak ada laporan" message="Coba ubah filter atau kata kunci pencarian." /></div>
      ) : <AdminReportTable reports={visible} />}

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
    </>
  );
}
