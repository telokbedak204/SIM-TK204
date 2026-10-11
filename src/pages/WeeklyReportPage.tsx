import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  UserCheck,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Project, MatrixSummary } from '../types';
import { WeeklyMatrixTable } from '../components/manpower/WeeklyMatrixTable';
import { formatDateIndo, formatDecimalIndo } from '../lib/calculations';

interface WeeklyReportPageProps {
  project: Project;
  summary: MatrixSummary;
  startDateStr: string;
  endDateStr: string;
  onDateRangeChange: (start: string, end: string) => void;
  onExportExcel: (recorder?: string, inspector?: string) => void;
  onExportPDF: (recorder?: string, inspector?: string) => void;
}

export const WeeklyReportPage: React.FC<WeeklyReportPageProps> = ({
  project,
  summary,
  startDateStr,
  endDateStr,
  onDateRangeChange,
  onExportExcel,
  onExportPDF,
}) => {
  const [recorderName, setRecorderName] = useState(
    project.recorder_name || project.site_manager || 'Ahmad Faisal (Site Admin)'
  );
  const [inspectorName, setInspectorName] = useState(
    project.inspector_name || 'Dedi Kurniawan, ST (Inspector MK)'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#142B4A]"></span>
              <h2 className="text-lg font-bold text-[#142B4A]">
                Laporan Administrasi & Rekapitulasi Tenaga Kerja
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Laporan resmi format standar kontraktor & konsultan pengawas MK untuk proyek{' '}
              <span className="font-semibold text-slate-700">{project.name}</span>
            </p>
          </div>

          {/* Date range filter */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs min-h-[44px]">
              <span className="text-slate-500">Mulai:</span>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => onDateRangeChange(e.target.value, endDateStr)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs min-h-[44px]">
              <span className="text-slate-500">Sampai:</span>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => onDateRangeChange(startDateStr, e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => onDateRangeChange('2026-10-02', '2026-10-08')}
              className="xs:col-span-2 sm:col-span-1 px-4 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-[#F28C28] text-xs font-bold transition-colors min-h-[44px] flex items-center justify-center"
            >
              Demo 7 Hari
            </button>
          </div>
        </div>

        {/* Signatures Configuration Box for Official Printouts */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              1. Disusun Oleh (Kontraktor):
            </label>
            <input
              type="text"
              value={recorderName}
              onChange={(e) => setRecorderName(e.target.value)}
              placeholder="Nama Petugas Pencatat Lapangan"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#F28C28] min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              2. Diperiksa Oleh (Konsultan MK):
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="Nama Pengawas / Inspector MK"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#F28C28] min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              3. Mengetahui (Project Manager):
            </label>
            <input
              type="text"
              value={project.project_manager}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed min-h-[42px]"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Periode Hari</span>
          <div className="text-xl font-black text-slate-900 mt-1">{summary.calendarDaysCount} Hari</div>
          <span className="text-[10px] text-slate-500">Hari kalender laporan</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Orang-Hari</span>
          <div className="text-xl font-black text-[#F28C28] mt-1">{summary.grandTotalManDays} OH</div>
          <span className="text-[10px] text-slate-500">Jumlah kumulatif</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Rata-rata Harian</span>
          <div className="text-xl font-black text-[#142B4A] mt-1">{formatDecimalIndo(summary.grandAveragePerDay)}</div>
          <span className="text-[10px] text-slate-500">Orang / hari</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Puncak Tenaga Kerja</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{summary.peakManpower} Org</div>
          <span className="text-[10px] text-slate-500">Maksimal kehadiran</span>
        </div>
      </div>

      {/* Weekly Matrix Table Component */}
      <WeeklyMatrixTable
        summary={summary}
        project={project}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        onExportExcel={() => onExportExcel(recorderName, inspectorName)}
        onExportPDF={() => onExportPDF(recorderName, inspectorName)}
      />

      {/* Export Description & Specs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-3">
          Spesifikasi Format Berkas Ekspor SIM-TK204:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Format Excel (.xlsx) 4 Lembar Kerja:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-emerald-800 text-[11px]">
              <li><strong>Lembar 1: Monitoring Mingguan</strong> — Matriks Keahlian × Tanggal + Total & Rata-rata.</li>
              <li><strong>Lembar 2: Rekap Harian</strong> — Daftar tanggal, jumlah orang, dan catatan lapangan.</li>
              <li><strong>Lembar 3: Rekap Per Jabatan</strong> — Total orang-hari dan persentase alokasi tiap keahlian.</li>
              <li><strong>Lembar 4: Identitas Proyek</strong> — Spesifikasi teknis, kontraktor, MK, dan pengesahan.</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/80">
            <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Format PDF (A4 Landscape):</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-blue-800 text-[11px]">
              <li>Tata letak A4 Landscape proporsional untuk tabel periode banyak kolom.</li>
              <li>Kop identitas proyek konstruksi resmi dengan warna Navy #142B4A & Orange #F28C28.</li>
              <li>3 Kolom lembar pengesahan tanda tangan (Kontraktor, MK, dan Project Manager).</li>
              <li>Dapat langsung diunduh (.pdf) maupun dicetak printer proyek.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
