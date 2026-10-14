import * as XLSX from 'xlsx';
import { Project, MatrixSummary } from '../types';
import { formatDateIndo, getDayNameIndo } from './calculations';

/**
 * Generates an authentic .xlsx WorkBook containing 4 structured sheets:
 * 1. Monitoring Mingguan (Matrix)
 * 2. Rekap Harian
 * 3. Rekap Per Jabatan
 * 4. Identitas Proyek
 */
export function generateWeeklyMonitoringExcelWorkbook(
  project: Project,
  summary: MatrixSummary,
  startDateStr: string,
  endDateStr: string,
  recorderName?: string,
  inspectorName?: string
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: Monitoring Mingguan (Matrix)
  // ==========================================
  const sheet1Data: (string | number)[][] = [];

  // Title & Metadata
  sheet1Data.push(['SIM-TK204 — SISTEM INFORMASI MONITORING TENAGA KERJA']);
  sheet1Data.push(['LAPORAN MONITORING TENAGA KERJA MINGGUAN / PERIODE']);
  sheet1Data.push([]);
  sheet1Data.push(['Nama Proyek', project.name, '', 'Kode Proyek', project.code]);
  sheet1Data.push(['Lokasi', project.location, '', 'Status', project.status.toUpperCase()]);
  sheet1Data.push(['Kontraktor Pelaksana', project.contractor_name, '', 'Konsultan MK', project.consultant_name]);
  sheet1Data.push(['Pemilik Proyek', project.owner_name, '', 'Direksi Teknis', project.project_manager]);
  sheet1Data.push(['Project Manager (PM)', project.site_manager, '', 'Periode', `${formatDateIndo(startDateStr)} s/d ${formatDateIndo(endDateStr)}`]);
  sheet1Data.push([]);

  // Table Headers:
  // Row 1: Header names and dates
  const headerRow1: (string | number)[] = ['No.', 'Jabatan / Keahlian'];
  const headerRow2: (string | number)[] = ['', ''];

  summary.dates.forEach((d) => {
    headerRow1.push(formatDateIndo(d));
    headerRow2.push(getDayNameIndo(d));
  });

  headerRow1.push('Total Orang-Hari', 'Rata-rata / Hari');
  headerRow2.push(`(${summary.calendarDaysCount} Hari Kalender)`, 'Orang / Hari');

  sheet1Data.push(headerRow1);
  sheet1Data.push(headerRow2);

  // Rows per Job Role
  summary.rows.forEach((row, idx) => {
    const rowValues: (string | number)[] = [
      idx + 1,
      row.roleName
    ];

    summary.dates.forEach((d) => {
      rowValues.push(row.countsByDate[d] || 0);
    });

    rowValues.push(row.totalManDays, Number(row.averagePerDay.toFixed(2)));
    sheet1Data.push(rowValues);
  });

  // Footer: Daily Totals
  const totalRow: (string | number)[] = ['TOTAL', 'JUMLAH TENAGA KERJA HARIAN'];
  summary.dates.forEach((d) => {
    totalRow.push(summary.dailyTotals[d] || 0);
  });
  totalRow.push(summary.grandTotalManDays, Number(summary.grandAveragePerDay.toFixed(2)));
  sheet1Data.push(totalRow);

  sheet1Data.push([]);
  sheet1Data.push(['KETERANGAN / STATISTIK:']);
  sheet1Data.push(['Total Orang-Hari', `${summary.grandTotalManDays} orang-hari`]);
  sheet1Data.push(['Rata-rata Tenaga Kerja', `${summary.grandAveragePerDay} orang/hari`]);
  sheet1Data.push(['Puncak Tenaga Kerja', `${summary.peakManpower} orang (${summary.peakDates.map((d) => formatDateIndo(d)).join(', ') || '-'})`]);
  if (summary.missingDates.length > 0) {
    sheet1Data.push(['Hari Belum Dicatat', summary.missingDates.map((d) => formatDateIndo(d)).join(', ')]);
  } else {
    sheet1Data.push(['Hari Belum Dicatat', 'Lengkap (Semua tanggal terverifikasi)']);
  }

  // Catatan & Keterangan Lapangan
  sheet1Data.push([]);
  sheet1Data.push(['CATATAN & KEGIATAN LAPANGAN:']);
  let hasAnyNotes = false;
  summary.dates.forEach((d) => {
    const dailyNotes: string[] = [];
    summary.rows.forEach((r) => {
      if (r.notesByDate[d] && r.notesByDate[d].trim() !== '') {
        dailyNotes.push(`${r.roleName}: ${r.notesByDate[d]}`);
      }
    });
    if (dailyNotes.length > 0) {
      hasAnyNotes = true;
      sheet1Data.push([`${formatDateIndo(d)} (${getDayNameIndo(d)})`, dailyNotes.join(' | ')]);
    }
  });
  if (!hasAnyNotes) {
    sheet1Data.push(['-', 'Tidak ada catatan kendala khusus pada periode ini.']);
  }

  // Sign-off / Lembar Pengesahan
  sheet1Data.push([]);
  sheet1Data.push(['PENGESAHAN LAPORAN:']);
  sheet1Data.push([
    'Disusun Oleh (Kontraktor Pelaksana):',
    recorderName || project.recorder_name || project.site_manager || 'Petugas Pencatat',
    '',
    'Diperiksa Oleh (Konsultan MK):',
    inspectorName || project.inspector_name || 'Inspector / Quality Control'
  ]);
  sheet1Data.push([
    'Mengetahui (Project Manager):',
    project.project_manager,
    '',
    'Tanggal Cetak:',
    formatDateIndo(new Date().toISOString().slice(0, 10))
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Column width calculations for ws1
  const colWidths1 = [{ wch: 6 }, { wch: 28 }];
  summary.dates.forEach(() => colWidths1.push({ wch: 15 }));
  colWidths1.push({ wch: 18 }, { wch: 18 });
  ws1['!cols'] = colWidths1;

  XLSX.utils.book_append_sheet(wb, ws1, 'Monitoring Mingguan');

  // ==========================================
  // SHEET 2: Rekap Harian
  // ==========================================
  const sheet2Data: (string | number)[][] = [
    ['REKAPITULASI TENAGA KERJA HARIAN'],
    ['Proyek', project.name],
    ['Periode', `${formatDateIndo(startDateStr)} s/d ${formatDateIndo(endDateStr)}`],
    [],
    ['No.', 'Tanggal', 'Hari', 'Jumlah Tenaga Kerja (Orang)', 'Status Pencatatan', 'Catatan']
  ];

  summary.dates.forEach((d, idx) => {
    const total = summary.dailyTotals[d] || 0;
    const isRecorded = summary.dailyRecordedFlags[d];
    
    // Collect role notes for the day if any
    const notesArr: string[] = [];
    summary.rows.forEach(r => {
      if (r.notesByDate[d] && r.notesByDate[d].trim() !== '') {
        notesArr.push(`${r.roleName}: ${r.notesByDate[d]}`);
      }
    });

    sheet2Data.push([
      idx + 1,
      formatDateIndo(d),
      getDayNameIndo(d),
      total,
      isRecorded ? 'Tercatat' : 'Belum Dicatat (0)',
      notesArr.join(' | ') || '-'
    ]);
  });

  sheet2Data.push([]);
  sheet2Data.push(['TOTAL ORANG-HARI', summary.grandTotalManDays]);
  sheet2Data.push(['RATA-RATA HARIAN', Number(summary.grandAveragePerDay.toFixed(2))]);

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 12 }, { wch: 26 }, { wch: 22 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Rekap Harian');

  // ==========================================
  // SHEET 3: Rekap Per Jabatan
  // ==========================================
  const sheet3Data: (string | number)[][] = [
    ['REKAPITULASI KOMPOSISI PER JABATAN / KEAHLIAN'],
    ['Proyek', project.name],
    ['Periode', `${formatDateIndo(startDateStr)} s/d ${formatDateIndo(endDateStr)} (${summary.calendarDaysCount} Hari Kalender)`],
    [],
    ['No.', 'Jabatan / Keahlian', 'Total Orang-Hari', 'Rata-rata / Hari', 'Proporsi (%)', 'Status Jabatan']
  ];

  summary.rows.forEach((r, idx) => {
    const proportion = summary.grandTotalManDays > 0
      ? Number(((r.totalManDays / summary.grandTotalManDays) * 100).toFixed(1))
      : 0;

    sheet3Data.push([
      idx + 1,
      r.roleName,
      r.totalManDays,
      Number(r.averagePerDay.toFixed(2)),
      `${proportion}%`,
      r.isActive ? 'Aktif' : 'Non-Aktif'
    ]);
  });

  sheet3Data.push([]);
  sheet3Data.push(['TOTAL', '', summary.grandTotalManDays, Number(summary.grandAveragePerDay.toFixed(2)), '100%']);

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Rekap Per Jabatan');

  // ==========================================
  // SHEET 4: Identitas Proyek
  // ==========================================
  const sheet4Data: (string | number)[][] = [
    ['IDENTITAS & DATA TEKNIS PROYEK'],
    [],
    ['Parameter', 'Keterangan'],
    ['ID Proyek', project.id],
    ['Kode Proyek', project.code],
    ['Nama Proyek', project.name],
    ['Pemilik / Pemberi Tugas', project.owner_name],
    ['Kontraktor Pelaksana', project.contractor_name],
    ['Konsultan MK / Pengawas', project.consultant_name],
    ['Lokasi Pekerjaan', project.location],
    ['Tanggal Mulai Kontrak', formatDateIndo(project.start_date)],
    ['Tanggal Selesai Kontrak', formatDateIndo(project.end_date)],
    ['Status Pelaksanaan', project.status.toUpperCase()],
    ['Direksi Teknis', project.project_manager],
    ['Project Manager (PM)', project.site_manager],
    ['Petugas Pencatat Lapangan', recorderName || project.recorder_name || '-'],
    ['Pemeriksa / Inspector MK', inspectorName || project.inspector_name || '-']
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
  ws4['!cols'] = [{ wch: 26 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Identitas Proyek');

  return wb;
}

/**
 * Triggers client-side download of genuine .xlsx workbook
 */
export function exportWeeklyMonitoringToExcel(
  project: Project,
  summary: MatrixSummary,
  startDateStr: string,
  endDateStr: string,
  recorderName?: string,
  inspectorName?: string
): string {
  const wb = generateWeeklyMonitoringExcelWorkbook(
    project,
    summary,
    startDateStr,
    endDateStr,
    recorderName,
    inspectorName
  );

  // File naming convention: SIM-TK204_NamaProyek_TanggalMulai_TanggalAkhir.xlsx
  const safeProjectName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const fileName = `SIM-TK204_${safeProjectName}_${startDateStr}_${endDateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
  return fileName;
}
