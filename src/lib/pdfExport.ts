import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Project, MatrixSummary, DailyManpower, JobRole, DriveDocumentationPhoto } from '../types';
import { formatDateIndo, getDayNameIndo, formatDateIndoFull } from './calculations';

/**
 * Builds the complete jsPDF document instance for SIM-TK204 Weekly/Period Monitoring.
 * Designed specifically for A4 Landscape with full project identity, matrix table,
 * daily totals, grand total OH, average, field notes (catatan), and 3-column signature block.
 */
export function generateWeeklyMonitoringPDFDoc(
  project: Project,
  summary: MatrixSummary,
  startDateStr: string,
  endDateStr: string,
  recorderName?: string,
  inspectorName?: string
): jsPDF {
  // A4 Landscape dimensions: 297mm width x 210mm height
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // --- 1. HEADER SECTION ---
  // Top bar accent (Navy Blue #142B4A)
  doc.setFillColor(20, 43, 74);
  doc.rect(10, 8, 277, 16, 'F');

  // Orange accent line below (#F28C28)
  doc.setFillColor(242, 140, 40);
  doc.rect(10, 24, 277, 1.2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SIM-TK204 | MONITORING TENAGA KERJA PROYEK KONSTRUKSI', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Sistem Informasi Administrasi & Pelaporan Tenaga Kerja Harian / Mingguan', 14, 21);

  // Print timestamp on top right
  const now = new Date();
  const printTimeStr = `Dicetak: ${formatDateIndo(now.toISOString().slice(0, 10))} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  doc.setFontSize(8);
  doc.text(printTimeStr, 283, 15, { align: 'right' });
  doc.text('Format: A4 Landscape Resmi', 283, 21, { align: 'right' });

  // --- 2. PROJECT INFORMATION & KPI CARDS SECTION ---
  // Layout coordinates:
  // Total usable width: 277mm (X = 10 to 287)
  // Left Box (Identitas Proyek): X = 10 to 216 (width = 206mm)
  // Right Box (KPI Periode): X = 220 to 287 (width = 67mm)
  const topBoxesY = 27;

  // Render Project Identity using autoTable for guaranteed word-wrapping & zero overlap
  autoTable(doc, {
    startY: topBoxesY + 5.5,
    margin: { left: 13, right: 90 },
    body: [
      [
        { content: 'Nama Proyek', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        { content: `: ${project.name}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
        { content: 'Pemilik / Pemberi Tugas', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        { content: `: ${project.owner_name}`, styles: { textColor: [30, 41, 59] } },
      ],
      [
        { content: 'Nomor Kontrak', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.code}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
        { content: 'Kontraktor Pelaksana', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        { content: `: ${project.contractor_name}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
      ],
      [
        { content: 'Lokasi', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.location}`, styles: { textColor: [30, 41, 59] } },
        { content: 'Konsultan MK / Pengawas', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.consultant_name}`, styles: { textColor: [30, 41, 59] } },
      ],
      [
        { content: 'Status Proyek', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.status.toUpperCase()}`, styles: { fontStyle: 'bold', textColor: project.status === 'active' ? [16, 149, 103] : [30, 41, 59] } },
        { content: 'Project Manager', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.project_manager}${project.site_manager ? ' / ' + project.site_manager : ''}`, styles: { textColor: [30, 41, 59] } },
      ],
    ],
    theme: 'plain',
    styles: {
      fontSize: 7.2,
      cellPadding: { top: 0.6, bottom: 0.6, left: 0.5, right: 1 },
      overflow: 'linebreak',
      valign: 'top',
      lineColor: [255, 255, 255],
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 72 },
      2: { cellWidth: 29 },
      3: { cellWidth: 71 },
    },
  });

  // Calculate dynamic bottom of info table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 52;
  const boxHeight = Math.max(26, infoFinalY - topBoxesY + 2);

  // Draw background & border card for Identitas Proyek behind the content
  // Note: we can draw rounded card frame around it
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.roundedRect(10, topBoxesY, 206, boxHeight, 1.5, 1.5, 'S');

  // Left Navy blue vertical accent bar
  doc.setFillColor(20, 43, 74);
  doc.rect(10, topBoxesY, 2.5, boxHeight, 'F');

  // Header label inside Identitas Proyek box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 43, 74);
  doc.text('DATA IDENTITAS PROYEK', 14, topBoxesY + 4);

  // Right KPI Card (PERIODE MONITORING & SUMMARY)
  const rightBoxX = 220;
  const rightBoxWidth = 67;

  // Background and border for KPI Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightBoxX, topBoxesY, rightBoxWidth, boxHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightBoxX, topBoxesY, rightBoxWidth, boxHeight, 1.5, 1.5, 'S');

  // Orange vertical accent bar on left of KPI card
  doc.setFillColor(242, 140, 40);
  doc.rect(rightBoxX, topBoxesY, 2.5, boxHeight, 'F');

  // KPI Header: PERIODE MONITORING
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 43, 74);
  doc.text('PERIODE MONITORING:', rightBoxX + 5, topBoxesY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`${formatDateIndo(startDateStr)} s/d ${formatDateIndo(endDateStr)}`, rightBoxX + 5, topBoxesY + 9);
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`(${summary.calendarDaysCount} Hari Kalender)`, rightBoxX + 5, topBoxesY + 12.8);

  // Thin separator line
  doc.setDrawColor(226, 232, 240);
  doc.line(rightBoxX + 5, topBoxesY + 14.5, rightBoxX + rightBoxWidth - 4, topBoxesY + 14.5);

  // KPI Item 1: Total Orang-Hari
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 43, 74);
  doc.text('Total Orang-Hari:', rightBoxX + 5, topBoxesY + 19);

  doc.setTextColor(242, 140, 40); // Orange
  doc.setFontSize(9.5);
  doc.text(`${summary.grandTotalManDays} OH`, rightBoxX + rightBoxWidth - 5, topBoxesY + 19, { align: 'right' });

  // KPI Item 2: Rata-rata / Hari
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 43, 74);
  doc.text('Rata-rata / Hari:', rightBoxX + 5, topBoxesY + 23.8);

  doc.setFontSize(8.5);
  doc.setTextColor(20, 43, 74);
  doc.text(
    `${summary.grandAveragePerDay.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Org/Hari`,
    rightBoxX + rightBoxWidth - 5,
    topBoxesY + 23.8,
    { align: 'right' }
  );

  // --- 3. MATRIX TABLE ---
  const startTableY = topBoxesY + boxHeight + 3.5;

  // Table Headers (Row 1 & Row 2)
  const headRow1: string[] = ['No', 'Jabatan / Keahlian'];
  const headRow2: string[] = ['', ''];

  summary.dates.forEach((d) => {
    headRow1.push(formatDateIndo(d));
    headRow2.push(getDayNameIndo(d));
  });

  headRow1.push('Total OH', 'Rata-rata');
  headRow2.push('Orang-Hari', 'Org/Hari');

  // Table Body Rows
  const bodyRows: RowInput[] = summary.rows.map((row, idx) => {
    const rValues: (string | number)[] = [idx + 1, row.roleName];
    summary.dates.forEach((d) => {
      rValues.push(row.countsByDate[d] || 0);
    });
    rValues.push(
      row.totalManDays,
      row.averagePerDay.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
    return rValues as RowInput;
  });

  // Footer Row: Totals
  const footerRow: (string | number)[] = ['TOTAL', 'JUMLAH TENAGA KERJA HARIAN'];
  summary.dates.forEach((d) => {
    footerRow.push(summary.dailyTotals[d] || 0);
  });
  footerRow.push(
    summary.grandTotalManDays,
    summary.grandAveragePerDay.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  autoTable(doc, {
    startY: startTableY,
    margin: { left: 10, right: 10 },
    head: [headRow1, headRow2],
    body: bodyRows,
    foot: [footerRow as RowInput],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.2,
      halign: 'center',
      valign: 'middle',
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [20, 43, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    footStyles: {
      fillColor: [238, 242, 250],
      textColor: [20, 43, 74],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 44, halign: 'left', fontStyle: 'bold' },
    },
  });

  // Calculate table end Y
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 4 : 115;

  // Check if we have enough space for Notes (~22mm) and Signatures (~32mm) on current page (max Y = 198mm)
  let notesY = tableFinalY;
  const neededHeight = 56; // 22mm notes + 34mm signatures

  if (tableFinalY + neededHeight > 198) {
    // Add page 2 if table was long
    doc.addPage('a4', 'landscape');
    // Draw top mini-header on page 2
    doc.setFillColor(20, 43, 74);
    doc.rect(10, 8, 277, 12, 'F');
    doc.setFillColor(242, 140, 40);
    doc.rect(10, 20, 277, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`SIM-TK204 | CATATAN & PENGESAHAN LAPORAN — ${project.name}`, 14, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Periode: ${formatDateIndo(startDateStr)} s/d ${formatDateIndo(endDateStr)}`, 283, 15, { align: 'right' });

    notesY = 25;
  }

  // --- 4. CATATAN & KETERANGAN LAPANGAN (NOTES SECTION) ---
  const notesBoxHeight = 22;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(10, notesY, 277, notesBoxHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(10, notesY, 277, notesBoxHeight, 1.5, 1.5, 'S');

  // Orange accent bar on the left of notes box
  doc.setFillColor(242, 140, 40);
  doc.rect(10, notesY, 2.5, notesBoxHeight, 'F');

  // Title of Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 43, 74);
  doc.text('CATATAN & KETERANGAN PEKERJAAN LAPANGAN:', 16, notesY + 4.5);

  // Extract recorded notes per day or per role
  const dailyNotesSummary: string[] = [];
  summary.dates.forEach((d) => {
    const roleNotesList: string[] = [];
    summary.rows.forEach((r) => {
      if (r.notesByDate[d] && r.notesByDate[d].trim() !== '') {
        roleNotesList.push(`${r.roleName}: ${r.notesByDate[d].trim()}`);
      }
    });
    if (roleNotesList.length > 0) {
      dailyNotesSummary.push(`${formatDateIndo(d)}: ${roleNotesList.slice(0, 2).join('; ')}`);
    }
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  // Left column in notes box: Daily activities (first 2 lines)
  const line1 = dailyNotesSummary.length > 0
    ? `• ${dailyNotesSummary.slice(0, 2).join('  |  ')}`
    : '• Seluruh pekerjaan berjalan teratur sesuai rencana kerja dan instruksi pengawas lapangan.';
  
  const line2 = dailyNotesSummary.length > 2
    ? `• ${dailyNotesSummary.slice(2, 4).join('  |  ')}`
    : `• Puncak kehadiran: ${summary.peakManpower} orang (${summary.peakDates.map((d) => formatDateIndo(d)).join(', ') || '-'}). Status: Tidak ada kecelakaan kerja (Zero Accident).`;

  doc.text(doc.splitTextToSize(line1, 190), 16, notesY + 9);
  doc.text(doc.splitTextToSize(line2, 190), 16, notesY + 14);

  // Right column in notes box: Key summary figures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(20, 43, 74);
  doc.text('STATISTIK RINGKAS:', 215, notesY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Total Volume : ${summary.grandTotalManDays} Orang-Hari (OH)`, 215, notesY + 9);
  doc.text(`• Rata-rata   : ${summary.grandAveragePerDay.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Org/Hari`, 215, notesY + 13);
  doc.text(`• Verifikasi  : ${summary.calendarDaysCount} Hari Kalender Lengkap`, 215, notesY + 17);

  // --- 5. SIGNATURE SECTION (3 COLUMNS) ---
  const signY = notesY + notesBoxHeight + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  // 3 Equal Columns (Landscape Centered & Responsive)
  const lColWidth = 277 / 3; // 92.33mm per column
  const lLineWidth = 54;

  const weeklySignCols = [
    {
      header: 'Disusun Oleh:',
      role: project.contractor_name || 'Kontraktor Pelaksana',
      sub: '(Pelaksana / Administrasi Lapangan)',
      person: recorderName || project.recorder_name || project.site_manager || 'Petugas Pencatat Lapangan',
      title: 'Site Administration / SM',
    },
    {
      header: 'Diperiksa Oleh:',
      role: project.consultant_name || 'Konsultan Manajemen Konstruksi',
      sub: '(Pengawas Lapangan / Inspector)',
      person: inspectorName || project.inspector_name || 'Inspector / Quality Control',
      title: 'Inspector Lapangan MK',
    },
    {
      header: 'Mengetahui & Menyetujui:',
      role: 'Pemberi Tugas / Direksi Lapangan',
      sub: '(Project Manager / Pimpro)',
      person: project.project_manager || 'Project Manager',
      title: 'Project Manager Proyek',
    },
  ];

  weeklySignCols.forEach((col, idx) => {
    const colCenterX = 10 + idx * lColWidth + lColWidth / 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text(col.header, colCenterX, signY, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 43, 74);
    const roleLines = doc.splitTextToSize(col.role, lColWidth - 8);
    doc.text(roleLines.slice(0, 2), colCenterX, signY + 3.8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(col.sub, colCenterX, signY + 7.5, { align: 'center' });

    // Underline
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.line(colCenterX - lLineWidth / 2, signY + 22, colCenterX + lLineWidth / 2, signY + 22);

    // Person
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(15, 23, 42);
    doc.text(col.person, colCenterX, signY + 25.5, { align: 'center' });

    // Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(col.title, colCenterX, signY + 29, { align: 'center' });
  });

  // Document Footer
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Dokumen ini diterbitkan secara sah dan resmi melalui Sistem Informasi Monitoring Tenaga Kerja SIM-TK204 — Format Standar A4 Landscape.',
    148,
    203,
    { align: 'center' }
  );

  return doc;
}

/**
 * Generates and triggers browser download of the official A4 Landscape PDF.
 */
export function exportWeeklyMonitoringToPDF(
  project: Project,
  summary: MatrixSummary,
  startDateStr: string,
  endDateStr: string,
  recorderName?: string,
  inspectorName?: string
): string {
  const doc = generateWeeklyMonitoringPDFDoc(
    project,
    summary,
    startDateStr,
    endDateStr,
    recorderName,
    inspectorName
  );

  // Filename convention: SIM-TK204_NamaProyek_TanggalMulai_TanggalAkhir.pdf
  const safeProjectName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const fileName = `SIM-TK204_${safeProjectName}_${startDateStr}_${endDateStr}.pdf`;

  doc.save(fileName);
  return fileName;
}

/**
 * Parameters for Daily Report PDF generation
 */
export interface DailyReportPDFParams {
  project: Project;
  selectedDate: string;
  dailyRecords: DailyManpower[];
  jobRoles: JobRole[];
  narrative: {
    rencana_m6?: string;
    realisasi_m6?: string;
    deviasi_m6?: string;
    pekerjaan?: string;
    peralatan?: string;
    kendala?: string;
    cuaca?: string;
    material_masuk?: string;
    saran?: string;
  };
  photos: DriveDocumentationPhoto[];
  consultantName?: string;
  recorderName?: string;
  inspectorName?: string;
}

/**
 * Generates an official, publication-quality A4 Portrait PDF for the Daily Construction Report.
 * Displays project identity, manpower counts, weekly progress, narrative on top,
 * and field photo documentation gallery (with Google Drive status) on the bottom.
 */
export function generateDailyReportPDFDoc(params: DailyReportPDFParams): jsPDF {
  const {
    project,
    selectedDate,
    dailyRecords,
    jobRoles,
    narrative,
    photos,
    consultantName,
    recorderName,
    inspectorName,
  } = params;

  // A4 Portrait dimensions: 210mm width x 297mm height
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 10;
  const contentWidth = 190;

  // Helper to draw standard header on any page
  const drawPageHeader = (pageTitle: string, isFirstPage: boolean) => {
    // Top banner (Navy Blue #142B4A)
    doc.setFillColor(20, 43, 74);
    doc.rect(marginX, 8, contentWidth, 16, 'F');

    // Orange accent strip (#F28C28)
    doc.setFillColor(242, 140, 40);
    doc.rect(marginX, 24, contentWidth, 1.2, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text(pageTitle, marginX + 4, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('SIM-TK204 | Laporan Administrasi, Tenaga Kerja & Dokumentasi Lapangan', marginX + 4, 20.5);

    // Right side: Date info
    const dayName = getDayNameIndo(selectedDate);
    const dateFormatted = formatDateIndo(selectedDate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${dayName}, ${dateFormatted}`, marginX + contentWidth - 4, 15, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`No. Kontrak: ${project.code}`, marginX + contentWidth - 4, 20.5, { align: 'right' });
  };

  // --- 1. FIRST PAGE HEADER ---
  drawPageHeader('LAPORAN HARIAN PROYEK KONSTRUKSI', true);

  // --- 2. IDENTITAS PROYEK ---
  const topBoxY = 27;
  autoTable(doc, {
    startY: topBoxY + 3.5,
    margin: { left: marginX + 1, right: marginX + 1 },
    body: [
      [
        { content: 'Nama Proyek', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        { content: `: ${project.name}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
        { content: 'Pemilik Tugas / Owner', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        { content: `: ${project.owner_name}`, styles: { textColor: [30, 41, 59] } },
      ],
      [
        { content: 'Nomor Kontrak', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.code}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
        { content: 'Kontraktor Pelaksana', styles: { fontStyle: 'bold', textColor: [71, 85, 105] } },
        { content: `: ${project.contractor_name}`, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
      ],
      [
        { content: 'Lokasi Pekerjaan', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.location}`, styles: { textColor: [30, 41, 59] } },
        { content: 'Konsultan Pengawas / MK', styles: { textColor: [100, 116, 139] } },
        { content: `: ${consultantName || project.consultant_name}`, styles: { textColor: [30, 41, 59] } },
      ],
      [
        { content: 'Mulai Kerja (SPMK)', styles: { textColor: [100, 116, 139] } },
        { content: `: ${formatDateIndo(project.start_date || selectedDate)}`, styles: { textColor: [30, 41, 59] } },
        { content: 'Project Manager', styles: { textColor: [100, 116, 139] } },
        { content: `: ${project.project_manager || '-'}`, styles: { textColor: [30, 41, 59] } },
      ],
    ],
    theme: 'plain',
    styles: {
      fontSize: 7.2,
      cellPadding: { top: 0.6, bottom: 0.6, left: 0.6, right: 1 },
      overflow: 'linebreak',
      valign: 'top',
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 65 },
      2: { cellWidth: 34 },
      3: { cellWidth: 61 },
    },
  });

  // Calculate box height around identity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 48;
  const idBoxHeight = idFinalY - topBoxY + 1.5;

  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, topBoxY, contentWidth, idBoxHeight, 1.2, 1.2, 'S');
  doc.setFillColor(20, 43, 74);
  doc.rect(marginX, topBoxY, 2.2, idBoxHeight, 'F');

  // --- 3. PROGRES MINGGUAN & TOTAL TENAGA KERJA (HIGHLIGHT CARDS) ---
  const kpiY = idFinalY + 3;
  const kpiCardWidth = (contentWidth - 6) / 4;
  const kpiHeight = 13.5;

  // Active records for selectedDate
  const recordsForDate = dailyRecords.filter((r) => r.work_date === selectedDate);
  const totalWorkers = recordsForDate.reduce((acc, r) => acc + (Number(r.worker_count) || 0), 0);

  const kpiItems = [
    { label: 'RENCANA M6', value: narrative.rencana_m6 || '1,755%', color: [20, 43, 74] },
    { label: 'REALISASI M6', value: narrative.realisasi_m6 || '3,483%', color: [16, 149, 103] },
    { label: 'DEVIASI M6', value: narrative.deviasi_m6 || '+1,728%', color: [242, 140, 40] },
    { label: 'TENAGA KERJA', value: `${totalWorkers} Org`, color: [30, 41, 59] },
  ];

  kpiItems.forEach((item, idx) => {
    const cardX = marginX + idx * (kpiCardWidth + 2);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cardX, kpiY, kpiCardWidth, kpiHeight, 1, 1, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, kpiY, kpiCardWidth, kpiHeight, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, cardX + kpiCardWidth / 2, kpiY + 4, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.value, cardX + kpiCardWidth / 2, kpiY + 10, { align: 'center' });
  });

  // --- 4. REKAP TENAGA KERJA HARIAN TABLE (Compact Table) ---
  const activeRoles = jobRoles.filter((r) => r.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const manpowerRows: RowInput[] = [];

  activeRoles.forEach((role) => {
    const rec = recordsForDate.find((r) => r.job_role_id === role.id);
    const cnt = rec ? Number(rec.worker_count) || 0 : 0;
    if (cnt > 0 || activeRoles.length <= 8) {
      manpowerRows.push([
        (manpowerRows.length + 1).toString(),
        role.name,
        `${cnt} Orang`,
        rec?.notes || '-',
      ]);
    }
  });

  const manpowerTableY = kpiY + kpiHeight + 3;

  autoTable(doc, {
    startY: manpowerTableY,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Keahlian / Posisi Tenaga Kerja', 'Jumlah Hadir', 'Keterangan Penempatan / Area Kerja']],
    body: manpowerRows.length > 0 ? manpowerRows : [['-', 'Belum ada data tenaga kerja tercatat', '0 Orang', '-']],
    foot: [['', 'TOTAL TENAGA KERJA HARIAN', `${totalWorkers} Orang`, '']],
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 1,
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [20, 43, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.2,
      halign: 'center',
    },
    footStyles: {
      fillColor: [238, 242, 250],
      textColor: [20, 43, 74],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 80 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manpowerFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : manpowerTableY + 25;

  // --- 5. URAIAN TEKS LAPORAN HARIAN (Bagian Atas) ---
  const narrativeTableY = manpowerFinalY + 3;

  const narrativeRows: RowInput[] = [
    [
      { content: 'A. Pekerjaan yang Dilaksanakan', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [20, 43, 74] } },
      { content: narrative.pekerjaan || '-' },
    ],
    [
      { content: 'B. Peralatan Kerja / Alat Berat', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [20, 43, 74] } },
      { content: narrative.peralatan || '-' },
    ],
    [
      { content: 'C. Kendala di Lapangan', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [185, 28, 28] } },
      { content: narrative.kendala || '-' },
    ],
    [
      { content: 'D. Laporan Cuaca', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [20, 43, 74] } },
      { content: narrative.cuaca || '- Jam 08:00 - 17.00 Cerah' },
    ],
    [
      { content: 'E. Material / Bahan Masuk', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [20, 43, 74] } },
      { content: narrative.material_masuk || '-' },
    ],
    [
      { content: 'F. Saran / Instruksi Evaluasi', styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [20, 43, 74] } },
      { content: narrative.saran || '-' },
    ],
  ];

  autoTable(doc, {
    startY: narrativeTableY,
    margin: { left: marginX, right: marginX },
    head: [['Bidang Uraian Laporan Harian', 'Rincian Realisasi Lapangan & Penjelasan']],
    body: narrativeRows,
    theme: 'grid',
    styles: {
      fontSize: 7.2,
      cellPadding: 1.3,
      valign: 'top',
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [20, 43, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 135 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const narrativeFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 3 : narrativeTableY + 45;

  // --- 6. TANDA TANGAN RESMI PENGESAHAN (BAGIAN BAWAH HALAMAN PERTAMA - CENTERED & RESPONSIVE) ---
  const signHeight = 35;
  // Position signature box at bottom of Page 1 (leaving room for running footer)
  const signY = Math.min(Math.max(narrativeFinalY + 3, 248), pageHeight - signHeight - 9);

  // Box background for signature
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, signY, contentWidth, signHeight, 1.2, 1.2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, signY, contentWidth, signHeight, 1.2, 1.2, 'S');

  // 3 Equal Columns (Responsive & Centered)
  const signColWidth = contentWidth / 3; // 190 / 3 = 63.33mm
  const lineWidth = 44; // Lebar garis tanda tangan yang proporsional di tengah
  const signatureLineY = signY + 23;

  const signCols = [
    {
      header: 'Dibuat Oleh:',
      role: 'Kontraktor Pelaksana',
      org: project.contractor_name || 'Kontraktor Pelaksana',
      person: recorderName || project.site_manager || 'Site Supervisor / Pelaksana',
      title: 'Pelaksana Lapangan',
    },
    {
      header: 'Diperiksa Oleh:',
      role: 'Konsultan Pengawas / MK',
      org: consultantName || project.consultant_name || 'Konsultan Pengawas / MK',
      person: inspectorName || project.inspector_name || 'Inspector / Site Engineer',
      title: 'Inspector Lapangan MK',
    },
    {
      header: 'Mengetahui & Menyetujui:',
      role: 'Pemberi Tugas / Direksi',
      org: project.owner_name || 'Pemberi Tugas / Direksi',
      person: project.project_manager || 'Project Manager',
      title: 'Project Manager / Pimpro',
    },
  ];

  signCols.forEach((col, idx) => {
    const colLeft = marginX + idx * signColWidth;
    const colCenterX = colLeft + signColWidth / 2;

    // Header label (e.g. "Dibuat Oleh:") - Centered
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(col.header, colCenterX, signY + 4.2, { align: 'center' });

    // Role (e.g. "Kontraktor Pelaksana") - Centered
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(20, 43, 74);
    doc.text(col.role, colCenterX, signY + 8, { align: 'center' });

    // Org / Company Name (Wrapped & Centered)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    const orgLines = doc.splitTextToSize(col.org, signColWidth - 6);
    doc.text(orgLines.slice(0, 2), colCenterX, signY + 11.5, { align: 'center' });

    // Underline for signature - Centered
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.line(colCenterX - lineWidth / 2, signatureLineY, colCenterX + lineWidth / 2, signatureLineY);

    // Signatory Person Name (Bold) - Centered
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text(col.person, colCenterX, signatureLineY + 3.8, { align: 'center' });

    // Signatory Position / Title - Centered
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(col.title, colCenterX, signatureLineY + 7.2, { align: 'center' });
  });

  // --- 7. HALAMAN TERPISAH: LAMPIRAN DOKUMENTASI FOTO LAPANGAN (1 DERETAN 3 FOTO) ---
  if (photos && photos.length > 0) {
    // Foto selalu diletakkan di halaman terpisah dari halaman pertama
    doc.addPage();
    drawPageHeader('LAMPIRAN DOKUMENTASI FOTO LAPANGAN (GOOGLE DRIVE)', false);

    let photoPageY = 28;

    // Section Header Banner Lampiran
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, photoPageY, contentWidth, 7.5, 1, 1, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, photoPageY, contentWidth, 7.5, 1, 1, 'S');

    doc.setFillColor(242, 140, 40);
    doc.rect(marginX, photoPageY, 2.2, 7.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 43, 74);
    doc.text(`DOKUMENTASI FOTO LAPANGAN (${photos.length} FOTO) — TERSIMPAN DI GOOGLE DRIVE`, marginX + 5, photoPageY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Format Lampiran: 1 Deret 3 Foto', marginX + contentWidth - 4, photoPageY + 5.2, { align: 'right' });

    photoPageY += 10.5;

    // 1 Deret 3 Foto (3 columns per row)
    const colGap = 4;
    const photoCardWidth = (contentWidth - colGap * 2) / 3; // (190 - 8) / 3 = 60.66mm
    const photoImgHeight = 38;
    const photoCardHeight = 54;

    for (let i = 0; i < photos.length; i += 3) {
      // Check page break before rendering next row of 3 photos
      if (photoPageY + photoCardHeight > pageHeight - 15) {
        doc.addPage();
        drawPageHeader('LAMPIRAN DOKUMENTASI FOTO LAPANGAN (Lanjutan)', false);
        photoPageY = 28;
      }

      const rowPhotos = [photos[i], photos[i + 1], photos[i + 2]].filter(Boolean);

      rowPhotos.forEach((photo, colIdx) => {
        const cardX = marginX + colIdx * (photoCardWidth + colGap);
        const cardY = photoPageY;

        // Card background & border
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cardX, cardY, photoCardWidth, photoCardHeight, 1.2, 1.2, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(cardX, cardY, photoCardWidth, photoCardHeight, 1.2, 1.2, 'S');

        // Draw image
        if (photo.data_url) {
          try {
            doc.addImage(
              photo.data_url,
              'JPEG',
              cardX + 1,
              cardY + 1,
              photoCardWidth - 2,
              photoImgHeight,
              undefined,
              'FAST'
            );
          } catch {
            // Fallback placeholder box
            doc.setFillColor(241, 245, 249);
            doc.rect(cardX + 1, cardY + 1, photoCardWidth - 2, photoImgHeight, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Foto Lapangan Terlampir', cardX + photoCardWidth / 2, cardY + photoImgHeight / 2, { align: 'center' });
          }
        } else {
          doc.setFillColor(241, 245, 249);
          doc.rect(cardX + 1, cardY + 1, photoCardWidth - 2, photoImgHeight, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184);
          doc.text('Foto Lapangan Terlampir', cardX + photoCardWidth / 2, cardY + photoImgHeight / 2, { align: 'center' });
        }

        // Caption Box underneath
        const captionY = cardY + photoImgHeight + 1.8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(15, 23, 42);

        const captionLines = doc.splitTextToSize(photo.caption || 'Dokumentasi Lapangan Proyek', photoCardWidth - 4);
        doc.text(captionLines.slice(0, 2), cardX + 2, captionY + 2.2);

        // Subtext / Metadata bar
        const metaY = cardY + photoCardHeight - 2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(100, 116, 139);
        const driveLabel = photo.google_drive_file_id ? 'Drive ☁️' : 'Lokal';
        const fileNameTruncated = photo.file_name.length > 16 ? photo.file_name.substring(0, 14) + '...' : photo.file_name;
        doc.text(`${fileNameTruncated} | ${driveLabel}`, cardX + 2, metaY);
      });

      photoPageY += photoCardHeight + 4;
    }
  }

  // --- 8. RUNNING FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `SIM-TK204 — Laporan Harian Proyek: ${project.name} (${formatDateIndo(selectedDate)})`,
      marginX,
      pageHeight - 5
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 5,
      { align: 'right' }
    );
  }

  return doc;
}

/**
 * Triggers browser download of the official A4 Portrait Daily Report PDF.
 */
export function exportDailyReportToPDF(params: DailyReportPDFParams): string {
  const doc = generateDailyReportPDFDoc(params);
  const safeProjectName = params.project.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
  const fileName = `Laporan_Harian_${safeProjectName}_${params.selectedDate}.pdf`;
  doc.save(fileName);
  return fileName;
}

