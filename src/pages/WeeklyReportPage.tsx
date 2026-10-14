import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  UserCheck,
  Printer,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
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

function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  // Generate automatic weekly cycles from project start date
  const availableWeeks = useMemo(() => {
    const startContract = project.start_date || '2026-08-28';
    const today = new Date().toISOString().split('T')[0];
    const items: { weekNumber: number; name: string; start: string; end: string; isCurrent: boolean }[] = [];

    let currentStart = startContract;
    let weekNumber = 1;

    // Generate up to 5 weeks past today or minimum 8 weeks
    while (weekNumber <= 150) {
      const currentEnd = addDays(currentStart, 6);
      const isCurrent = today >= currentStart && today <= currentEnd;

      items.push({
        weekNumber,
        name: `Minggu Ke-${weekNumber} (${formatDateIndo(currentStart)} - ${formatDateIndo(currentEnd)})`,
        start: currentStart,
        end: currentEnd,
        isCurrent,
      });

      if (currentStart > today && weekNumber >= 8) {
        break;
      }

      currentStart = addDays(currentEnd, 1);
      weekNumber++;
    }

    return items;
  }, [project.start_date]);

  // Find if current start & end match an auto week
  const currentWeekIndex = availableWeeks.findIndex(
    (w) => w.start === startDateStr && w.end === endDateStr
  );

  const handleSelectWeek = (weekNumberStr: string) => {
    if (weekNumberStr === 'custom') return;
    const weekNum = parseInt(weekNumberStr, 10);
    const found = availableWeeks.find((w) => w.weekNumber === weekNum);
    if (found) {
      onDateRangeChange(found.start, found.end);
    }
  };

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      const prev = availableWeeks[currentWeekIndex - 1];
      onDateRangeChange(prev.start, prev.end);
    } else if (currentWeekIndex === -1 && availableWeeks.length > 0) {
      const first = availableWeeks[0];
      onDateRangeChange(first.start, first.end);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex >= 0 && currentWeekIndex < availableWeeks.length - 1) {
      const next = availableWeeks[currentWeekIndex + 1];
      onDateRangeChange(next.start, next.end);
    } else if (currentWeekIndex === -1 && availableWeeks.length > 0) {
      const last = availableWeeks[availableWeeks.length - 1];
      onDateRangeChange(last.start, last.end);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Automatic Week Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

          {/* Automatic Weekly Switcher & Date Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Week navigation buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handlePrevWeek}
                disabled={currentWeekIndex === 0}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Minggu Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#F28C28]" />
                <select
                  value={currentWeekIndex >= 0 ? availableWeeks[currentWeekIndex].weekNumber : 'custom'}
                  onChange={(e) => handleSelectWeek(e.target.value)}
                  className="bg-transparent font-bold text-xs text-slate-800 focus:outline-hidden cursor-pointer max-w-[200px] sm:max-w-xs truncate"
                >
                  {availableWeeks.map((w) => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      Minggu {w.weekNumber} ({formatDateIndo(w.start)} - {formatDateIndo(w.end)}) {w.isCurrent ? '★ Aktif' : ''}
                    </option>
                  ))}
                  <option value="custom">-- Rentang Tanggal Kustom --</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextWeek}
                disabled={currentWeekIndex === availableWeeks.length - 1}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Minggu Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Date range pickers */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-500 text-[11px]">Tgl:</span>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => onDateRangeChange(e.target.value, endDateStr)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => onDateRangeChange(startDateStr, e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs"
              />
            </div>
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
              3. Mengetahui (Direksi Teknis):
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
    </div>
  );
};
