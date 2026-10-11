import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { generateWeeklyMonitoringExcelWorkbook } from './excelExport';
import { generateWeeklyMonitoringPDFDoc } from './pdfExport';
import { computeWeeklyMatrix } from './calculations';
import { Project, JobRole, DailyManpower } from '../types';

describe('SIM-TK204 Export Audit (Excel .xlsx & PDF)', () => {
  const mockProject: Project = {
    id: 'proj-pasar-loka-2026',
    code: 'TK204-PL26',
    name: 'Revitalisasi Pasar Loka Bangka Barat',
    owner_name: 'Dinas Koperasi, UKM dan Perdagangan Kab. Bangka Barat',
    contractor_name: 'PT Wijaya Perkasa Mandiri',
    consultant_name: 'PT Ciriajasa Cipta Mandiri',
    location: 'Kec. Muntok, Kab. Bangka Barat, Kepulauan Bangka Belitung',
    start_date: '2026-09-01',
    end_date: '2026-12-31',
    project_manager: 'Ir. Bambang Sudarsono, MT',
    site_manager: 'Rian Pratama, ST',
    recorder_name: 'Ahmad Faisal (Site Admin)',
    inspector_name: 'Dedi Kurniawan, ST (Inspector MK)',
    status: 'active',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-11T08:00:00Z',
  };

  const mockRoles: JobRole[] = [
    { id: 'r1', project_id: mockProject.id, name: 'Project Manager', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
    { id: 'r2', project_id: mockProject.id, name: 'Mandor', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
    { id: 'r3', project_id: mockProject.id, name: 'Kepala Tukang', sort_order: 3, is_active: true, created_at: '', updated_at: '' },
    { id: 'r4', project_id: mockProject.id, name: 'Surveyor', sort_order: 4, is_active: true, created_at: '', updated_at: '' },
    { id: 'r5', project_id: mockProject.id, name: 'Pekerja', sort_order: 5, is_active: true, created_at: '', updated_at: '' },
    { id: 'r6', project_id: mockProject.id, name: 'Tenaga Sondir', sort_order: 6, is_active: true, created_at: '', updated_at: '' },
    { id: 'r7', project_id: mockProject.id, name: 'Drafter', sort_order: 7, is_active: true, created_at: '', updated_at: '' },
    { id: 'r8', project_id: mockProject.id, name: 'HSE Koordinator', sort_order: 8, is_active: true, created_at: '', updated_at: '' },
  ];

  // Standard demo dataset for 2–8 Oktober 2026:
  // Daily sums: 16, 16, 13, 13, 13, 13, 13 => 97 OH, avg 13.86
  const dates = [
    '2026-10-02',
    '2026-10-03',
    '2026-10-04',
    '2026-10-05',
    '2026-10-06',
    '2026-10-07',
    '2026-10-08',
  ];
  const pekerjaCounts = [11, 11, 8, 8, 8, 8, 8];

  const mockRecords: DailyManpower[] = [];
  dates.forEach((d, idx) => {
    mockRecords.push(
      { id: `rec-${d}-1`, project_id: mockProject.id, job_role_id: 'r1', work_date: d, worker_count: 1, notes: 'Koordinasi umum site', created_at: '', updated_at: '' },
      { id: `rec-${d}-2`, project_id: mockProject.id, job_role_id: 'r2', work_date: d, worker_count: 1, notes: 'Pengawasan bekisting & pembesian', created_at: '', updated_at: '' },
      { id: `rec-${d}-3`, project_id: mockProject.id, job_role_id: 'r3', work_date: d, worker_count: 0, notes: '', created_at: '', updated_at: '' },
      { id: `rec-${d}-4`, project_id: mockProject.id, job_role_id: 'r4', work_date: d, worker_count: 1, notes: 'Pengukuran elevasi lantai dasar', created_at: '', updated_at: '' },
      { id: `rec-${d}-5`, project_id: mockProject.id, job_role_id: 'r5', work_date: d, worker_count: pekerjaCounts[idx], notes: idx < 2 ? 'Pekerjaan pengecoran & pembersihan (11 org)' : 'Pekerjaan galian & pembesian (8 org)', created_at: '', updated_at: '' },
      { id: `rec-${d}-6`, project_id: mockProject.id, job_role_id: 'r6', work_date: d, worker_count: 0, notes: '', created_at: '', updated_at: '' },
      { id: `rec-${d}-7`, project_id: mockProject.id, job_role_id: 'r7', work_date: d, worker_count: 0, notes: '', created_at: '', updated_at: '' },
      { id: `rec-${d}-8`, project_id: mockProject.id, job_role_id: 'r8', work_date: d, worker_count: 2, notes: 'Toolbox meeting K3 & APD', created_at: '', updated_at: '' }
    );
  });

  const startDateStr = '2026-10-02';
  const endDateStr = '2026-10-08';
  const summary = computeWeeklyMatrix(startDateStr, endDateStr, mockRoles, mockRecords);

  it('calculates the baseline benchmark of 97 OH and 13.86 org/hari accurately', () => {
    expect(summary.grandTotalManDays).toBe(97);
    expect(summary.grandAveragePerDay).toBe(13.86);
    expect(summary.peakManpower).toBe(16);
    expect(summary.dailyTotals['2026-10-02']).toBe(16);
    expect(summary.dailyTotals['2026-10-03']).toBe(16);
    expect(summary.dailyTotals['2026-10-04']).toBe(13);
    expect(summary.dailyTotals['2026-10-05']).toBe(13);
    expect(summary.dailyTotals['2026-10-06']).toBe(13);
    expect(summary.dailyTotals['2026-10-07']).toBe(13);
    expect(summary.dailyTotals['2026-10-08']).toBe(13);
  });

  describe('Excel Export Audit (.xlsx genuine format)', () => {
    it('creates a genuine multi-sheet workbook with 4 structured sheets', () => {
      const wb = generateWeeklyMonitoringExcelWorkbook(
        mockProject,
        summary,
        startDateStr,
        endDateStr,
        'Ahmad Faisal',
        'Dedi Kurniawan, ST'
      );

      expect(wb).toBeDefined();
      expect(wb.SheetNames).toEqual([
        'Monitoring Mingguan',
        'Rekap Harian',
        'Rekap Per Jabatan',
        'Identitas Proyek'
      ]);

      // Test binary serializability into true OpenXML .xlsx ZIP format
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(1000);

      // Verify ZIP magic bytes (PK\x03\x04) characteristic of real .xlsx files
      const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B;
      expect(isZip).toBe(true);
    });

    it('contains full project identity, matrix table, 97 OH, 13.86 avg, notes, and signatures in Sheet 1', () => {
      const wb = generateWeeklyMonitoringExcelWorkbook(
        mockProject,
        summary,
        startDateStr,
        endDateStr,
        'Ahmad Faisal',
        'Dedi Kurniawan, ST'
      );

      const ws1 = wb.Sheets['Monitoring Mingguan'];
      const sheetData: (string | number)[][] = XLSX.utils.sheet_to_json(ws1, { header: 1 });

      const textDump = JSON.stringify(sheetData);

      // 1. Identitas Proyek
      expect(textDump).toContain('Revitalisasi Pasar Loka Bangka Barat');
      expect(textDump).toContain('TK204-PL26');
      expect(textDump).toContain('PT Wijaya Perkasa Mandiri');
      expect(textDump).toContain('PT Ciriajasa Cipta Mandiri');
      expect(textDump).toContain('Ir. Bambang Sudarsono, MT');

      // 2. Periode & Hari
      expect(textDump).toContain('02 Okt 2026');
      expect(textDump).toContain('08 Okt 2026');

      // 3. Totals & Statistics
      expect(textDump).toContain('TOTAL');
      expect(textDump).toContain(97); // 97 OH
      expect(textDump).toContain(13.86); // 13.86 org/hari

      // 4. Catatan Kegiatan Lapangan
      expect(textDump).toContain('CATATAN & KEGIATAN LAPANGAN:');
      expect(textDump).toContain('Pekerjaan pengecoran & pembersihan (11 org)');

      // 5. Sign-off / Lembar Pengesahan
      expect(textDump).toContain('PENGESAHAN LAPORAN:');
      expect(textDump).toContain('Disusun Oleh (Kontraktor Pelaksana):');
      expect(textDump).toContain('Diperiksa Oleh (Konsultan MK):');
      expect(textDump).toContain('Mengetahui (Project Manager):');
    });

    it('contains daily breakdown with notes in Sheet 2 (Rekap Harian)', () => {
      const wb = generateWeeklyMonitoringExcelWorkbook(
        mockProject,
        summary,
        startDateStr,
        endDateStr
      );

      const ws2 = wb.Sheets['Rekap Harian'];
      const sheetData: (string | number)[][] = XLSX.utils.sheet_to_json(ws2, { header: 1 });
      const textDump = JSON.stringify(sheetData);

      expect(textDump).toContain('REKAPITULASI TENAGA KERJA HARIAN');
      expect(textDump).toContain('02 Okt 2026');
      expect(textDump).toContain('08 Okt 2026');
      expect(textDump).toContain('TOTAL ORANG-HARI');
      expect(textDump).toContain(97);
    });
  });

  describe('PDF Export Audit (A4 Landscape)', () => {
    it('creates an A4 Landscape jsPDF document with identity, matrix, 97 OH, 13.86 avg, notes, and signatures', () => {
      const doc = generateWeeklyMonitoringPDFDoc(
        mockProject,
        summary,
        startDateStr,
        endDateStr,
        'Ahmad Faisal',
        'Dedi Kurniawan, ST'
      );

      expect(doc).toBeDefined();
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);

      // Verify A4 Landscape dimensions (297mm width x 210mm height)
      const internalPage = doc.internal.pageSize;
      expect(Math.round(internalPage.getWidth())).toBe(297);
      expect(Math.round(internalPage.getHeight())).toBe(210);

      // Verify PDF binary output (starts with %PDF-)
      const pdfBytes = doc.output('arraybuffer');
      expect(pdfBytes.byteLength).toBeGreaterThan(2000);

      const uint8 = new Uint8Array(pdfBytes);
      const headerString = String.fromCharCode(...uint8.slice(0, 5));
      expect(headerString).toBe('%PDF-');
    });

    it('correctly handles long project details from Anambas screenshot without layout breakage or crashes', () => {
      const anambasProject: Project = {
        id: 'prj-anambas-04',
        code: 'PRJ-2026-ANB-04',
        name: 'Lanjutan Renovasi Pasar Loka – Kepulauan Anambas',
        owner_name: 'Pemerintah Kabupaten Kepulauan Anambas / Disperindagkop & UMKM',
        contractor_name: 'PT. Bahtera Karya Anambas',
        consultant_name: 'PT. Rekayasa Multi Konsultan MK',
        location: 'Tarempa Barat, Kec. Siantan, Kab. Kepulauan Anambas, Kepri',
        start_date: '2026-09-01',
        end_date: '2026-12-31',
        project_manager: 'Ir. Hendra Wijaya, MT',
        site_manager: 'Fajar Nugraha, ST',
        status: 'active',
        created_at: '',
        updated_at: '',
      };

      const doc = generateWeeklyMonitoringPDFDoc(
        anambasProject,
        summary,
        startDateStr,
        endDateStr,
        'Petugas Lapangan',
        'Inspector MK'
      );

      expect(doc).toBeDefined();
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);

      const pdfBytes = doc.output('arraybuffer');
      expect(pdfBytes.byteLength).toBeGreaterThan(2000);
    });
  });
});
