import React, { useState, useEffect } from 'react';
import {
  Archive,
  Search,
  Calendar,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Plus,
  X,
  Check,
  AlertTriangle,
  Download,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Project, DailyManpower, JobRole, ReportPackage } from '../types';
import { formatDateIndo, computeWeeklyMatrix, getDayNameIndo } from '../lib/calculations';
import { exportWeeklyMonitoringToExcel } from '../lib/excelExport';
import { exportWeeklyMonitoringToPDF } from '../lib/pdfExport';
import { DataService } from '../services/dataService';

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
  const [packages, setPackages] = useState<ReportPackage[]>([]);

  // Modals state
  const [viewPackage, setViewPackage] = useState<ReportPackage | null>(null);
  const [editPackage, setEditPackage] = useState<ReportPackage | null>(null);
  const [deletePackage, setDeletePackage] = useState<ReportPackage | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Edit form state
  const [editName, setEditName] = useState<string>('');
  const [editStart, setEditStart] = useState<string>('');
  const [editEnd, setEditEnd] = useState<string>('');

  // Add form state
  const [newName, setNewName] = useState<string>('');
  const [newStart, setNewStart] = useState<string>('2026-10-02');
  const [newEnd, setNewEnd] = useState<string>('2026-10-08');

  const currentProject = projects.find((p) => p.id === selectedProjectId) || activeProject;
  const projectRecords = allDailyRecords.filter((r) => r.project_id === currentProject.id);

  // Unique recorded dates
  const uniqueDates = Array.from(new Set(projectRecords.map((r) => r.work_date))).sort();

  // Load and sync packages from DataService
  const loadPackages = () => {
    let list = DataService.getReportPackages(currentProject.id);

    // If list is empty and user hasn't explicitly cleared, seed initial default package
    const isCleared = typeof window !== 'undefined' && localStorage.getItem(`cleared_packages_${currentProject.id}`);
    if (list.length === 0 && !isCleared) {
      const demoPkg: ReportPackage = {
        id: `pkg-demo-${currentProject.id}`,
        project_id: currentProject.id,
        name: 'Monitoring Mingguan Periode Demo (2–8 Oktober 2026)',
        start: '2026-10-02',
        end: '2026-10-08',
        created_at: '2026-10-08T17:00:00.000Z',
      };
      DataService.saveReportPackage(demoPkg);
      list = [demoPkg];
    }

    // Auto-seed full records package if available and not deleted
    if (uniqueDates.length > 0) {
      const minDate = uniqueDates[0];
      const maxDate = uniqueDates[uniqueDates.length - 1];
      const hasFull = list.some((p) => p.start === minDate && p.end === maxDate);
      const isDeletedFull = typeof window !== 'undefined' && localStorage.getItem(`deleted_pkg_full_${currentProject.id}`);

      if (!hasFull && !isDeletedFull && (minDate !== '2026-10-02' || maxDate !== '2026-10-08')) {
        const fullPkg: ReportPackage = {
          id: `pkg-full-${currentProject.id}`,
          project_id: currentProject.id,
          name: `Seluruh Catatan Lapangan (${formatDateIndo(minDate)} s/d ${formatDateIndo(maxDate)})`,
          start: minDate,
          end: maxDate,
          created_at: new Date().toISOString(),
        };
        DataService.saveReportPackage(fullPkg);
        list = DataService.getReportPackages(currentProject.id);
      }
    }

    setPackages(list);
  };

  useEffect(() => {
    loadPackages();
  }, [currentProject.id, uniqueDates.length]);

  const handleExportExcel = (start: string, end: string) => {
    try {
      const summary = computeWeeklyMatrix(start, end, allRoles, projectRecords);
      const fileName = exportWeeklyMonitoringToExcel(currentProject, summary, start, end);
      if (addToast) addToast('success', `Laporan Excel berhasil diunduh (${fileName})`, 'Unduh Excel');
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal mengunduh Excel: ' + (err.message || 'Error'));
    }
  };

  const handleExportPDF = (start: string, end: string) => {
    try {
      const summary = computeWeeklyMatrix(start, end, allRoles, projectRecords);
      const fileName = exportWeeklyMonitoringToPDF(currentProject, summary, start, end);
      if (addToast) addToast('success', `Laporan PDF resmi berhasil dibuat (${fileName})`, 'Unduh PDF');
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal mengunduh PDF: ' + (err.message || 'Error'));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (pkg: ReportPackage) => {
    setEditPackage(pkg);
    setEditName(pkg.name);
    setEditStart(pkg.start);
    setEditEnd(pkg.end);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPackage) return;

    if (!editName.trim()) {
      if (addToast) addToast('warning', 'Nama paket laporan wajib diisi.');
      return;
    }
    if (editStart > editEnd) {
      if (addToast) addToast('warning', 'Tanggal akhir tidak boleh mendahului tanggal mulai.');
      return;
    }

    const updated: ReportPackage = {
      ...editPackage,
      name: editName.trim(),
      start: editStart,
      end: editEnd,
    };

    DataService.saveReportPackage(updated);
    loadPackages();
    setEditPackage(null);
    if (addToast) addToast('success', `Paket laporan "${updated.name}" berhasil diperbarui!`, 'Perubahan Disimpan');
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletePackage) return;

    if (deletePackage.id.startsWith('pkg-full-')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`deleted_pkg_full_${currentProject.id}`, 'true');
      }
    }

    DataService.deleteReportPackage(deletePackage.id);
    const updated = packages.filter((p) => p.id !== deletePackage.id);
    setPackages(updated);

    if (updated.length === 0 && typeof window !== 'undefined') {
      localStorage.setItem(`cleared_packages_${currentProject.id}`, 'true');
    }

    if (addToast) addToast('info', `Paket laporan "${deletePackage.name}" berhasil dihapus.`);
    setDeletePackage(null);
  };

  // Create New Package
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      if (addToast) addToast('warning', 'Nama paket laporan wajib diisi.');
      return;
    }
    if (newStart > newEnd) {
      if (addToast) addToast('warning', 'Tanggal akhir tidak boleh mendahului tanggal mulai.');
      return;
    }

    const newPkg: ReportPackage = {
      id: `pkg-${Date.now()}`,
      project_id: currentProject.id,
      name: setNewName.name ? newName.trim() : newName.trim(),
      start: newStart,
      end: newEnd,
      created_at: new Date().toISOString(),
    };

    DataService.saveReportPackage(newPkg);
    loadPackages();
    setShowAddModal(false);
    setNewName('');
    if (addToast) addToast('success', `Paket laporan "${newPkg.name}" berhasil dibuat!`, 'Paket Baru');
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
          <p className="text-xs text-slate-500 mt-1">
            Telusuri arsip berkas monitoring mingguan, rekap periode, dan cetak ulang laporan resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
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

          {/* Add Package Button */}
          <button
            type="button"
            onClick={() => {
              setNewName(`Monitoring Mingguan (${formatDateIndo(uniqueDates[0] || '2026-10-02')})`);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#142B4A] hover:bg-[#1e3a60] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ Buat Paket Laporan</span>
          </button>
        </div>
      </div>

      {/* Package List Grid */}
      {packages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F28C28] flex items-center justify-center mx-auto">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Paket Laporan Tersimpan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Belum ada paket laporan arsip untuk proyek ini. Klik tombol di bawah untuk membuat paket arsip monitoring baru.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            + Buat Paket Laporan Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg, idx) => {
            const summary = computeWeeklyMatrix(pkg.start, pkg.end, allRoles, projectRecords);

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all group"
              >
                <div>
                  {/* Card Header Badge & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-[#142B4A] border border-blue-200 flex items-center gap-1">
                      <span>PAKET LAPORAN</span>
                      <span className="text-slate-400 font-normal">#{idx + 1}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      {summary.calendarDaysCount} Hari Kalender
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-3 line-clamp-2">
                    {pkg.name}
                  </h3>

                  {/* Key Stats Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 mb-4 text-slate-700 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Rentang Tanggal:</span>
                      <span className="font-semibold text-slate-900">
                        {formatDateIndo(pkg.start)} s/d {formatDateIndo(pkg.end)}
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

                {/* Action Buttons: Tombol Edit, Hapus, dan View (serta Excel & PDF) */}
                <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Group Utama: Edit, Hapus, dan View */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Tombol View */}
                    <button
                      type="button"
                      onClick={() => setViewPackage(pkg)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#142B4A] hover:bg-[#1e3a60] text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
                      title="Lihat Pratinjau Lengkap Laporan"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>View</span>
                    </button>

                    {/* Tombol Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(pkg)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
                      title="Edit Nama atau Rentang Tanggal Paket Laporan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Tombol Hapus */}
                    <button
                      type="button"
                      onClick={() => setDeletePackage(pkg)}
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
                      onClick={() => handleExportExcel(pkg.start, pkg.end)}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors min-h-[38px] cursor-pointer"
                      title="Unduh Rekap Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportPDF(pkg.start, pkg.end)}
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
      {viewPackage && (() => {
        const viewSummary = computeWeeklyMatrix(viewPackage.start, viewPackage.end, allRoles, projectRecords);
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
                      {viewPackage.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewPackage(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
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
                      {formatDateIndo(viewPackage.start)} s/d {formatDateIndo(viewPackage.end)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Nama Proyek:</span>
                    <span className="font-bold text-slate-800">{currentProject.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Konsultan Pengawas:</span>
                    <span className="font-semibold text-slate-700">{currentProject.consultant_name || '-'}</span>
                  </div>
                </div>

                {/* Preview Breakdown Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Rekap Kehadiran Jabatan / Tenaga Kerja</span>
                    <span className="text-[10px] text-slate-500 font-normal">Periode Terpilih</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
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
                    setViewPackage(null);
                    onOpenReport(viewPackage.start, viewPackage.end);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142B4A] hover:bg-[#1e3a60] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  <span>Buka di Halaman Monitoring (Penuh)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportExcel(viewPackage.start, viewPackage.end)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPDF(viewPackage.start, viewPackage.end)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPackage(null)}
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
      {editPackage && (
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
                onClick={() => setEditPackage(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg text-xs font-bold"
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
                  placeholder="Contoh: Monitoring Mingguan Periode 1"
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
                  onClick={() => setEditPackage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Paket Laporan */}
      {deletePackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus Paket Laporan?</h3>
                <p className="text-xs text-slate-500 font-semibold line-clamp-1">
                  {deletePackage.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus kartu paket laporan periode <strong>{formatDateIndo(deletePackage.start)} s/d {formatDateIndo(deletePackage.end)}</strong>? Seluruh data catatan kehadiran harian Anda tetap tersimpan aman.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletePackage(null)}
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

      {/* Modal Buat Paket Laporan Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 space-y-0">
            <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Buat Paket Laporan Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-5 sm:p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama / Judul Paket Laporan
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#142B4A]"
                  placeholder="Contoh: Monitoring Periode Minggu ke-2"
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
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#142B4A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#142B4A]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#142B4A] hover:bg-[#1e3a60] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Buat Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
