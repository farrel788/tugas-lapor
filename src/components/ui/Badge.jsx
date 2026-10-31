const MAP = {
  pending: ['Pending', 'pending'],
  diproses: ['Diproses', 'proses'],
  selesai: ['Selesai', 'selesai'],
  ditolak: ['Ditolak', 'ditolak'],
  rendah: ['Rendah', 'rendah'],
  sedang: ['Sedang', 'sedang'],
  mendesak: ['Mendesak', 'mendesak'],
};

// <Badge type="diproses" /> atau <Badge type="mendesak" />
export default function Badge({ type }) {
  const [label, key] = MAP[String(type).toLowerCase()] || [type, 'rendah'];
  return (
    <span className="badge" style={{ background: `var(--badge-${key}-bg)`, color: `var(--badge-${key}-fg)` }}>
      {label}
    </span>
  );
}
