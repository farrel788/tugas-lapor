import { X } from 'lucide-react';

export default function Modal({ title, description, onClose, actions, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 className="t-section">{title}</h2>
          <button className="toast__close" onClick={onClose} aria-label="Tutup"><X size={20} /></button>
        </div>
        {description && <p className="t-muted">{description}</p>}
        {children}
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  );
}
