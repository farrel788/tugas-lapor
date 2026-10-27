const nameOf = (value) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return value.nama ?? value.name ?? value.label ?? value.full_name ?? value.nama_lengkap ?? '';
};

const firstName = (...values) => values.map(nameOf).find(Boolean) || '';

const dateValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '') || '';

function normalizeDate(report) {
  const raw = dateValue(report.iso, report.created_at, report.createdAt, report.report_date, report.date, report.tanggalLengkap, report.tanggal);
  if (!raw) return { iso: '', tanggal: '—', tanggalLengkap: '—' };

  const text = String(raw);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);
  const parsed = new Date(dateOnly ? `${text}T12:00:00` : text.replace(/(\.\d{3})\d+/, '$1'));
  if (Number.isNaN(parsed.getTime())) {
    const iso = text.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '';
    return {
      iso,
      tanggal: report.tanggal ?? text,
      tanggalLengkap: report.tanggalLengkap ?? text,
    };
  }

  const iso = text.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || parsed.toISOString().slice(0, 10);
  const tanggal = parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const waktu = dateOnly ? '' : parsed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
  return { iso, tanggal, tanggalLengkap: waktu ? `${tanggal}, ${waktu}` : tanggal };
}

function normalizePhotos(value) {
  if (!Array.isArray(value)) return [];
  return value.map((photo, index) => {
    if (typeof photo === 'string') return { nama: `Foto ${index + 1}`, url: photo };
    return {
      ...photo,
      nama: photo?.nama ?? photo?.name ?? `Foto ${index + 1}`,
      url: photo?.url ?? photo?.path ?? photo?.original_url ?? photo?.image_path ?? '',
    };
  });
}

function defaultTracking(status, timestamp) {
  const selesai = status === 'selesai';
  const ditolak = status === 'ditolak';
  const diproses = ['diproses', 'selesai'].includes(status);
  const stages = [
    { status: 'pending', judul: 'Menunggu Verifikasi', waktu: timestamp, ket: 'Laporan diterima oleh sistem.', selesai: true },
  ];
  if (ditolak) {
    stages.push({ status: 'ditolak', judul: 'Laporan Ditolak', waktu: timestamp, ket: 'Laporan tidak dapat ditindaklanjuti.', selesai: true });
  } else {
    stages.push({ status: 'diproses', judul: 'Dalam Perbaikan', waktu: diproses ? timestamp : 'Menunggu verifikasi', ket: 'Teknisi akan ditugaskan oleh pengelola.', selesai: diproses });
    stages.push({ status: 'selesai', judul: 'Telah Diperbaiki', waktu: selesai ? timestamp : 'Menunggu penyelesaian', ket: 'Hasil perbaikan akan ditampilkan di sini.', selesai });
  }
  return stages;
}

// Convert Laravel relationship fields to the names consumed by report tables and details.
export function normalizeReport(report) {
  if (!report || typeof report !== 'object') return report;

  const location = report.location ?? report.lokasi_spesifik ?? report.specific_location ?? report.specificLocation;
  const facility = report.facility_category ?? report.facilityCategory ?? report.facility_type;
  const student = report.student ?? report.siswa ?? report.user?.student ?? report.user?.siswa;
  const area = location?.parent_location ?? location?.parentLocation ?? location?.parent ?? location?.area
    ?? location?.location_group ?? location?.location_category ?? location?.category ?? report.location_group ?? report.area;
  const dates = normalizeDate(report);
  const status = report.status ?? report.state ?? 'pending';
  const photos = normalizePhotos(report.foto ?? report.photos ?? report.attachments ?? report.images);
  const messages = report.diskusi ?? report.messages;
  const tracking = report.tracking;
  const description = report.deskripsi ?? report.description ?? report.problem_description ?? '';
  const descriptionText = typeof description === 'string' ? description : String(description);
  const title = report.judul ?? report.title ?? (descriptionText ? `${descriptionText.slice(0, 48).trim()}${descriptionText.length > 48 ? '…' : ''}` : 'Laporan');
  const technician = report.teknisi ?? report.technician;

  return {
    ...report,
    id: report.id ?? report.report_id,
    judul: title,
    deskripsi: descriptionText,
    pelapor: firstName(report.pelapor, report.nama_pelapor, report.nama_siswa, report.reporter,
      report.reporter_name, report.student_name, student, student?.user, report.user, report.creator) || '—',
    nisn: report.nisn ?? student?.nisn ?? report.user?.nisn ?? '—',
    kelasPelapor: firstName(report.kelasPelapor, report.kelas_pelapor, report.kelas_siswa, report.kelas,
      report.classroom, report.class, report.class_name, student?.classroom, student?.kelas, student?.class,
      report.user?.classroom, report.user?.kelas, report.user?.class) || '—',
    kategori: firstName(report.kategori, area, report.location_group, report.area, report.category, facility,
      report.facility_category_name, report.facilityCategoryName) || '—',
    lokasi: firstName(report.lokasi, location, report.location_name, report.locationName) || '—',
    jenis: firstName(report.jenis, facility, report.facility_category_name, report.facilityCategoryName) || '—',
    urgensi: report.urgensi ?? report.urgency ?? 'sedang',
    status,
    teknisi: nameOf(technician) || null,
    teknisiInfo: technician?.info ?? technician?.position ?? technician?.jabatan ?? '',
    ...dates,
    diperbarui: report.diperbarui ?? report.updated_at ?? dates.tanggalLengkap,
    foto: photos,
    diskusi: Array.isArray(messages) ? messages : [],
    tracking: Array.isArray(tracking) ? tracking : defaultTracking(status, dates.tanggalLengkap),
  };
}

export function normalizeReports(value) {
  let rows = value;
  for (let i = 0; i < 3 && rows && !Array.isArray(rows); i += 1) {
    rows = rows.data ?? rows.reports ?? rows.items;
  }
  return Array.isArray(rows) ? rows.map(normalizeReport) : [];
}
