import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { listNotifications } from '../../services/reports.js';

export default function NotifBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { listNotifications().then(setItems).catch(() => {}); }, [open]);
  const unread = items.some((n) => !n.dibaca);

  return (
    <div className="bell-wrap">
      <button className="icon-btn" aria-label="Notifikasi" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Bell size={24} />{unread && <span className="bell-dot" />}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <div className="bell-menu" role="menu">
            <p className="overline">TERBARU</p>
            {items.slice(0, 3).map((n) => (
              <button key={n.id} className={`notif ${n.dibaca ? '' : 'unread'}`}
                onClick={() => { setOpen(false); navigate(`/siswa/laporan/${n.laporanId}`); }}>
                <div className="notif__body"><b>{n.judul}</b><span>{n.waktu}</span></div>
                {!n.dibaca && <span className="notif__dot" />}
              </button>
            ))}
            <button className="link-strong" style={{ padding: 8 }} onClick={() => { setOpen(false); navigate('/siswa/notifikasi'); }}>
              Lihat semua notifikasi
            </button>
          </div>
        </>
      )}
    </div>
  );
}
