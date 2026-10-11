import React, { useState } from 'react';
import {
  TableProperties,
  LayoutGrid,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MatrixSummary, Project } from '../../types';
import { formatDateIndo, getDayNameIndo, formatDecimalIndo } from '../../lib/calculations';

interface WeeklyMatrixTableProps {
  summary: MatrixSummary;
  project: Project;
  startDateStr: string;
  endDateStr: string;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onDateClick?: (date: string) => void;
}

export const WeeklyMatrixTable: React.FC<WeeklyMatrixTableProps> = ({
  summary,
  project,
  startDateStr,
  endDateStr,
  onExportExcel,
  onExportPDF,
  onDateClick,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header bar with actions */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F28C28]"></span>
            <h3 className="font-extrabold text-base sm:text-lg text-[#142B4A] tracking-tight">
              MONITORING TENAGA KERJA
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriks rekapitulasi harian & total orang-hari ({summary.calendarDaysCount} hari kalender:{' '}
            <span className="font-semibold text-slate-700">
              {formatDateIndo(startDateStr)} s/d {formatDateIndo(endDateStr)}
            </span>
            )
          </p>
        </div>

        {/* Buttons: Switch view (table vs cards on mobile) + Exports */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* View toggle (cards for mobile, table for desktop) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs min-h-[44px]">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors min-h-[40px] ${
                viewMode === 'table'
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel Matriks Lengkap"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors min-h-[40px] ${
                viewMode === 'cards'
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kartu Per Jabatan (Mobile-Friendly)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#142B4A] hover:bg-[#1a385f] active:bg-[#0f213a] text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: MATRIX TABLE (Desktop & Horizontal Scrollable for Mobile) */}
      {viewMode === 'table' ? (
        <div className="relative w-full">
          {/* Mobile scroll hint */}
          <div className="md:hidden bg-amber-50/90 text-amber-900 text-[11px] px-3 py-1.5 border-b border-amber-200 flex items-center justify-between">
            <span>👉 Geser tabel ke kanan untuk melihat seluruh tanggal & total</span>
            <button
              onClick={() => setViewMode('cards')}
              className="text-[#F28C28] font-bold underline ml-2 shrink-0"
            >
              Mode Kartu
            </button>
          </div>
          <div className="overflow-x-auto relative w-full scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse min-w-[760px]">
            {/* Header Row 1 & 2 */}
            <thead>
              <tr className="bg-[#142B4A] text-white border-b border-slate-700">
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-center font-bold uppercase w-12 sticky left-0 z-20 bg-[#142B4A] border-r border-[#1c3a63]"
                >
                  No.
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-3 font-bold uppercase min-w-[180px] sticky left-12 z-20 bg-[#142B4A] border-r border-[#1c3a63]"
                >
                  Keahlian / Jabatan
                </th>
                {summary.dates.map((dateStr) => {
                  const dayName = getDayNameIndo(dateStr);
                  const isPeak = summary.dailyTotals[dateStr] === summary.peakManpower && summary.peakManpower > 0;
                  return (
                    <th
                      key={dateStr}
                      className={`py-2 px-2 text-center font-bold min-w-[76px] border-r border-[#1c3a63] cursor-pointer hover:bg-slate-800 transition-colors ${
                        isPeak ? 'bg-orange-950/60' : ''
                      }`}
                      onClick={() => onDateClick?.(dateStr)}
                      title="Klik untuk melihat/input tanggal ini"
                    >
                      <div className="text-[10px] text-slate-300 font-normal">{dayName}</div>
                      <div className="text-xs text-white font-bold">{formatDateIndo(dateStr).slice(0, 6)}</div>
                    </th>
                  );
                })}
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-center font-bold uppercase min-w-[90px] bg-[#1a385f] text-orange-300 border-l border-r border-[#1c3a63]"
                >
                  Jumlah OH
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-center font-bold uppercase min-w-[90px] bg-[#1a385f] text-slate-200"
                >
                  Rata-rata/Hari
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {summary.rows.map((row, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={row.roleId}
                    className={`hover:bg-amber-50/40 transition-colors ${
                      isEven ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {/* Sticky Number */}
                    <td
                      className={`py-2.5 px-3 text-center font-medium text-slate-500 sticky left-0 z-10 border-r border-slate-200 ${
                        isEven ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </td>

                    {/* Sticky Role Name */}
                    <td
                      className={`py-2.5 px-3 font-semibold text-slate-800 sticky left-12 z-10 border-r border-slate-200 ${
                        isEven ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{row.roleName}</span>
                        {!row.isActive && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-slate-600">
                            Non-aktif
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date Count Cells */}
                    {summary.dates.map((d) => {
                      const count = row.countsByDate[d] || 0;
                      const hasNotes = Boolean(row.notesByDate[d]);
                      return (
                        <td
                          key={d}
                          className="py-2.5 px-2 text-center text-slate-700 border-r border-slate-100 font-mono text-xs relative group"
                        >
                          <span
                            className={
                              count > 0
                                ? 'font-bold text-slate-900'
                                : 'text-slate-300'
                            }
                          >
                            {count}
                          </span>
                          {hasNotes && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#F28C28] absolute top-1 right-1"
                              title={row.notesByDate[d]}
                            />
                          )}
                        </td>
                      );
                    })}

                    {/* Total Man-Days for this role */}
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900 bg-orange-50/40 border-r border-slate-200">
                      {row.totalManDays}
                    </td>

                    {/* Average per calendar day for this role */}
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700 bg-slate-50/40">
                      {formatDecimalIndo(row.averagePerDay)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer: Daily Totals & Grand Totals */}
            <tfoot>
              <tr className="bg-slate-100/90 text-slate-900 font-bold border-t-2 border-slate-300">
                <td
                  colSpan={2}
                  className="py-3 px-3 text-right uppercase tracking-wider sticky left-0 z-20 bg-slate-200/90 border-r border-slate-300 text-slate-800"
                >
                  Jumlah Tenaga Kerja Harian
                </td>

                {summary.dates.map((d) => {
                  const dayTotal = summary.dailyTotals[d] || 0;
                  const isPeak = dayTotal === summary.peakManpower && summary.peakManpower > 0;
                  return (
                    <td
                      key={d}
                      className={`py-3 px-2 text-center font-mono text-xs border-r border-slate-200 ${
                        isPeak ? 'bg-orange-200/60 text-[#142B4A] font-extrabold' : 'text-slate-900'
                      }`}
                    >
                      {dayTotal}
                    </td>
                  );
                })}

                <td className="py-3 px-3 text-center font-mono text-sm font-extrabold text-[#F28C28] bg-orange-100/80 border-r border-slate-300">
                  {summary.grandTotalManDays}
                </td>

                <td className="py-3 px-3 text-center font-mono text-xs font-extrabold text-[#142B4A] bg-slate-200/80">
                  {formatDecimalIndo(summary.grandAveragePerDay)}
                </td>
              </tr>
            </tfoot>
          </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: RESPONSIVE ROLE CARDS (Optimized for Small Mobile Screens) */
        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.rows.map((row, idx) => (
            <div
              key={row.roleId}
              className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{row.roleName}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#F28C28] font-mono">
                    {row.totalManDays} OH
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    (Rata-rata: {formatDecimalIndo(row.averagePerDay)})
                  </span>
                </div>
              </div>

              {/* Day pill counts */}
              <div className="mt-3 grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
                {summary.dates.map((d) => {
                  const count = row.countsByDate[d] || 0;
                  return (
                    <div
                      key={d}
                      className={`p-1.5 rounded-md border text-[11px] ${
                        count > 0
                          ? 'bg-orange-50/60 border-orange-200 text-slate-900 font-bold'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="text-[9px] text-slate-500 font-medium">
                        {getDayNameIndo(d).slice(0, 3)}
                      </div>
                      <div className="font-mono">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Mobile Grand Total Summary Card */}
          <div className="md:col-span-2 p-4 rounded-xl bg-[#142B4A] text-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase font-bold text-orange-300 tracking-wider">
                Total Keseluruhan Periode
              </div>
              <div className="text-sm text-slate-200">
                {summary.calendarDaysCount} Hari Kalender ({formatDateIndo(startDateStr)} s/d {formatDateIndo(endDateStr)})
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-xs text-slate-300 block">Total Orang-Hari</span>
                <span className="text-2xl font-extrabold text-[#F28C28]">{summary.grandTotalManDays} OH</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-300 block">Rata-rata / Hari</span>
                <span className="text-2xl font-extrabold text-white">{formatDecimalIndo(summary.grandAveragePerDay)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer explanatory note */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          * Perhitungan rata-rata: <span className="font-semibold text-slate-700">Total Orang-Hari ÷ {summary.calendarDaysCount} Hari Kalender</span>. Titik oranye pada sel menunjukkan adanya catatan lapangan khusus.
        </div>
        <div className="shrink-0 font-medium text-slate-600">
          SIM-TK204 Standard Construction Matrix
        </div>
      </div>
    </div>
  );
};
