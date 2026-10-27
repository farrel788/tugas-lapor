import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ClipboardCheck, CircleAlert } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import ReportTable from '../../components/report/ReportTable.jsx';
import { useAuth } from '../../services/auth.jsx';
import { getKuota, listReports } from '../../services/reports.js';

const tanggalHariIni = () =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function DashboardSiswa() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: '', reports: [], kuota: null });

  useEffect(() => {
    Promise.allSettled([listReports(), getKuota()]).then(([reportsResult, quotaResult]) => {
      const errors = [reportsResult, quotaResult]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || 'Sebagian data gagal dimuat.');
      setState({
        loading: false,
        error: errors.join(' '),
        reports: reportsResult.status === 'fulfilled' ? reportsResult.value : [],
        kuota: quotaResult.status === 'fulfilled' ? quotaResult.value : null,
      });
    });
  }, []);

  const { loading, error, reports, kuota } = state;
  const hitung = (s) => reports.filter((r) => r.status === s).length;

  return (
    <>
      <div className="page-top">
        <p className="crumb">{tanggalHariIni()} • {user?.kelas}</p>
        <div className="page-title-row">
          <div className="page-head">
            <h1 className="t-page">Halo, {user?.name}</h1>
            <p className="t-muted">Mari jaga fasilitas sekolah tetap nyaman untuk belajar.</p>
          </div>
          <Button icon={Plus} onClick={() => navigate('/siswa/buat-laporan')}>Buat Laporan Baru</Button>
        </div>
      </div>

      {error && (
        <div className="banner banner--warn"><CircleAlert size={20} /><p>{error}</p></div>
      )}

      {loading ? (
        <>
          <Skeleton height={80} />
          <div className="stats"><Skeleton height={112} /><Skeleton height={112} /><Skeleton height={112} /></div>
          <Skeleton height={24} width={160} />
          <Skeleton height={264} />
        </>
      ) : (
        <>
          {kuota && (
            <div className={`banner ${kuota.sisa === 0 ? 'banner--warn' : ''}`}>
              <ClipboardCheck size={24} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p className="banner__title">
                  {kuota.sisa === 0 ? `Kuota ${kuota.limit} laporan hari ini sudah habis`
                    : `Sisa ${kuota.sisa} dari ${kuota.limit} laporan hari ini`}
                </p>
                <p className="t-caption">Kuota diperbarui setiap hari pukul 00.00. Pastikan laporan berisi informasi yang jelas.</p>
              </div>
            </div>
          )}

          <div className="stats">
            <div className="stat"><span className="stat__num">{reports.length}</span><span className="t-muted">Total laporan</span></div>
            <div className="stat"><span className="stat__num">{hitung('diproses')}</span><span className="t-muted">Diproses</span></div>
            <div className="stat"><span className="stat__num">{hitung('selesai')}</span><span className="t-muted">Selesai</span></div>
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="section-head">
              <h2 className="t-sub">Laporan terbaru</h2>
              <Link to="/siswa/riwayat" className="link-sm">Lihat semua</Link>
            </div>
            <ReportTable reports={reports.slice(0, 3)} />
          </section>

          <p className="footnote">Laporan Anda membantu sekolah memprioritaskan perbaikan. Terima kasih sudah peduli.</p>
        </>
      )}
    </>
  );
}
