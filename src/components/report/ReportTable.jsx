import { Link } from 'react-router-dom';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';

const pad = (n) => String(n).padStart(2, '0');

export default function ReportTable({ reports }) {
  const columns = [
    { key: 'id', label: 'ID', width: 56, render: (r) => <span className="cell-strong">#{pad(r.id)}</span> },
    { key: 'judul', label: 'Laporan', width: 280 },
    { key: 'kategori', label: 'Kategori', width: 100 },
    { key: 'lokasi', label: 'Lokasi', width: 150 },
    { key: 'tanggal', label: 'Tanggal', width: 120 },
    { key: 'urgensi', label: 'Urgensi', width: 100, render: (r) => <Badge type={r.urgensi} /> },
    { key: 'status', label: 'Status', width: 108, render: (r) => <Badge type={r.status} /> },
    { key: 'aksi', label: 'Aksi', width: 80, render: (r) => <Link className="cell-link" to={`/siswa/laporan/${r.id}`}>Detail</Link> },
  ];
  return <Table columns={columns} rows={reports} />;
}
