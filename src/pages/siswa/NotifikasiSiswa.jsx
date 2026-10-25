import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { listNotifications, markAllRead } from '../../services/reports.js';

export default function NotifikasiSiswa() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState('semua');

  useEffect(() => { listNotifications().then(setItems).catch(() => setItems([])); }, []);

  const unread = (items || []).filter((n) => !n.dibaca).length;
  const shown = (items || []).filter((n) => tab === 'semua' || !n.dibaca);

  const tandaiSemua = async () => {
    await markAllRead();
    setItems((cur) => cur.map((n) => ({ ...n, dibaca: true })));
  };

  return (
    <>
      <div className="page-title-row">
        <div className="page-head">
          <h1 className="t-page">Notifikasi</h1>
          <p className="t-muted">Perkembangan laporan dan pesan terbaru dari pengelola.</p>
        </div>
        <Button variant="secondary" icon={CheckCheck} onClick={tandaiSemua} disabled={unread === 0}>Tandai dibaca</Button>
      </div>

      <Tabs
        value={tab} onChange={setTab}
        tabs={[{ value: 'semua', label: 'Semua' }, { value: 'belum', label: `Belum dibaca (${unread})` }]}
      />

      <div className="split">
        <div className="split__main" style={{ gap: 16 }}>
          <p className="overline">TERBARU</p>
          {items === null ? <Skeleton height={240} /> : shown.length === 0 ? (
            <div className="card"><EmptyState icon={Bell} title="Tidak ada notifikasi" message="Notifikasi baru akan muncul di sini." /></div>
          ) : (
            <div className="notif-list">
              {shown.map((n) => (
                <button key={n.id} className={`notif ${n.dibaca ? '' : 'unread'}`}
                  onClick={() => navigate(`/siswa/laporan/${n.laporanId}`)}>
                  <Bell size={20} />
                  <div className="notif__body"><b>{n.judul}</b><span>{n.isi}</span><span>{n.waktu}</span></div>
                  {!n.dibaca && <span className="notif__dot" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <aside className="split__side card" style={{ gap: 16 }}>
          <Bell size={24} color="var(--color-active)" />
          <h2 className="t-sub">Tetap terhubung</h2>
          <p className="t-muted">Notifikasi membantu Anda mengikuti perubahan status laporan dan tanggapan pengelola. Latar biru menandakan pesan yang belum dibaca.</p>
        </aside>
      </div>
    </>
  );
}
