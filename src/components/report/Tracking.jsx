import { Check, Circle, X } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export default function Tracking({ stages }) {
  return (
    <div className="timeline">
      {stages.map((s, i) => {
        const last = i === stages.length - 1;
        const ditolak = s.status === 'ditolak';
        return (
          <div className="stage" key={s.status}>
            <div className="stage__rail">
              <div className={`stage__dot ${s.selesai ? 'stage__dot--done' : ''}`}
                style={ditolak ? { background: 'var(--badge-ditolak-bg)', color: 'var(--badge-ditolak-fg)' } : undefined}>
                {ditolak ? <X size={14} /> : s.selesai ? <Check size={14} /> : <Circle size={14} />}
              </div>
              {!last && <div className="stage__line" />}
            </div>
            <div className="stage__body">
              <Badge type={s.status} />
              <p className="stage__title">{s.judul}</p>
              <p className="stage__note">{s.waktu}</p>
              <p className="stage__note">{s.ket}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
