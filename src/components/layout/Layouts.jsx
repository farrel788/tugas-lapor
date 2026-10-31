import { Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Database } from 'lucide-react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../../services/auth.jsx';

function Guard({ role, children }) {
  const { user } = useAuth();
  const login = role === 'siswa' ? '/' : '/petugas/login';
  if (!user || user.role !== role) return <Navigate to={login} replace />;
  return children;
}

export function SiswaLayout() {
  return (
    <Guard role="siswa">
      <div className="student-shell">
        <Navbar
          showNotif
          links={[
            { to: '/siswa', label: 'Dashboard', end: true },
            { to: '/siswa/riwayat', label: 'Riwayat Laporan', also: ['/siswa/laporan'] },
          ]}
        />
        <main className="student-main"><Outlet /></main>
      </div>
    </Guard>
  );
}

const ADMIN_MENU = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/laporan', label: 'Laporan', icon: ClipboardList },
  { to: '/admin/data-master', label: 'Data Master', icon: Database },
];

export function AdminLayout() {
  return (
    <Guard role="admin">
      <div className="admin-shell">
        <Navbar compact staffBell />
        <div className="shell">
          <Sidebar items={ADMIN_MENU} />
          <main className="main admin-main"><Outlet /></main>
        </div>
      </div>
    </Guard>
  );
}

const TEKNISI_MENU = [
  { to: '/teknisi', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/teknisi/tugas', label: 'Tugas Saya', icon: ClipboardList },
];

export function TeknisiLayout() {
  return (
    <Guard role="teknisi">
      <div className="admin-shell">
        <Navbar compact staffBell />
        <div className="shell">
          <Sidebar title="RUANG TEKNISI" items={TEKNISI_MENU} />
          <main className="main admin-main"><Outlet /></main>
        </div>
      </div>
    </Guard>
  );
}
