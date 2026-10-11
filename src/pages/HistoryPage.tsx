import React, { useState } from 'react';
import {
  Archive,
  Search,
  Calendar,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Project, DailyManpower, JobRole } from '../types';
import { formatDateIndo, computeWeeklyMatrix } from '../lib/calculations';
import { exportWeeklyMonitoringToExcel } from '../lib/excelExport';
import { exportWeeklyMonitoringToPDF } from '../lib/pdfExport';

interface HistoryPageProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (id: string) => void;
  onOpenReport: (start: string, end: string) => void;
  allDailyRecords: DailyManpower[];
  allRoles: JobRole[];
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenReport,
  allDailyRecords,
  allRoles,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject.id);
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('2026');

  const currentProject = projects.find((p) => p.id === selectedProjectId) || activeProject;
  const projectRecords = allDailyRecords.filter((r) => r.project_id === currentProject.id);

  // Group recorded dates into weeks (chunks of 7 days)
  const uniqueDates = Array.from(new Set(projectRecords.map((r) => r.work_date))).sort();

  // Create archived period packages (e.g. weekly packages)
  const packages: { id: string; name: string; start: string; end: string; count: number }[] = [];

  // Default demo package
  packages.push({
    id: 'pkg-demo',
    name: 'Monitoring Mingguan Periode Demo (2–8 Oktober 2026)',
    start: '2026-10-02',
    end: '2026-10-08',
    count: 7,
  });

  // If there are other dates, package them
  if (uniqueDates.length > 0) {
    const minDate = uniqueDates[0];
    const maxDate = uniqueDates[uniqueDates.length - 1];
    if (minDate !== '2026-10-02' || maxDate !== '2026-10-08') {
      packages.push({
        id: 'pkg-full',
        name: `Seluruh Catatan Lapangan (${formatDateIndo(minDate)} s/d ${formatDateIndo(maxDate)})`,
        start: minDate,
        end: maxDate,
        count: uniqueDates.length,
      });
    }
  }

  const handleExportExcel = (start: string, end: string) => {
    const summary = computeWeeklyMatrix(start, end, allRoles, projectRecords);
    exportWeeklyMonitoringToExcel(currentProject, summary, start, end);
  };

  const handleExportPDF = (start: string, end: string) => {
    const summary = computeWeeklyMatrix(start, end, allRoles, projectRecords);
    exportWeeklyMonitoringToPDF(currentProject, summary, start, end);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#142B4A]"></span>
            <h2 className="text-lg font-bold text-[#142B4A]">
              Riwayat & Arsip Laporan Proyek
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Telusuri arsip berkas monitoring mingguan, rekap bulanan, dan cetak ulang laporan resmi
          </p>
        </div>

        {/* Project Selector Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Proyek:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              onSelectProject(e.target.value);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Package List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const summary = computeWeeklyMatrix(pkg.start, pkg.end, allRoles, projectRecords);

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#142B4A] border border-blue-200">
                    Paket Laporan
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {summary.calendarDaysCount} Hari Kalender
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug mb-2">
                  {pkg.name}
                </h3>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 mb-4 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Rentang Tanggal:</span>
                    <span className="font-semibold">{formatDateIndo(pkg.start)} s/d {formatDateIndo(pkg.end)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Orang-Hari:</span>
                    <span className="font-bold text-[#F28C28]">{summary.grandTotalManDays} OH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Rata-rata Harian:</span>
                    <span className="font-bold text-[#142B4A]">{summary.grandAveragePerDay} Org/Hari</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Puncak Kehadiran:</span>
                    <span className="font-bold text-emerald-700">{summary.peakManpower} Orang</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onOpenReport(pkg.start, pkg.end)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142B4A] hover:bg-[#1c3a63] text-white text-xs font-semibold transition-colors min-h-[40px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Monitoring</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleExportExcel(pkg.start, pkg.end)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors min-h-[40px]"
                    title="Unduh Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Excel</span>
                  </button>

                  <button
                    onClick={() => handleExportPDF(pkg.start, pkg.end)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors min-h-[40px]"
                    title="Unduh PDF Resmi"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
