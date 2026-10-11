import React from 'react';
import { Project, JobRole, DailyManpower, UserProfile } from '../types';
import { DailyInputForm } from '../components/forms/DailyInputForm';
import { formatDateIndo, getDayNameIndo } from '../lib/calculations';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface DailyInputPageProps {
  project: Project;
  jobRoles: JobRole[];
  dailyRecords: DailyManpower[];
  selectedDate: string;
  currentUser: UserProfile;
  onDateChange: (date: string) => void;
  onSaveBatch: (
    workDate: string,
    entries: { job_role_id: string; worker_count: number; notes?: string }[]
  ) => Promise<boolean>;
}

export const DailyInputPage: React.FC<DailyInputPageProps> = ({
  project,
  jobRoles,
  dailyRecords,
  selectedDate,
  currentUser,
  onDateChange,
  onSaveBatch,
}) => {
  // Aggregate unique recorded dates for history list
  const recordedDates = Array.from(new Set(dailyRecords.map((r) => r.work_date))).sort().reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
      {/* Main input form (3 columns on large screens) */}
      <div className="lg:col-span-3 min-w-0 w-full">
        <DailyInputForm
          project={project}
          jobRoles={jobRoles}
          existingRecords={dailyRecords}
          selectedDate={selectedDate}
          currentUser={currentUser}
          onDateChange={onDateChange}
          onSaveBatch={onSaveBatch}
          allAvailableDates={recordedDates}
        />
      </div>

      {/* Sidebar: Recent Recorded Dates (1 column) */}
      <div className="lg:col-span-1 space-y-4 min-w-0 w-full">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F28C28]" />
              <h3 className="font-bold text-slate-800 text-sm">Riwayat Tanggal</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {recordedDates.length} Hari
            </span>
          </div>

          <div className="mt-3 space-y-1.5 max-h-[500px] overflow-y-auto">
            {recordedDates.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada data tercatat untuk proyek ini.
              </p>
            ) : (
              recordedDates.map((dateStr) => {
                const isSelected = dateStr === selectedDate;
                const dateRecords = dailyRecords.filter((r) => r.work_date === dateStr);
                const daySum = dateRecords.reduce((acc, r) => acc + (Number(r.worker_count) || 0), 0);

                return (
                  <button
                    key={dateStr}
                    onClick={() => onDateChange(dateStr)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-50 border-[#F28C28] text-[#142B4A] font-bold shadow-2xs'
                        : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">
                        {formatDateIndo(dateStr)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {getDayNameIndo(dateStr)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#F28C28] font-mono">
                        {daySum}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">Org</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Helpful Tips Card */}
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-4 text-xs text-blue-900 space-y-2">
          <div className="font-bold text-blue-950 flex items-center gap-1.5">
            <span>Petunjuk Pengisian:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-blue-800 text-[11px]">
            <li>Masukkan jumlah personel nyata per jabatan yang hadir bekerja di lapangan.</li>
            <li>Gunakan tombol <strong>+</strong> dan <strong>-</strong> untuk penyesuaian cepat di ponsel.</li>
            <li>Gunakan fitur <strong>"Salin Hari Kemarin"</strong> jika komposisi pekerja serupa dengan hari sebelumnya.</li>
            <li>Klik tombol <strong>"Simpan Data Harian"</strong> setelah selesai.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
