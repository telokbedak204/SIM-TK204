import React from 'react';
import {
  Calendar,
  ClipboardEdit,
  FileSpreadsheet,
  FileText,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Project, JobRole, DailyManpower, MatrixSummary } from '../types';
import { StatCards } from '../components/dashboard/StatCards';
import { ManpowerCharts } from '../components/dashboard/ManpowerCharts';
import { WeeklyMatrixTable } from '../components/manpower/WeeklyMatrixTable';
import { formatDateIndo } from '../lib/calculations';

interface DashboardPageProps {
  project: Project;
  jobRoles: JobRole[];
  dailyRecords: DailyManpower[];
  summary: MatrixSummary;
  selectedDate: string;
  startDateStr: string;
  endDateStr: string;
  onSelectDate: (date: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onNavigateToInput: () => void;
  onNavigateToReport: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  project,
  jobRoles,
  dailyRecords,
  summary,
  selectedDate,
  startDateStr,
  endDateStr,
  onSelectDate,
  onDateRangeChange,
  onNavigateToInput,
  onNavigateToReport,
  onExportExcel,
  onExportPDF,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Project Hero Header Card */}
      <div className="bg-[#142B4A] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F28C28]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/20 text-[#F28C28] border border-orange-500/30">
                {project.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
                Status: {project.status}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight break-words leading-snug">
              {project.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Kontraktor: <strong className="text-white">{project.contractor_name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Konsultan MK: <strong className="text-white">{project.consultant_name}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 w-full lg:w-auto">
            <button
              onClick={onNavigateToInput}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 min-h-[44px]"
            >
              <ClipboardEdit className="w-4 h-4" />
              <span>Input Tenaga Kerja</span>
            </button>

            <button
              onClick={onNavigateToReport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold border border-slate-700 transition-all active:scale-95 min-h-[44px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Laporan Mingguan</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Period & Date Switcher) */}
        <div className="mt-5 pt-4 border-t border-[#1c3a63] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-[#F28C28] shrink-0" />
            <span className="font-semibold">Filter Rentang Periode Monitoring:</span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center justify-between gap-1.5 bg-slate-900/60 border border-slate-700 px-3 py-2 rounded-lg min-h-[44px]">
              <span className="text-[11px] text-slate-400">Dari:</span>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => onDateRangeChange(e.target.value, endDateStr)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between gap-1.5 bg-slate-900/60 border border-slate-700 px-3 py-2 rounded-lg min-h-[44px]">
              <span className="text-[11px] text-slate-400">Sampai:</span>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => onDateRangeChange(startDateStr, e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Quick 7 days demo button */}
            <button
              onClick={() => onDateRangeChange('2026-10-02', '2026-10-08')}
              className="xs:col-span-2 sm:col-span-1 px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/40 font-semibold transition-colors min-h-[44px] flex items-center justify-center text-center"
            >
              Periode Demo (2–8 Okt)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards */}
      <StatCards
        summary={summary}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      {/* 3. Recharts Graphics */}
      <ManpowerCharts summary={summary} />

      {/* 4. Weekly Monitoring Matrix Table */}
      <WeeklyMatrixTable
        summary={summary}
        project={project}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        onExportExcel={onExportExcel}
        onExportPDF={onExportPDF}
        onDateClick={(d) => {
          onSelectDate(d);
          onNavigateToInput();
        }}
      />
    </div>
  );
};
