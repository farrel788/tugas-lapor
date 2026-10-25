import { Link } from 'react-router-dom';
import Table from '../ui/Table.jsx';
import Badge from '../ui/Badge.jsx';

const pad = (n) => String(n).padStart(2, '0');

export default function AdminReportTable({ reports }) {
  const columns = [
    { key: 'id', label: 'ID', width: 46, render: (r) => <span className="cell-strong">#{pad(r.id)}</span> },
    { key: 'pelapor', label: 'Pelapor', width: 120 },
    { key: 'kategori', label: 'Kategori', width: 76 },
    { key: 'lokasi', label: 'Lokasi', width: 116 },
    { key: 'urgensi', label: 'Urgensi', width: 90, render: (r) => <Badge type={r.urgensi} /> },
    { key: 'status', label: 'Status', width: 90, render: (r) => <Badge type={r.status} /> },
    { key: 'teknisi', label: 'Teknisi', width: 125, render: (r) => r.teknisi || 'Belum ditugaskan' },
    { key: 'tanggal', label: 'Tanggal', width: 92 },
    { key: 'aksi', label: 'Aksi', width: 40, render: (r) => <Link className="cell-link" to={`/admin/laporan/${r.id}`}>Detail</Link> },
  ];
  return <Table columns={columns} rows={reports} />;
}
