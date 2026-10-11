import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { MatrixSummary } from '../../types';
import { formatDateIndo, getDayNameIndo } from '../../lib/calculations';

interface ManpowerChartsProps {
  summary: MatrixSummary;
}

const ROLE_COLORS = [
  '#142B4A', // Navy
  '#F28C28', // Orange
  '#2563EB', // Blue
  '#059669', // Emerald
  '#7C3AED', // Violet
  '#D97706', // Amber
  '#DC2626', // Red
  '#0D9488', // Teal
  '#4B5563', // Gray
];

export const ManpowerCharts: React.FC<ManpowerChartsProps> = ({ summary }) => {
  // 1. Data for Daily Trend Chart
  const trendData = summary.dates.map((dateStr) => {
    return {
      date: dateStr,
      label: formatDateIndo(dateStr),
      dayName: getDayNameIndo(dateStr),
      shortLabel: `${getDayNameIndo(dateStr).slice(0, 3)}, ${dateStr.slice(8)}`,
      total: summary.dailyTotals[dateStr] || 0,
      isRecorded: summary.dailyRecordedFlags[dateStr],
    };
  });

  // 2. Data for Composition by Job Role Chart
  const compositionData = summary.rows
    .map((r) => ({
      name: r.roleName,
      totalManDays: r.totalManDays,
      average: r.averagePerDay,
      proportion:
        summary.grandTotalManDays > 0
          ? Number(((r.totalManDays / summary.grandTotalManDays) * 100).toFixed(1))
          : 0,
    }))
    .filter((d) => d.totalManDays > 0)
    .sort((a, b) => b.totalManDays - a.totalManDays);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-w-0">
      {/* Chart 1: Daily Manpower Trend */}
      <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs w-full min-w-0 overflow-hidden">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
              Tren Fluktuasi Tenaga Kerja Harian
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Grafik kehadiran seluruh personel pada periode monitoring
            </p>
          </div>
          <span className="self-start xs:self-auto text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#142B4A] border border-blue-100">
            {summary.dates.length} Hari
          </span>
        </div>

        <div className="h-60 sm:h-72 w-full min-w-0">
          {summary.dates.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">
              Tidak ada data periode
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F28C28" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F28C28" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700">
                          <div className="font-semibold text-orange-300">
                            {data.dayName}, {data.label}
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-300">Jumlah Pekerja:</span>
                            <span className="font-bold text-white text-sm">
                              {data.total} orang
                            </span>
                          </div>
                          {!data.isRecorded && (
                            <div className="text-[10px] text-amber-400 mt-1">
                              * Belum ada catatan lapangan
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#F28C28"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  dot={{ r: 3.5, fill: '#142B4A', stroke: '#F28C28', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#F28C28', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Manpower Composition by Job Role */}
      <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs w-full min-w-0 overflow-hidden">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
              Komposisi Orang-Hari Berdasarkan Jabatan
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Alokasi total orang-hari per keahlian selama periode
            </p>
          </div>
          <span className="self-start xs:self-auto text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-[#F28C28] border border-orange-100">
            {compositionData.length} Jabatan Aktif
          </span>
        </div>

        <div className="h-60 sm:h-72 w-full min-w-0">
          {compositionData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">
              Belum ada data tenaga kerja tercatat
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compositionData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }}
                  width={90}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700">
                          <div className="font-semibold text-orange-300">{data.name}</div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="text-slate-300">Total Orang-Hari:</span>
                            <span className="font-bold text-white">{data.totalManDays} OH</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">Rata-rata:</span>
                            <span className="font-bold text-slate-200">{data.average} org/hari</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-300">Proporsi:</span>
                            <span className="font-bold text-emerald-400">{data.proportion}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalManDays" radius={[0, 4, 4, 0]}>
                  {compositionData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
