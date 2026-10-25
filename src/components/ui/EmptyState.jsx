import { ClipboardList } from 'lucide-react';

export default function EmptyState({ title, message, action, icon: Icon = ClipboardList }) {
  return (
    <div className="empty">
      <div className="empty__icon"><Icon size={28} /></div>
      <p className="t-sub">{title}</p>
      {message && <p className="t-muted">{message}</p>}
      {action}
    </div>
  );
}
