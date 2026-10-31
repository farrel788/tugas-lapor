import { Check } from 'lucide-react';
import Brand from './Brand.jsx';

const BENEFITS = [
  'Sampaikan kendala dengan mudah',
  'Pantau status secara transparan',
  'Bersama merawat fasilitas sekolah',
];

function SchoolIllustration() {
  return (
    <svg className="auth__illus" viewBox="0 0 352 224" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1" y="68" width="350" height="155" />
      <rect x="120" y="76" width="112" height="28" />
      <path d="M176 82v16M168 90h16" />
      <rect x="120" y="120" width="40" height="103" />
      <rect x="40" y="108" width="40" height="40" />
      <rect x="272" y="108" width="40" height="40" />
      <rect x="40" y="168" width="40" height="32" />
      <rect x="272" y="168" width="40" height="32" />
      <path d="M144 0h64v20h-64z" />
    </svg>
  );
}

// Panel kiri yang sama di login siswa & login petugas.
export default function AuthAbout() {
  return (
    <section className="auth__about">
      <Brand />
      <div className="auth__msg">
        <h1 className="t-page">Sekolah nyaman,<br />berawal dari kepedulian.</h1>
        <p className="t-muted" style={{ fontSize: 16 }}>
          Laporkan fasilitas yang perlu diperbaiki. Pantau tindak lanjutnya dalam satu tempat.
        </p>
      </div>
      <SchoolIllustration />
      <ul className="auth__benefits" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {BENEFITS.map((b) => (
          <li key={b} className="auth__benefit"><Check size={16} color="var(--color-active)" />{b}</li>
        ))}
      </ul>
      <p className="t-caption">Aplikasi Pelaporan Fasilitas Sekolah</p>
    </section>
  );
}
