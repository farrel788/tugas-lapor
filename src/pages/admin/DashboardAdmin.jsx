import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock3, Wrench, CircleCheck, CircleAlert } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import AdminReportTable from '../../components/report/AdminReportTable.jsx';
import { listAdminReports, listMaster } from '../../services/admin.js';

const pad = (n) => String(n).padStart(2, '0');
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daftar = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')}, dan ${a[a.length - 1]}`);

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', reports: [], kategori: [] });

  useEffect(() => {
    Promise.allSettled([listAdminReports(), listMaster('kategori-area')]).then(([reportsResult, categoriesResult]) => {
      const errors = [reportsResult, categoriesResult]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || 'Sebagian data gagal dimuat.');
      setState({
        loading: false,
        error: errors.join(' '),
        reports: reportsResult.status === 'fulfilled' ? reportsResult.value : [],
        kategori: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
      });
    });
  }, []);

  const { loading, error, reports, kategori } = state;
  const hitung = (s) => reports.filter((r) => r.status === s).length;

  const terbaru = useMemo(
    () => [...reports].sort((a, b) => (b.iso + String(b.id).padStart(4, '0')).localeCompare(a.iso + String(a.id).padStart(4, '0'))).slice(0, 4),
    [reports],
  );

  const chart = useMemo(() => {
    if (!reports.length) return null;
    const maxIso = reports.reduce((m, r) => (r.iso > m ? r.iso : m), '');
    const days = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(`${maxIso}T00:00:00`);
      d.setDate(d.getDate() - (4 - i));
      return d;
    });
    const data = days.map((d) => ({ label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), n: reports.filter((r) => r.iso === key(d)).length }));
    const total = data.reduce((s, x) => s + x.n, 0);
    const periode = `${days[0].getDate()}–${days[4].toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • ${total} laporan`;
    return { data, max: Math.max(1, ...data.map((x) => x.n)), periode };
  }, [reports]);

  const dist = useMemo(() => {
    const rows = kategori.map((k) => ({ nama: k.nama, n: reports.filter((r) => r.kategori === k.nama).length }));
    return { ada: rows.filter((r) => r.n > 0).sort((a, b) => b.n - a.n), kosong: rows.filter((r) => r.n === 0).map((r) => r.nama) };
  }, [reports, kategori]);
  const maxDist = Math.max(1, ...dist.ada.map((r) => r.n));

  const menunggu = reports.filter((r) => r.status === 'pending').sort((a, b) => a.iso.localeCompare(b.iso) || a.id - b.id)[0];

  const hari = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="page-top">
        <p className="crumb">{hari}</p>
        <div className="page-head">
          <h1 className="t-page">Dashboard</h1>
          <p className="t-muted">Ringkasan laporan dan penanganan fasilitas sekolah.</p>
        </div>
      </div>

      {error && <div className="banner banner--warn"><CircleAlert size={20} /><p>{error}</p></div>}

      {loading ? (
        <>
          <div className="stats"><Skeleton height={152} /><Skeleton height={152} /><Skeleton height={152} /></div>
          <Skeleton height={320} />
          <Skeleton height={280} />
        </>
      ) : (
        <>
          <div className="stats">
            <div className="stat stat--admin">
              <div className="stat__head"><span>Pending</span><Clock3 size={20} /></div>
              <span className="stat__num">{hitung('pending')}</span>
              <span className="t-caption">Menunggu verifikasi</span>
            </div>
            <div className="stat stat--admin">
              <div className="stat__head"><span>Diproses</span><Wrench size={20} /></div>
              <span className="stat__num">{hitung('diproses')}</span>
              <span className="t-caption">Sedang ditangani teknisi</span>
            </div>
            <div className="stat stat--admin">
              <div className="stat__head"><span>Selesai</span><CircleCheck size={20} /></div>
              <span className="stat__num">{hitung('selesai')}</span>
              <span className="t-caption">Perbaikan telah diselesaikan</span>
            </div>
          </div>

          <div className="grid-2">
            <section className="card">
              <h2 className="t-sub">Laporan per periode</h2>
              {chart ? (
                <>
                  <div className="section-head"><span className="t-caption">{chart.periode}</span><span className="link-sm" style={{ fontWeight: 400 }}>Harian</span></div>
                  <div className="bars">
                    {chart.data.map((d) => (
                      <div className="bar" key={d.label}>
                        <span>{d.n}</span>
                        <div className="bar__fill" style={{ height: Math.max(4, (128 * d.n) / chart.max) }} />
                        <span>{d.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="t-caption">Jumlah laporan berdasarkan tanggal pengiriman.</p>
                </>
              ) : <p className="t-muted">Belum ada laporan.</p>}
            </section>

            <section className="card dist">
              <h2 className="t-sub">Distribusi kategori</h2>
              <p className="t-caption">{reports.length} laporan • Seluruh kategori</p>
              {dist.ada.map((r) => (
                <div className="dist__row" key={r.nama}>
                  <div className="dist__top"><span>{r.nama}</span><span>{r.n} laporan</span></div>
                  <div className="dist__track"><div className="dist__fill" style={{ width: `${(r.n / maxDist) * 85}%` }} /></div>
                </div>
              ))}
              {dist.kosong.length > 0 && <p className="t-caption">{daftar(dist.kosong)} belum memiliki laporan.</p>}
            </section>
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-head">
              <h2 className="t-sub">Laporan terbaru</h2>
              <Link to="/admin/laporan" className="link-sm">Lihat semua laporan</Link>
            </div>
            <AdminReportTable reports={terbaru} />
          </section>

          <section className="card">
            <h2 className="t-sub">Perlu ditindaklanjuti</h2>
            {menunggu ? (
              <div className="todo">
                <div>
                  <b>#{pad(menunggu.id)} • {menunggu.judul}</b>
                  <span className="t-caption">{menunggu.pelapor} • {menunggu.kelasPelapor} • Pending sejak {menunggu.tanggalLengkap}</span>
                </div>
                <Button variant="secondary" onClick={() => navigate(`/admin/laporan/${menunggu.id}`)}>Verifikasi laporan</Button>
              </div>
            ) : <p className="t-muted">Tidak ada laporan yang menunggu verifikasi.</p>}
          </section>

          <p className="t-caption">
            Total {reports.length} laporan: {hitung('pending')} Pending, {hitung('diproses')} Diproses, {hitung('selesai')} Selesai, dan {hitung('ditolak')} Ditolak.
          </p>
        </>
      )}
    </>
  );
}
