import { School } from 'lucide-react';

export default function Brand({ compact = false }) {
  return (
    <div className="brand">
      <div className="brand__logo"><School size={24} /></div>
      <div>
        <p className="brand__name" style={compact ? { fontSize: 16 } : undefined}>Lapor Sekolah</p>
        {!compact && <p className="brand__tag">Pelaporan fasilitas sekolah</p>}
      </div>
    </div>
  );
}
