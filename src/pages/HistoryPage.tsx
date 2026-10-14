import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
  Building2,
  TrendingUp,
  Users,
  Check,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { Project, DailyManpower, JobRole } from '../types';
import { formatDateIndo, computeWeeklyMatrix, getDayNameIndo } from '../lib/calculations';
import { exportWeeklyMonitoringToExcel } from '../lib/excelExport';
import { exportWeeklyMonitoringToPDF } from '../lib/pdfExport';

export interface AutoWeekItem {
  id: string;
  weekNumber: number;
  name: string;
  start: string;
  end: string;
  isCurrentWeek: boolean;
  hasData: boolean;
  recordedDays: number;
}

interface WeekOverride {
  name?: string;
  start?: string;
  end?: string;
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

interface HistoryPageProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (id: string) => void;
  onOpenReport: (start: string, end: string) => void;
  allDailyRecords: DailyManpower[];
  allRoles: JobRole[];
  addToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenReport,
  allDailyRecords,
  allRoles,
  addToast,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProject.id);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'current' | 'with_data' | 'empty'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state: View, Edit, Delete
  const [previewWeek, setPreviewWeek] = useState<AutoWeekItem | null>(null);
  const [editWeek, setEditWeek] = useState<AutoWeekItem | null>(null);
  const [deleteWeek, setDeleteWeek] = useState<AutoWeekItem | null>(null);

  // Edit form state
  const [editName, setEditName] = useState<string>('');
  const [editStart, setEditStart] = useState<string>('');
  const [editEnd, setEditEnd] = useState<string>('');

  // Overrides & Deleted weeks persistence in localStorage
  const currentProject = projects.find((p) => p.id === selectedProjectId) || activeProject;
  const projectRecords = allDailyRecords.filter((r) => r.project_id === currentProject.id);

  const STORAGE_KEY_OVERRIDES = `sim_tk204_week_overrides_${currentProject.id}`;
  const STORAGE_KEY_DELETED = `sim_tk204_deleted_weeks_${currentProject.id}`;

  const [overrides, setOverrides] = useState<Record<string, WeekOverride>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [deletedWeekIds, setDeletedWeekIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DELETED);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Re-read storage when project changes
  useEffect(() => {
    try {
      const storedO = localStorage.getItem(`sim_tk204_week_overrides_${currentProject.id}`);
      setOverrides(storedO ? JSON.parse(storedO) : {});
      const storedD = localStorage.getItem(`sim_tk204_deleted_weeks_${currentProject.id}`);
      setDeletedWeekIds(storedD ? JSON.parse(storedD) : []);
    } catch {
      setOverrides({});
      setDeletedWeekIds([]);
    }
  }, [currentProject.id]);

  // Unique recorded dates in project
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(projectRecords.map((r) => r.work_date))).sort();
  }, [projectRecords]);

  // Automatic Weekly Cycle Generation based on project contract start date (7-day cycles)
  const allAutoWeeks = useMemo<AutoWeekItem[]>(() => {
    const startContract = currentProject.start_date || (uniqueDates.length > 0 ? uniqueDates[0] : '2026-08-28');
    const today = new Date().toISOString().split('T')[0];

    // Cover up to today or latest recorded date, whichever is later
    let maxDate = today;
    if (uniqueDates.length > 0) {
      const lastRecorded = uniqueDates[uniqueDates.length - 1];
      if (lastRecorded > maxDate) {
        maxDate = lastRecorded;
      }
    }

    const items: AutoWeekItem[] = [];
    let currentStart = startContract;
    let weekNumber = 1;

    while (currentStart <= maxDate || weekNumber === 1) {
      const currentEnd = addDays(currentStart, 6);
      const isCurrent = today >= currentStart && today <= currentEnd;
      const weekId = `auto-week-${currentProject.id}-${weekNumber}`;

      // Check if user has edited/overridden this week
      const custom = overrides[weekId];
      const effectiveStart = custom?.start || currentStart;
      const effectiveEnd = custom?.end || currentEnd;
      const effectiveName = custom?.name || `Monitoring Minggu Ke ${weekNumber}`;

      // Count distinct recorded days in this week
      const daysWithData = new Set(
        projectRecords
          .filter((r) => r.work_date >= effectiveStart && r.work_date <= effectiveEnd)
          .map((r) => r.work_date)
      );

      items.push({
        id: weekId,
        weekNumber,
        name: effectiveName,
        start: effectiveStart,
        end: effectiveEnd,
        isCurrentWeek: isCurrent,
        hasData: daysWithData.size > 0,
        recordedDays: daysWithData.size,
      });

      currentStart = addDays(currentEnd, 1);
      weekNumber++;

      if (weekNumber > 300) break; // safety guard
    }

    return items;
  }, [currentProject.start_date, currentProject.id, uniqueDates, projectRecords, overrides]);

  // Filter & Search weeks (excluding deleted ones)
  const filteredWeeks = useMemo(() => {
    let result = allAutoWeeks.filter((w) => !deletedWeekIds.includes(w.id));

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.weekNumber.toString().includes(q) ||
          w.start.includes(q) ||
          w.end.includes(q) ||
          formatDateIndo(w.start).toLowerCase().includes(q) ||
          formatDateIndo(w.end).toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filterStatus === 'current') {
      result = result.filter((w) => w.isCurrentWeek);
    } else if (filterStatus === 'with_data') {
      result = result.filter((w) => w.hasData);
    } else if (filterStatus === 'empty') {
      result = result.filter((w) => !w.hasData);
    }

    // Sorting
    return sortOrder === 'desc' ? [...result].reverse() : result;
  }, [allAutoWeeks, deletedWeekIds, searchQuery, filterStatus, sortOrder]);

  // Cumulative project summary (contract start to today)
  const fullProjectSummary = useMemo(() => {
    const start = currentProject.start_date || '2026-08-28';
    const today = new Date().toISOString().split('T')[0];
    const end = uniqueDates.length > 0 && uniqueDates[uniqueDates.length - 1] > today ? uniqueDates[uniqueDates.length - 1] : today;
    return {
      start,
      end,
      matrix: computeWeeklyMatrix(start, end, allRoles, projectRecords),
    };
  }, [currentProject.start_date, uniqueDates, allRoles, projectRecords]);

  // Handle Edit Action
  const handleOpenEdit = (week: AutoWeekItem) => {
    setEditWeek(week);
    setEditName(week.name);
    setEditStart(week.start);
    setEditEnd(week.end);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWeek) return;

    if (!editName.trim()) {
      if (addToast) addToast('warning', 'Nama paket laporan wajib diisi.');
      return;
    }
    if (editStart > editEnd) {
      if (addToast) addToast('warning', 'Tanggal akhir tidak boleh mendahului tanggal mulai.');
      return;
    }

    const updatedOverrides = {
      ...overrides,
      [editWeek.id]: {
        name: editName.trim(),
        start: editStart,
        end: editEnd,
      },
    };

    setOverrides(updatedOverrides);
    try {
      localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(updatedOverrides));
    } catch (err) {
      console.warn('Failed to save week overrides to localStorage:', err);
    }

    setEditWeek(null);
    if (addToast) addToast('success', `Paket laporan "${editName.trim()}" berhasil diperbarui!`, 'Perubahan Disimpan');
  };

  // Handle Delete Action
  const handleConfirmDelete = () => {
    if (!deleteWeek) return;

    const updatedDeleted = Array.from(new Set([...deletedWeekIds, deleteWeek.id]));
    setDeletedWeekIds(updatedDeleted);
    try {
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(updatedDeleted));
    } catch (err) {
      console.warn('Failed to save deleted weeks to localStorage:', err);
    }

    if (addToast) addToast('info', `Paket laporan "${deleteWeek.name}" berhasil dihapus.`);
    setDeleteWeek(null);
  };

  // Restore all deleted weeks
  const handleRestoreDeleted = () => {
    setDeletedWeekIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY_DELETED);
    } catch (err) {
      console.warn('Failed to clear deleted weeks:', err);
    }
    if (addToast) addToast('success', 'Semua paket laporan yang dihapus telah dipulihkan.', 'Dipulihkan');
  };

  const handleExportExcel = (start: string, end: string, label?: string) => {
    try {
      const summary = computeWeeklyMatrix(start, end, allRoles, projectRecords);
      const fileName = exportWeeklyMonitoringToExcel(currentProject, summary, start, end);
      if (addToast) addToast('success', `Laporan Excel ${label ? `(${label}) ` : ''}berhasil diunduh (${fileName})`, 'Unduh Excel');
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal mengunduh Excel: ' + (err.message || 'Error'));
    }
  };

  const handleExportPDF = (start: string, end: string, label?: string) => {
    try {
      const summary = computeWeeklyMatrix(start, end, allRoles, projectRecords);
      const fileName = exportWeeklyMonitoringToPDF(currentProject, summary, start, end);
      if (addToast) addToast('success', `Laporan PDF resmi ${label ? `(${label}) ` : ''}berhasil dibuat (${fileName})`, 'Unduh PDF');
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal mengunduh PDF: ' + (err.message || 'Error'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#142B4A]"></span>
            <h2 className="text-lg font-bold text-[#142B4A]">
              Riwayat & Arsip Laporan Proyek
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pengelompokan mingguan (siklus 7 hari) dibuat secara otomatis dari tanggal mulai kontrak ({formatDateIndo(currentProject.start_date || '2026-08-28')}) hingga minggu berjalan. Anda dapat melihat, mengedit nama/periode, atau menghapus paket laporan sesuai kebutuhan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <Building2 className="w-4 h-4 text-[#142B4A]" />
            <span className="text-xs font-semibold text-slate-600">Proyek:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                onSelectProject(e.target.value);
              }}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          {/* Automatic Badge */}
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Otomatis Perminggu Aktif</span>
          </div>
        </div>
      </div>

      {/* Filter, Search & Sorting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs shadow-2xs">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Minggu ({allAutoWeeks.filter((w) => !deletedWeekIds.includes(w.id)).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('current')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === 'current'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Minggu Berjalan</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('with_data')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'with_data'
                ? 'bg-[#F28C28] text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Ada Data ({allAutoWeeks.filter((w) => w.hasData && !deletedWeekIds.includes(w.id)).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('empty')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'empty'
                ? 'bg-slate-700 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Ada Data ({allAutoWeeks.filter((w) => !w.hasData && !deletedWeekIds.includes(w.id)).length})
          </button>
        </div>

        {/* Search, Sort & Restore Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {deletedWeekIds.length > 0 && (
            <button
              type="button"
              onClick={handleRestoreDeleted}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              title="Pulihkan semua paket laporan yang dihapus"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Pulihkan Terhapus ({deletedWeekIds.length})</span>
            </button>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari minggu (mis: 4, 1) / tgl..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#142B4A]"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0 shadow-2xs"
            title="Ubah urutan pengelompokan minggu"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Terbaru di Atas' : 'Minggu 1 di Atas'}</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Paket Laporan Mingguan */}
      {filteredWeeks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada paket laporan yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {deletedWeekIds.length > 0
              ? 'Beberapa paket laporan mungkin telah dihapus. Klik tombol Pulihkan Terhapus di atas untuk mengembalikannya.'
              : 'Coba bersihkan pencarian atau ubah filter status di atas.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {deletedWeekIds.length > 0 && (
              <button
                type="button"
                onClick={handleRestoreDeleted}
                className="px-4 py-2 bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Pulihkan Paket Terhapus
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#142B4A] hover:bg-[#1e3a60] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tampilkan Semua
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWeeks.map((week) => {
            const summary = computeWeeklyMatrix(week.start, week.end, allRoles, projectRecords);

            return (
              <div
                key={week.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all group ${
                  week.isCurrentWeek
                    ? 'border-amber-400 ring-2 ring-amber-100/80 bg-gradient-to-br from-amber-50/20 to-white'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <div>
                  {/* Card Header Badge & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-[#142B4A] border border-blue-200">
                        PAKET LAPORAN #{week.weekNumber}
                      </span>
                      {week.isCurrentWeek && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span>Minggu Berjalan</span>
                        </span>
                      )}
                      {week.hasData ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {week.recordedDays}/7 Hari Terisi
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-100">
                          Belum Ada Data
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      7 Hari Kalender
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-3">
                    {week.name}
                  </h3>

                  {/* Key Stats Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 mb-4 text-slate-700 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Rentang Tanggal:</span>
                      <span className="font-semibold text-slate-900">
                        {formatDateIndo(week.start)} s/d {formatDateIndo(week.end)}
                      </span>
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

                {/* Action Buttons: View, Edit, Hapus, Excel, PDF (Identik persis dengan screenshot) */}
                <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Tombol View */}
                    <button
                      type="button"
                      onClick={() => setPreviewWeek(week)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#142B4A] hover:bg-[#1e3a60] text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
                      title="Lihat Pratinjau Lengkap Laporan"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>View</span>
                    </button>

                    {/* Tombol Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(week)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
                      title="Edit Nama atau Rentang Tanggal Paket Laporan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Tombol Hapus */}
                    <button
                      type="button"
                      onClick={() => setDeleteWeek(week)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
                      title="Hapus Paket Laporan Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>

                  {/* Group Export: Excel & PDF */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportExcel(week.start, week.end, week.name)}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors min-h-[38px] cursor-pointer"
                      title="Unduh Rekap Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportPDF(week.start, week.end, week.name)}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors min-h-[38px] cursor-pointer"
                      title="Unduh Dokumen PDF Resmi"
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
      )}

      {/* Modal View / Pratinjau Paket Laporan */}
      {previewWeek && (() => {
        const viewSummary = computeWeeklyMatrix(previewWeek.start, previewWeek.end, allRoles, projectRecords);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Pratinjau Paket Laporan</h3>
                    <p className="text-xs text-slate-300">
                      {previewWeek.name} ({formatDateIndo(previewWeek.start)} s/d {formatDateIndo(previewWeek.end)})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewWeek(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                >
                  ✕ Tutup
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Kalender</span>
                    <span className="text-sm font-bold text-slate-900">{viewSummary.calendarDaysCount} Hari</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Orang-Hari</span>
                    <span className="text-sm font-bold text-[#F28C28]">{viewSummary.grandTotalManDays} OH</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Rata-rata/Hari</span>
                    <span className="text-sm font-bold text-[#142B4A]">{viewSummary.grandAveragePerDay} Org</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Puncak Hadir</span>
                    <span className="text-sm font-bold text-emerald-700">{viewSummary.peakManpower} Orang</span>
                  </div>
                </div>

                {/* Detail Box */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Rentang Periode:</span>
                    <span className="font-bold text-slate-800">
                      {formatDateIndo(previewWeek.start)} s/d {formatDateIndo(previewWeek.end)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Nama Proyek:</span>
                    <span className="font-bold text-slate-800">{currentProject.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Konsultan Pengawas MK:</span>
                    <span className="font-semibold text-slate-700">{currentProject.consultant_name || '-'}</span>
                  </div>
                </div>

                {/* Preview Breakdown Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Rekap Kehadiran Jabatan / Tenaga Kerja</span>
                    <span className="text-[10px] text-slate-500 font-normal">Minggu Ke-{previewWeek.weekNumber}</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {viewSummary.rows.map((row) => (
                      <div key={row.roleId} className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50">
                        <span className="font-medium text-slate-800">{row.roleName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[11px]">{row.averagePerDay} org/hari</span>
                          <span className="font-bold text-[#F28C28]">{row.totalManDays} OH</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const start = previewWeek.start;
                    const end = previewWeek.end;
                    setPreviewWeek(null);
                    onOpenReport(start, end);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142B4A] hover:bg-[#1e3a60] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  <span>Buka di Halaman Monitoring (Penuh)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportExcel(previewWeek.start, previewWeek.end, previewWeek.name)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPDF(previewWeek.start, previewWeek.end, previewWeek.name)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewWeek(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Edit Paket Laporan */}
      {editWeek && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 space-y-0">
            <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Edit Paket Laporan</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditWeek(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama / Judul Paket Laporan
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#F28C28]"
                  placeholder="Contoh: Monitoring Minggu Ke 4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#F28C28]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#F28C28]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditWeek(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Paket Laporan */}
      {deleteWeek && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus Paket Laporan?</h3>
                <p className="text-xs text-slate-500 font-semibold line-clamp-1">
                  {deleteWeek.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus kartu paket laporan periode <strong>{formatDateIndo(deleteWeek.start)} s/d {formatDateIndo(deleteWeek.end)}</strong>? Seluruh data catatan kehadiran harian Anda tetap tersimpan aman.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteWeek(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Ya, Hapus Paket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
