import React from 'react';
import {
  Users,
  TrendingUp,
  Clock,
  CalendarCheck2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { MatrixSummary } from '../../types';
import { formatDateIndo, formatDecimalIndo } from '../../lib/calculations';

interface StatCardsProps {
  summary: MatrixSummary;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  summary,
  selectedDate,
  onSelectDate,
}) => {
  const currentDayCount = summary.dailyTotals[selectedDate] ?? 0;
  const isSelectedRecorded = summary.dailyRecordedFlags[selectedDate] ?? false;

  return (
    <div className="space-y-4">
      {/* 4 Cards Grid - Fully responsive (1 col on mobile, 2 col on tablet, 4 col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Selected Day Manpower */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tenaga Kerja Tanggal Ini
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#142B4A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#142B4A]">
              {currentDayCount}
            </span>
            <span className="text-xs font-medium text-slate-500">Orang</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-600 truncate font-medium">
              {formatDateIndo(selectedDate, true)}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isSelectedRecorded
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isSelectedRecorded ? 'Tercatat' : 'Belum Dicatat'}
            </span>
          </div>
        </div>

        {/* Card 2: Peak Manpower */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Puncak Tenaga Kerja
            </span>
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#F28C28] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F28C28]">
              {summary.peakManpower}
            </span>
            <span className="text-xs font-medium text-slate-500">Orang Tertinggi</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-600 flex items-center gap-1.5 truncate">
            <Award className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
            <span className="truncate">
              {summary.peakDates.length > 0
                ? summary.peakDates.map((d) => formatDateIndo(d)).join(', ')
                : 'Belum ada data'}
            </span>
          </div>
        </div>

        {/* Card 3: Total Man-Days */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Orang-Hari
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {summary.grandTotalManDays}
            </span>
            <span className="text-xs font-medium text-slate-500">Orang-Hari (OH)</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500">
            Kumulatif selama {summary.calendarDaysCount} hari kalender periode
          </div>
        </div>

        {/* Card 4: Daily Average */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rata-rata Harian
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#142B4A]">
              {formatDecimalIndo(summary.grandAveragePerDay)}
            </span>
            <span className="text-xs font-medium text-slate-500">Orang / Hari</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-500">
            {summary.grandTotalManDays} OH ÷ {summary.calendarDaysCount} hari kalender
          </div>
        </div>
      </div>

      {/* Warning Banner if there are dates missing records in the selected period */}
      {summary.missingDates.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-950">
                Perhatian: Terdapat {summary.missingDates.length} hari dalam periode yang belum memiliki catatan tenaga kerja
              </div>
              <p className="text-amber-800 text-xs mt-0.5">
                Hari tanpa catatan dihitung bernilai nol (0) dalam rata-rata kalender. Tanggal yang belum diisi:{' '}
                <span className="font-semibold">
                  {summary.missingDates.map((d) => formatDateIndo(d)).join(', ')}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectDate(summary.missingDates[0])}
            className="w-full sm:w-auto shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors min-h-[40px] flex items-center justify-center"
          >
            Isi Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
