import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Armchair, CircleAlert, Droplets, Fan, Lightbulb, Monitor, Plug, Projector, Wrench } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { useAuth } from '../../services/auth.jsx';
import { listTugas } from '../../services/teknisi.js';

const IKON = { 'Stop kontak': Plug, Proyektor: Projector, Lampu: Lightbulb, 'AC/Kipas': Fan, 'Kran/Wastafel': Droplets, Komputer: Monitor, 'Meja/Kursi': Armchair };

export default function DashboardTeknisi({ tugasSaya = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tugas, setTugas] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('semua');

  useEffect(() => { listTugas(user.name).then(setTugas).catch((e) => { setError(e.message); setTugas([]); }); }, [user.name]);

  const urut = [...(tugas || [])].sort((a, b) => b.iso.localeCompare(a.iso) || b.id - a.id);
  const aktif = urut.filter((t) => t.status === 'diproses');
  const selesai = urut.filter((t) => t.status === 'selesai');
  const mendesak = aktif.filter((t) => t.urgensi === 'mendesak');
  const tampil = tab === 'diproses' ? aktif : tab === 'selesai' ? selesai : urut;

  const hari = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="page-top">
        <p className="crumb">{tugasSaya ? 'Dashboard / Tugas Saya' : `${hari} • Teknisi`}</p>
        <div className="page-head">
          <h1 className="t-page">{tugasSaya ? 'Tugas saya' : `Halo, ${user.name}`}</h1>
          <p className="t-muted">Berikut tugas perbaikan yang telah ditugaskan kepada Anda.</p>
        </div>
      </div>

      {error && <div className="banner banner--warn"><CircleAlert size={20} /><p>{error}</p></div>}

      {tugas === null ? (
        <><div className="stats"><Skeleton height={152} /><Skeleton height={152} /><Skeleton height={152} /></div><Skeleton height={320} /></>
      ) : (
        <>
          {!tugasSaya && (
            <div className="stats">
              <div className="stat stat--admin"><span className="t-muted">Tugas aktif</span><span className="stat__num">{aktif.length}</span><span className="t-caption">Perlu ditindaklanjuti</span></div>
              <div className="stat stat--admin"><span className="t-muted">Mendesak</span><span className="stat__num">{mendesak.length}</span><span className="t-caption">Utamakan keselamatan</span></div>
              <div className="stat stat--admin"><span className="t-muted">Selesai</span><span className="stat__num">{selesai.length}</span><span className="t-caption">Sudah diperbaiki</span></div>
            </div>
          )}

          <Tabs value={tab} onChange={setTab} tabs={[
            { value: 'semua', label: `Semua tugas (${urut.length})` },
            { value: 'diproses', label: `Diproses (${aktif.length})` },
            { value: 'selesai', label: `Selesai (${selesai.length})` },
          ]} />

          {tampil.length === 0 ? (
            <div className="card"><EmptyState icon={Wrench} title="Belum ada tugas" message="Tugas baru dari pengelola akan muncul di sini." /></div>
          ) : (
            <div className="task-list">
              {tampil.map((t) => {
                const Ikon = IKON[t.jenis] || Wrench;
                return (
                  <div className="task" key={t.id}>
                    <div className="task__icon"><Ikon size={24} /></div>
                    <div className="task__info">
                      <p className="t-sub">#{t.id} • {t.judul}</p>
                      <p className="t-muted">{t.kategori} • {t.lokasi} • {t.pelapor}</p>
                      <p className="t-caption">Dilaporkan {t.tanggal} • Ditugaskan oleh Rina Anggraini</p>
                    </div>
                    <div className="task__badges"><Badge type={t.urgensi} /><Badge type={t.status} /></div>
                    <Button variant="secondary" onClick={() => navigate(`/teknisi/tugas/${t.id}`)}>Lihat tugas</Button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="footnote">Hanya tugas yang ditugaskan kepada {user.name} ditampilkan.</p>
        </>
      )}
    </>
  );
}
