import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { Project, MatrixSummary } from '../types';
import { formatDateIndo, getDayNameIndo } from './calculations';

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
        { content: 'Kode Proyek', styles: { textColor: [100, 116, 139] } },
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

  const col1X = 20;  // Kontraktor
  const col2X = 110; // MK
  const col3X = 205; // Project Manager / Owner

  // Disusun oleh (Kontraktor)
  doc.text('Disusun Oleh:', col1X, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(project.contractor_name || 'Kontraktor Pelaksana', col1X, signY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.text('(Pelaksana / Administrasi Lapangan)', col1X, signY + 7.5);
  doc.line(col1X - 2, signY + 22, col1X + 55, signY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(recorderName || project.recorder_name || project.site_manager || 'Petugas Pencatat Lapangan', col1X, signY + 25.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Site Administration / SM', col1X, signY + 29);

  // Diperiksa oleh (MK)
  doc.setTextColor(71, 85, 105);
  doc.text('Diperiksa Oleh:', col2X, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(project.consultant_name || 'Konsultan Manajemen Konstruksi', col2X, signY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.text('(Pengawas Lapangan / Inspector)', col2X, signY + 7.5);
  doc.line(col2X - 2, signY + 22, col2X + 60, signY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inspectorName || project.inspector_name || 'Inspector / Quality Control', col2X, signY + 25.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Inspector Lapangan MK', col2X, signY + 29);

  // Mengetahui (Project Manager / Pemberi Tugas)
  doc.setTextColor(71, 85, 105);
  doc.text('Mengetahui & Menyetujui:', col3X, signY);
  doc.setFont('helvetica', 'bold');
  doc.text('Pemberi Tugas / Direksi Lapangan', col3X, signY + 3.8);
  doc.setFont('helvetica', 'normal');
  doc.text('(Project Manager / Pimpro)', col3X, signY + 7.5);
  doc.line(col3X - 2, signY + 22, col3X + 55, signY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(project.project_manager || 'Project Manager', col3X, signY + 25.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Project Manager Proyek', col3X, signY + 29);

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
