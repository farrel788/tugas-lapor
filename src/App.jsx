import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/auth.jsx';
import { SiswaLayout, AdminLayout, TeknisiLayout } from './components/layout/Layouts.jsx';
import LoginSiswa from './pages/LoginSiswa.jsx';
import RegisterSiswa from './pages/RegisterSiswa.jsx';
import LoginPetugas from './pages/LoginPetugas.jsx';
import DashboardSiswa from './pages/siswa/DashboardSiswa.jsx';
import BuatLaporan from './pages/siswa/BuatLaporan.jsx';
import RiwayatLaporan from './pages/siswa/RiwayatLaporan.jsx';
import DetailLaporan from './pages/siswa/DetailLaporan.jsx';
import NotifikasiSiswa from './pages/siswa/NotifikasiSiswa.jsx';
import DashboardAdmin from './pages/admin/DashboardAdmin.jsx';
import LaporanAdmin from './pages/admin/LaporanAdmin.jsx';
import DetailLaporanAdmin from './pages/admin/DetailLaporanAdmin.jsx';
import DataMaster from './pages/admin/DataMaster.jsx';
import DashboardTeknisi from './pages/teknisi/DashboardTeknisi.jsx';
import DetailTugasTeknisi from './pages/teknisi/DetailTugasTeknisi.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Publik */}
        <Route path="/" element={<LoginSiswa />} />
        <Route path="/register" element={<RegisterSiswa />} />
        <Route path="/petugas/login" element={<LoginPetugas />} />

        {/* Siswa */}
        <Route path="/siswa" element={<SiswaLayout />}>
          <Route index element={<DashboardSiswa />} />
          <Route path="buat-laporan" element={<BuatLaporan />} />
          <Route path="riwayat" element={<RiwayatLaporan />} />
          <Route path="laporan/:id" element={<DetailLaporan />} />
          <Route path="notifikasi" element={<NotifikasiSiswa />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="laporan" element={<LaporanAdmin />} />
          <Route path="laporan/:id" element={<DetailLaporanAdmin />} />
          <Route path="data-master" element={<Navigate to="kategori-area" replace />} />
          <Route path="data-master/kategori-area" element={<DataMaster type="kategori-area" />} />
          <Route path="data-master/lokasi-spesifik" element={<DataMaster type="lokasi-spesifik" />} />
          <Route path="data-master/kategori-fasilitas" element={<DataMaster type="kategori-fasilitas" />} />
        </Route>

        {/* Teknisi */}
        <Route path="/teknisi" element={<TeknisiLayout />}>
          <Route index element={<DashboardTeknisi />} />
          <Route path="tugas" element={<DashboardTeknisi tugasSaya />} />
          <Route path="tugas/:id" element={<DetailTugasTeknisi />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
