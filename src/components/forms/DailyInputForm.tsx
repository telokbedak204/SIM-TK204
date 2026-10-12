import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Save,
  Copy,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  History,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Project, JobRole, DailyManpower, UserProfile } from '../../types';
import { formatDateIndo, getDayNameIndo, formatDateIndoFull } from '../../lib/calculations';
import { validateWorkerCount } from '../../lib/validation';

interface DailyInputFormProps {
  project: Project;
  jobRoles: JobRole[];
  existingRecords: DailyManpower[];
  selectedDate: string;
  currentUser: UserProfile;
  onDateChange: (date: string) => void;
  onSaveBatch: (
    workDate: string,
    entries: { job_role_id: string; worker_count: number; notes?: string }[]
  ) => Promise<boolean>;
  allAvailableDates: string[];
}

export const DailyInputForm: React.FC<DailyInputFormProps> = ({
  project,
  jobRoles,
  existingRecords,
  selectedDate,
  currentUser,
  onDateChange,
  onSaveBatch,
  allAvailableDates,
}) => {
  // Form State: roleId -> { count: number, notes: string }
  const [formValues, setFormValues] = useState<Record<string, { count: number; notes: string }>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showCopyDateModal, setShowCopyDateModal] = useState<boolean>(false);
  const [copyTargetDate, setCopyTargetDate] = useState<string>('');
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Active roles only
  const activeRoles = jobRoles.filter((r) => r.is_active).sort((a, b) => a.sort_order - b.sort_order);

  // Populate form values whenever selectedDate, existingRecords, or activeRoles change
  useEffect(() => {
    const recordsForDate = existingRecords.filter((r) => r.work_date === selectedDate);
    const newValues: Record<string, { count: number; notes: string }> = {};

    activeRoles.forEach((role) => {
      const rec = recordsForDate.find((r) => r.job_role_id === role.id);
      newValues[role.id] = {
        count: rec ? Number(rec.worker_count) || 0 : 0,
        notes: rec?.notes || '',
      };
    });

    setFormValues(newValues);
    setIsDirty(false);
    setFieldErrors({});
  }, [selectedDate, existingRecords, jobRoles]);

  // Handle count change with validation
  const handleCountChange = (roleId: string, val: number | string) => {
    const rawVal = typeof val === 'string' ? val.trim() : val;
    const num = rawVal === '' ? 0 : Number(rawVal);

    const validation = validateWorkerCount(num);
    if (!validation.isValid && rawVal !== '') {
      setFieldErrors((prev) => ({ ...prev, [roleId]: validation.error || 'Nilai tidak valid' }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[roleId];
        return next;
      });
    }

    setFormValues((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        count: Math.max(0, Math.min(9999, isNaN(num) ? 0 : Math.floor(num))),
      },
    }));
    setIsDirty(true);
  };

  const handleStepCount = (roleId: string, delta: number) => {
    const current = formValues[roleId]?.count || 0;
    const nextVal = Math.max(0, Math.min(9999, current + delta));
    handleCountChange(roleId, nextVal);
  };

  const handleNotesChange = (roleId: string, notes: string) => {
    setFormValues((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        notes,
      },
    }));
    setIsDirty(true);
  };

  // 0. Load official Anambas Oct 11 report template
  const handleLoadAnambasOct11Template = () => {
    onDateChange('2026-10-11');
    const newValues: Record<string, { count: number; notes: string }> = {};
    activeRoles.forEach((role) => {
      let count = 0;
      let notes = '';
      const nameLower = role.name.toLowerCase();
      if (nameLower.includes('project manager') || nameLower === 'pm') {
        count = 1;
        notes = 'Rencana M6: 1,755% | Realisasi M6: 3,483% | Deviasi: +1,728%';
      } else if (nameLower.includes('surveyor')) {
        count = 1;
        notes = 'Surveyor = 1 orang';
      } else if (nameLower.includes('hse')) {
        count = 1;
        notes = 'HSE = 1 orang | Cuaca: Jam 08:00 - 17.00 Cerah | Kendala: Material utama belum ada | Saran: Di tambah dudukan alas pijakan, agar pekerja lebih aman; Lakukan mapping pekerjaan';
      } else if (nameLower.includes('mandor')) {
        count = 0;
        notes = 'Mandor = 0 orang';
      } else if (nameLower.includes('pekerja')) {
        count = 0;
        notes = 'Pekerja = 0 orang';
      }
      newValues[role.id] = { count, notes };
    });
    setFormValues(newValues);
    setIsDirty(true);
  };

  // 1. Copy data from previous calendar day
  const handleCopyYesterday = () => {
    const curDate = new Date(selectedDate + 'T00:00:00');
    curDate.setDate(curDate.getDate() - 1);
    const yStr = curDate.toISOString().slice(0, 10);

    const yesterdayRecords = existingRecords.filter((r) => r.work_date === yStr);
    if (yesterdayRecords.length === 0) {
      alert(`Tidak ditemukan data tenaga kerja untuk hari kemarin (${formatDateIndo(yStr)}).`);
      return;
    }

    const copiedValues: Record<string, { count: number; notes: string }> = {};
    activeRoles.forEach((role) => {
      const rec = yesterdayRecords.find((r) => r.job_role_id === role.id);
      copiedValues[role.id] = {
        count: rec ? Number(rec.worker_count) || 0 : 0,
        notes: rec?.notes || '',
      };
    });

    setFormValues(copiedValues);
    setIsDirty(true);
  };

  // 2. Copy data from specific date
  const handleCopyFromSpecificDate = () => {
    if (!copyTargetDate) return;
    const targetRecords = existingRecords.filter((r) => r.work_date === copyTargetDate);
    if (targetRecords.length === 0) {
      alert(`Tidak ada catatan pada tanggal ${formatDateIndo(copyTargetDate)}.`);
      return;
    }

    const copiedValues: Record<string, { count: number; notes: string }> = {};
    activeRoles.forEach((role) => {
      const rec = targetRecords.find((r) => r.job_role_id === role.id);
      copiedValues[role.id] = {
        count: rec ? Number(rec.worker_count) || 0 : 0,
        notes: rec?.notes || '',
      };
    });

    setFormValues(copiedValues);
    setIsDirty(true);
    setShowCopyDateModal(false);
  };

  // 3. Clear form (reset all to 0)
  const handleConfirmClear = () => {
    const zeroValues: Record<string, { count: number; notes: string }> = {};
    activeRoles.forEach((role) => {
      zeroValues[role.id] = { count: 0, notes: '' };
    });
    setFormValues(zeroValues);
    setIsDirty(true);
    setShowClearConfirmModal(false);
  };

  // Calculate live total for the day in the form
  const currentDayTotal = Object.values(formValues).reduce((acc, curr) => acc + (curr.count || 0), 0);

  // Submit batch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'viewer') {
      alert('Akses Ditolak: Peran akun Anda adalah "Viewer" (Hanya Melihat). Anda tidak memiliki izin untuk menyimpan data.');
      return;
    }

    // Check for errors
    if (Object.keys(fieldErrors).length > 0) {
      alert('Silakan perbaiki kesalahan input sebelum menyimpan.');
      return;
    }

    setIsSaving(true);
    const payload = activeRoles.map((role) => ({
      job_role_id: role.id,
      worker_count: formValues[role.id]?.count || 0,
      notes: formValues[role.id]?.notes || '',
    }));

    const ok = await onSaveBatch(selectedDate, payload);
    setIsSaving(false);
    if (ok) {
      setIsDirty(false);
    }
  };

  const isRecordedAlready = existingRecords.some((r) => r.work_date === selectedDate);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F28C28]"></span>
              <h2 className="text-lg font-bold text-[#142B4A]">
                Pencatatan Tenaga Kerja Harian
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Input jumlah orang per jabatan untuk proyek{' '}
              <span className="font-semibold text-slate-700">{project.name}</span>
            </p>
          </div>

          {/* Date Picker & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs">
              <Calendar className="w-4 h-4 text-[#F28C28]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                isRecordedAlready
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isRecordedAlready ? 'Sudah Tercatat' : 'Belum Ada Data'}
            </span>
          </div>
        </div>

        {/* Quick Toolbar: Copy yesterday, copy specific date, clear */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadAnambasOct11Template}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-[#F28C28] text-xs font-bold transition-colors min-h-[44px] shadow-2xs"
              title="Muat laporan harian resmi Pasar Loka (11 Okt 2026)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>📋 Muat Laporan Harian (11 Okt 2026)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyYesterday}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors min-h-[44px]"
              title="Salin catatan dari tanggal kemarin"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Salin Hari Kemarin</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCopyDateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors min-h-[44px]"
              title="Salin catatan dari tanggal tertentu"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Salin Tanggal Tertentu...</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors min-h-[44px]"
              title="Kosongkan seluruh angka menjadi 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Kosongkan Nilai</span>
            </button>
          </div>

          {/* Unsaved indicator */}
          <div className="flex items-center gap-2 text-xs">
            {isDirty ? (
              <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Ada perubahan belum disimpan
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tersimpan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Batch Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Form table header */}
        <div className="bg-[#142B4A] text-white px-4 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span className="w-8 text-center">No</span>
            <span>Jabatan / Keahlian</span>
          </div>
          <div className="flex items-center gap-8 pr-2">
            <span className="w-36 text-center">Jumlah Personel</span>
            <span className="hidden sm:inline-block w-48">Keterangan / Catatan</span>
          </div>
        </div>

        {/* Form rows */}
        <div className="divide-y divide-slate-100">
          {activeRoles.map((role, idx) => {
            const currentVal = formValues[role.id]?.count ?? 0;
            const currentNote = formValues[role.id]?.notes ?? '';
            const error = fieldErrors[role.id];

            return (
              <div
                key={role.id}
                className={`p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                } hover:bg-orange-50/30`}
              >
                {/* Left: Number and Role name */}
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-xs font-bold text-slate-400">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">{role.name}</span>
                    <span className="text-[10px] text-slate-400 block sm:hidden">
                      ID: {role.id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Right: Stepper Input and Notes */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                  {/* Stepper with comfortable touch buttons (min 44x44px) */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                    <span className="sm:hidden text-xs font-semibold text-slate-500">Jumlah Orang:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStepCount(role.id, -1)}
                        disabled={currentVal <= 0}
                        className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-lg disabled:opacity-30 transition-colors shadow-2xs"
                        aria-label={`Kurangi 1 ${role.name}`}
                      >
                        <Minus className="w-5 h-5" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        max="9999"
                        step="1"
                        inputMode="numeric"
                        value={currentVal === 0 && !isDirty && !isRecordedAlready ? '' : currentVal}
                        placeholder="0"
                        onChange={(e) => handleCountChange(role.id, e.target.value)}
                        className={`w-20 sm:w-24 h-11 sm:h-10 text-center font-mono font-bold text-lg rounded-lg border focus:ring-2 focus:outline-hidden transition-all ${
                          error
                            ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-rose-200'
                            : 'border-slate-300 bg-white text-slate-900 focus:ring-orange-200 focus:border-[#F28C28]'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => handleStepCount(role.id, 1)}
                        className="w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors shadow-2xs"
                        aria-label={`Tambah 1 ${role.name}`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Notes input */}
                  <div className="w-full sm:w-56">
                    <input
                      type="text"
                      value={currentNote}
                      placeholder="Catatan penugasan lapangan..."
                      onChange={(e) => handleNotesChange(role.id, e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-hidden focus:border-[#F28C28] transition-colors min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Error message if any */}
                {error && (
                  <div className="text-[11px] text-rose-600 font-medium pl-11">{error}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Bar: Total and Save Buttons */}
        <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Total Tenaga Kerja Tanggal Ini:
            </span>
            <span className="text-2xl font-extrabold text-[#142B4A] font-mono">
              {currentDayTotal}{' '}
              <span className="text-xs font-medium text-slate-500">Orang</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {currentUser.role === 'viewer' ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <ShieldAlert className="w-4 h-4" />
                <span>Mode Hanya Lihat (Viewer tidak dapat menyimpan)</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    // Reset to last saved
                    const recordsForDate = existingRecords.filter((r) => r.work_date === selectedDate);
                    const newValues: Record<string, { count: number; notes: string }> = {};
                    activeRoles.forEach((role) => {
                      const rec = recordsForDate.find((r) => r.job_role_id === role.id);
                      newValues[role.id] = {
                        count: rec ? Number(rec.worker_count) || 0 : 0,
                        notes: rec?.notes || '',
                      };
                    });
                    setFormValues(newValues);
                    setIsDirty(false);
                  }}
                  disabled={!isDirty}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  Batalkan
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 min-h-[44px]"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : isRecordedAlready ? 'Simpan Perubahan' : 'Simpan Data Harian'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* MODAL 1: Copy from Specific Date */}
      {showCopyDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-[#F28C28]" />
              Salin Data Dari Tanggal Lain
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pilih tanggal sumber untuk menyalin seluruh jumlah tenaga kerja dan catatan ke tanggal{' '}
              <span className="font-semibold text-slate-700">{formatDateIndo(selectedDate)}</span>.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Tanggal Sumber:
              </label>
              <input
                type="date"
                value={copyTargetDate}
                onChange={(e) => setCopyTargetDate(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCopyDateModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCopyFromSpecificDate}
                disabled={!copyTargetDate}
                className="px-4 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#1c3a63] text-white text-xs font-bold disabled:opacity-50"
              >
                Terapkan Salinan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Clear Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              Kosongkan Formulir?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Tindakan ini akan mereset seluruh angka tenaga kerja pada formulir tanggal{' '}
              <span className="font-bold">{formatDateIndo(selectedDate)}</span> menjadi nol (0).
              Data di database baru akan diperbarui setelah Anda menekan tombol "Simpan".
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
