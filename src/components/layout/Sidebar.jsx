import { NavLink } from 'react-router-dom';

// items: [{ to, label, icon: LucideIcon, end? }]
export default function Sidebar({ title = 'PENGELOLAAN', items = [] }) {
  return (
    <aside className="sidebar">
      <p className="sidebar__title">{title}</p>
      <nav className="sidebar__menu">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__help">
        <p className="t-muted">Butuh bantuan?</p>
        <p>Hubungi koordinator sarana dan prasarana sekolah.</p>
      </div>
    </aside>
  );
}
