import { CircleAlert, CircleCheck, X } from 'lucide-react';

export default function Toast({ type = 'success', title, message, onClose }) {
  const Icon = type === 'success' ? CircleCheck : CircleAlert;
  return (
    <div className="toast" role="status">
      <Icon size={20} color={type === 'success' ? 'var(--badge-selesai-fg)' : 'var(--color-error)'} />
      <div className="toast__body">
        <p className="toast__title">{title}</p>
        {message && <p className="toast__msg">{message}</p>}
      </div>
      {onClose && <button className="toast__close" onClick={onClose} aria-label="Tutup"><X size={16} /></button>}
    </div>
  );
}
