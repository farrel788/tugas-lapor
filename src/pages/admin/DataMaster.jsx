import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Toast from '../../components/ui/Toast.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Input, Select } from '../../components/ui/Field.jsx';
import { deleteMaster, listMaster, saveMaster } from '../../services/admin.js';

// Satu halaman untuk tiga tab data master.
const CONFIG = {
  'kategori-area': { tab: 'Kategori Area/Lokasi', search: 'Cari kategori area/lokasi...', add: 'Tambah kategori', entity: 'kategori',
    cols: ['Nama kategori', 'Lokasi terdaftar'], sub: (r) => `${r.jumlah} lokasi`, parent: false, nameLabel: 'Nama kategori' },
  'lokasi-spesifik': { tab: 'Lokasi Spesifik', search: 'Cari lokasi spesifik...', add: 'Tambah lokasi', entity: 'lokasi',
    cols: ['Nama lokasi', 'Kategori induk'], sub: (r) => r.kategori, parent: true, nameLabel: 'Nama lokasi' },
  'kategori-fasilitas': { tab: 'Kategori Fasilitas', search: 'Cari kategori fasilitas...', add: 'Tambah fasilitas', entity: 'fasilitas',
    cols: ['Nama fasilitas', 'Kategori induk'], sub: (r) => r.kategori, parent: true, nameLabel: 'Nama fasilitas' },
};
const TABS = Object.keys(CONFIG);

export default function DataMaster({ type }) {
  const cfg = CONFIG[type];
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [kategori, setKategori] = useState([]);
  const [kategoriError, setKategoriError] = useState('');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null); // { mode: 'form' | 'hapus', row? }
  const [form, setForm] = useState({ nama: '', kategori: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const muat = useCallback(() => {
    setRows(null);
    setLoadError('');
    listMaster(type).then(setRows).catch((e) => {
      setLoadError(e.message || 'Data master gagal dimuat.');
      setRows([]);
    });
    listMaster('kategori-area').then((k) => {
      setKategori(k.map((x) => x.nama));
      setKategoriError('');
    }).catch((e) => setKategoriError(e.message || 'Kategori induk gagal dimuat.'));
  }, [type]);
  useEffect(() => { muat(); setQ(''); setModal(null); }, [muat]);

  const tampil = useMemo(() => (rows || []).filter((r) => r.nama.toLowerCase().includes(q.trim().toLowerCase())), [rows, q]);

  const buka = (row) => {
    setError('');
    setForm({ nama: row?.nama || '', kategori: row?.kategori || '' });
    setModal({ mode: 'form', row });
  };

  const simpan = async () => {
    if (!form.nama.trim()) return setError(`${cfg.nameLabel} wajib diisi`);
    if (cfg.parent && !form.kategori) return setError('Kategori induk wajib dipilih');
    setSaving(true); setError('');
    try {
      await saveMaster(type, { id: modal.row?.id, nama: form.nama, kategori: form.kategori });
      setModal(null); muat();
      setToast({ type: 'success', title: modal.row ? 'Data diperbarui' : 'Data ditambahkan', message: `${form.nama.trim()} tersimpan dan tersedia pada formulir laporan baru.` });
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const hapus = async () => {
    setSaving(true);
    try {
      await deleteMaster(type, modal.row.id);
      const nama = modal.row.nama;
      setModal(null); muat();
      setToast({ type: 'success', title: 'Data dihapus', message: `${nama} tidak akan muncul lagi pada formulir laporan baru.` });
    } catch (e) { setModal(null); setToast({ type: 'error', title: 'Data tidak dapat dihapus', message: e.message }); } finally { setSaving(false); }
  };

  return (
    <>
      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-head">
        <h1 className="t-page">Data master</h1>
        <p className="t-muted">Kelola pilihan kategori, lokasi, dan fasilitas pada formulir pelaporan.</p>
      </div>

      <div className="tabs tabs--master" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={t === type} className={`tab ${t === type ? 'active' : ''}`}
            onClick={() => navigate(`/admin/data-master/${t}`)}>{CONFIG[t].tab}</button>
        ))}
      </div>

      <div className="search-row">
        <label className="search">
          <Search size={18} />
          <input placeholder={cfg.search} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <Button icon={Plus} onClick={() => buka(null)}>{cfg.add}</Button>
      </div>

      {rows === null ? <Skeleton height={320} /> : loadError ? (
        <div className="card"><EmptyState title="Data gagal dimuat" message={loadError} /></div>
      ) : tampil.length === 0 ? (
        <div className="card"><EmptyState title="Data tidak ditemukan" message={q ? 'Coba kata kunci lain.' : 'Belum ada data. Tambahkan data pertama Anda.'} /></div>
      ) : (
        <div className="table-wrap">
          <div className="master-cols master-head"><span>{cfg.cols[0]}</span><span>{cfg.cols[1]}</span><span>Aksi</span></div>
          {tampil.map((r) => (
            <div className="master-cols master-row" key={r.id}>
              <span>{r.nama}</span>
              <span>{cfg.sub(r)}</span>
              <div className="row-actions">
                <button className="act act--edit" onClick={() => buka(r)}><Pencil size={16} />Edit</button>
                <button className="act" onClick={() => setModal({ mode: 'hapus', row: r })}><Trash2 size={16} />Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="summary-row">
        <span>{tampil.length} data • Perubahan tersedia pada formulir laporan baru.</span>
        <span>Halaman 1</span>
      </div>

      {modal?.mode === 'form' && (
        <Modal title={modal.row ? `Edit ${cfg.entity}` : cfg.add} onClose={() => setModal(null)}
          actions={<>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button loading={saving} onClick={simpan}>Simpan</Button>
          </>}>
          <Input label={cfg.nameLabel} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
            error={!form.nama.trim() && error ? error : ''} autoFocus />
          {cfg.parent && (
            <Select label="Kategori induk" placeholder="Pilih kategori" options={kategori} value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              error={kategoriError || (form.nama.trim() && error ? error : '')} />
          )}
          {error && form.nama.trim() && (!cfg.parent || form.kategori) && <p className="field__error">{error}</p>}
        </Modal>
      )}

      {modal?.mode === 'hapus' && (
        <Modal title={`Hapus ${cfg.entity}?`} description={`“${modal.row.nama}” akan dihapus dan tidak muncul lagi pada formulir laporan baru. Laporan yang sudah ada tidak berubah.`}
          onClose={() => setModal(null)}
          actions={<>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button loading={saving} onClick={hapus}>Hapus</Button>
          </>} />
      )}
    </>
  );
}
