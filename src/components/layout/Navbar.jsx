import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import Brand from './Brand.jsx';
import NotifBell from './NotifBell.jsx';
import { useAuth } from '../../services/auth.jsx';

const initials = (name = '') => name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

// showNotif = lonceng siswa (dropdown), staffBell = ikon lonceng petugas, compact = logo tanpa tagline
export default function Navbar({ links = [], showNotif = false, staffBell = false, compact = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <header className="navbar">
      <Brand compact={compact} />
      <nav className="nav-links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `nav-link ${isActive || (l.also || []).some((p) => pathname.startsWith(p)) ? 'active' : ''}`}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-right">
        {showNotif && <NotifBell />}
        {staffBell && (
          <button className="icon-btn bell-wrap" aria-label="Notifikasi"><Bell size={24} /><span className="bell-dot" /></button>
        )}
        <div className="profile">
          <div className="avatar">{initials(user?.name)}</div>
          <div className="profile__text">
            <p className="profile__name">{user?.name || 'Pengguna'}</p>
            <p className="profile__sub">{user?.kelas || user?.jabatan || user?.role || ''}</p>
          </div>
        </div>
        <button className="icon-btn" onClick={() => { logout(); navigate(user?.role === 'siswa' ? '/' : '/petugas/login'); }}>
          <LogOut size={18} /><span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
