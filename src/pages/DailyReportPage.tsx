import React, { useState, useEffect } from 'react';
import { Project, JobRole, DailyManpower, DailyReportNarrative } from '../types';
import { DataService } from '../services/dataService';
import { formatDateIndo, getDayNameIndo, formatDateIndoFull } from '../lib/calculations';
import { FileText, Copy, Calendar, Sparkles, CheckCircle2, History, Save, FolderArchive, ArrowRight, Eye, Send } from 'lucide-react';

interface DailyReportPageProps {
  project: Project;
  jobRoles: JobRole[];
  dailyRecords: DailyManpower[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const DailyReportPage: React.FC<DailyReportPageProps> = ({
  project,
  jobRoles,
  dailyRecords,
  selectedDate,
  onDateChange,
  addToast,
}) => {
  // Report customizable fields
  const [rencanaM6, setRencanaM6] = useState<string>('1,755%');
  const [realisasiM6, setRealisasiM6] = useState<string>('3,483%');
  const [deviasiM6, setDeviasiM6] = useState<string>('1,728%');

  const [pekerjaanText, setPekerjaanText] = useState<string>('-');
  const [peralatanText, setPeralatanText] = useState<string>('');
  const [kendalaText, setKendalaText] = useState<string>('- material utama belum ada');
  const [cuacaText, setCuacaText] = useState<string>('- Jam 08:00 - 17.00 Cerah');
  const [materialMasukText, setMaterialMasukText] = useState<string>('- saat ini belum ada material masuk');
  const [saranText, setSaranText] = useState<string>('- Di tambah dudukan alas pijakan, agar pekerja lebih aman\n- lakukan mapping pekerjaan');

  const [copied, setCopied] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [allSavedReports, setAllSavedReports] = useState<DailyReportNarrative[]>([]);
  
  // State for viewing report shape modal when clicking "Buka & Edit"
  const [viewingReportModal, setViewingReportModal] = useState<DailyReportNarrative | null>(null);
  const [modalCopied, setModalCopied] = useState<boolean>(false);

  // Load saved narrative whenever project or selectedDate changes
  useEffect(() => {
    if (!project) return;
    const existing = DataService.getDailyReportNarrative(project.id, selectedDate);
    if (existing) {
      setRencanaM6(existing.rencana_m6 || '1,755%');
      setRealisasiM6(existing.realisasi_m6 || '3,483%');
      setDeviasiM6(existing.deviasi_m6 || '1,728%');
      setPekerjaanText(existing.pekerjaan || '-');
      setPeralatanText(existing.peralatan || '');
      setKendalaText(existing.kendala || '-');
      setCuacaText(existing.cuaca || '- Jam 08:00 - 17.00 Cerah');
      setMaterialMasukText(existing.material_masuk || '-');
      setSaranText(existing.saran || '-');
    } else {
      // Default fallback for Oct 11 or general
      if (selectedDate === '2026-10-11') {
        setRencanaM6('1,755%');
        setRealisasiM6('3,483%');
        setDeviasiM6('1,728%');
        setPekerjaanText('-');
        setPeralatanText('');
        setKendalaText('- material utama belum ada');
        setCuacaText('- Jam 08:00 - 17.00 Cerah');
        setMaterialMasukText('- saat ini belum ada material masuk');
        setSaranText('- Di tambah dudukan alas pijakan, agar pekerja lebih aman\n- lakukan mapping pekerjaan');
      } else {
        setRencanaM6('1,500%');
        setRealisasiM6('1,500%');
        setDeviasiM6('0,000%');
        setPekerjaanText('- Pekerjaan persiapan & struktur konstruksi');
        setPeralatanText('- Excavator, Genset');
        setKendalaText('- Nihil');
        setCuacaText('- Cerah berawan');
        setMaterialMasukText('- Belum ada');
        setSaranText('- Utamakan K3 dan kebersihan area kerja');
      }
    }
    // Load all reports for history list
    setAllSavedReports(DataService.getAllDailyReportNarratives(project.id));
  }, [project, selectedDate]);

  // Handle explicit Save
  const handleSaveReport = () => {
    if (!project) return;
    const narrative: DailyReportNarrative = {
      project_id: project.id,
      work_date: selectedDate,
      rencana_m6: rencanaM6,
      realisasi_m6: realisasiM6,
      deviasi_m6: deviasiM6,
      pekerjaan: pekerjaanText,
      peralatan: peralatanText,
      kendala: kendalaText,
      cuaca: cuacaText,
      material_masuk: materialMasukText,
      saran: saranText,
      updated_at: new Date().toISOString(),
    };
    DataService.saveDailyReportNarrative(narrative);
    setAllSavedReports(DataService.getAllDailyReportNarratives(project.id));
    addToast('success', `Laporan harian tanggal ${formatDateIndo(selectedDate)} berhasil disimpan ke Arsip & LocalStorage!`, 'Penyimpanan Berhasil');
  };

  // Load default template for Oct 11 2026
  const handleLoadTemplate = () => {
    onDateChange('2026-10-11');
    setRencanaM6('1,755%');
    setRealisasiM6('3,483%');
    setDeviasiM6('1,728%');
    setPekerjaanText('-');
    setPeralatanText('');
    setKendalaText('- material utama belum ada');
    setCuacaText('- Jam 08:00 - 17.00 Cerah');
    setMaterialMasukText('- saat ini belum ada material masuk');
    setSaranText('- Di tambah dudukan alas pijakan, agar pekerja lebih aman\n- lakukan mapping pekerjaan');
    addToast('info', 'Template Laporan Harian 11 Oktober 2026 dimuat.');
  };

  // Active roles
  const activeRoles = jobRoles.filter((r) => r.is_active).sort((a, b) => a.sort_order - b.sort_order);

  // Records for selected date
  const recordsForDate = dailyRecords.filter((r) => r.work_date === selectedDate);

  // Build manpower lines dynamically for current state
  const manpowerLines = activeRoles.map((role) => {
    const rec = recordsForDate.find((r) => r.job_role_id === role.id);
    const cnt = rec ? Number(rec.worker_count) || 0 : 0;
    return `- ${role.name} = ${cnt} orang`;
  }).join('\n');

  const dayName = getDayNameIndo(selectedDate);
  const dateFull = formatDateIndoFull(selectedDate);
  const spmkDate = project.start_date ? formatDateIndoFull(project.start_date) : '28 Agustus 2026';
  const consultantName = project.consultant_name || 'PT. Arcansia Dwitama Konsultan KSO PT. Teknik Eksakta';

  const fullReportText = `${project.name}
----------------------------------------
Hari, Tanggal : ${dayName}, ${dateFull}
----------------------------------------
Mulai kerja berdasarkan SPMK = ${spmkDate}
-----------------------------------------
Rencana M6  : ${rencanaM6}
Realisasi M6 : ${realisasiM6}
Deviasi  M6    :  ${deviasiM6}

A. Pekerjaan
${pekerjaanText}

B. Peralatan
${peralatanText || '-'}

C. Kendala di lapangan
${kendalaText}

D. Laporan Cuaca 
${cuacaText}

E. Jumlah Tenaga Kerja :
${manpowerLines || '-'}

F. Material masuk
${materialMasukText}

G. Saran/Instruksi
${saranText}

Terima kasih
${consultantName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    addToast('success', 'Uraian teks laporan harian berhasil disalin ke clipboard!', 'Tersalin');
    setTimeout(() => setCopied(false), 3000);
  };

  // Helper to generate full report text for any archived narrative
  const getReportTextForNarrative = (rep: DailyReportNarrative) => {
    const dName = getDayNameIndo(rep.work_date);
    const dFull = formatDateIndoFull(rep.work_date);
    const sDate = project.start_date ? formatDateIndoFull(project.start_date) : '28 Agustus 2026';
    const recs = dailyRecords.filter((r) => r.work_date === rep.work_date);
    const mLines = activeRoles.map((role) => {
      const rec = recs.find((r) => r.job_role_id === role.id);
      const cnt = rec ? Number(rec.worker_count) || 0 : 0;
      return `- ${role.name} = ${cnt} orang`;
    }).join('\n');

    return `${project.name}
----------------------------------------
Hari, Tanggal : ${dName}, ${dFull}
----------------------------------------
Mulai kerja berdasarkan SPMK = ${sDate}
-----------------------------------------
Rencana M6  : ${rep.rencana_m6 || '1,755%'}
Realisasi M6 : ${rep.realisasi_m6 || '3,483%'}
Deviasi  M6    :  ${rep.deviasi_m6 || '1,728%'}

A. Pekerjaan
${rep.pekerjaan || '-'}

B. Peralatan
${rep.peralatan || '-'}

C. Kendala di lapangan
${rep.kendala || '-'}

D. Laporan Cuaca 
${rep.cuaca || '-'}

E. Jumlah Tenaga Kerja :
${mLines || '-'}

F. Material masuk
${rep.material_masuk || '-'}

G. Saran/Instruksi
${rep.saran || '-'}

Terima kasih
${consultantName}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#142B4A] to-[#1e3a60] rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Manajemen Laporan Harian Lapangan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{project.name}</h1>
          <p className="text-slate-300 text-xs mt-1">
            Susun, pratinjau, dan arsipkan laporan harian konsultan pengawas secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors border border-white/10 shadow-sm"
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
            <span>Arsip Semua Laporan ({allSavedReports.length})</span>
          </button>

          <button
            type="button"
            onClick={handleLoadTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Muat Template 11 Okt</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Left Editor & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Form Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Parameter Laporan Harian
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-[#F28C28]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rencana M6</label>
              <input
                type="text"
                value={rencanaM6}
                onChange={(e) => setRencanaM6(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Realisasi M6</label>
              <input
                type="text"
                value={realisasiM6}
                onChange={(e) => setRealisasiM6(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deviasi M6</label>
              <input
                type="text"
                value={deviasiM6}
                onChange={(e) => setDeviasiM6(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                A. Pekerjaan (Uraian progres harian)
              </label>
              <textarea
                rows={2}
                value={pekerjaanText}
                onChange={(e) => setPekerjaanText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
                placeholder="- Pekerjaan galian / pengecoran..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                B. Peralatan (Alat berat & pendukung)
              </label>
              <textarea
                rows={2}
                value={peralatanText}
                onChange={(e) => setPeralatanText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
                placeholder="- Excavator, Genset, Molen..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                C. Kendala di lapangan
              </label>
              <textarea
                rows={2}
                value={kendalaText}
                onChange={(e) => setKendalaText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
                placeholder="- material utama belum ada"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                D. Laporan Cuaca
              </label>
              <input
                type="text"
                value={cuacaText}
                onChange={(e) => setCuacaText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                F. Material masuk
              </label>
              <input
                type="text"
                value={materialMasukText}
                onChange={(e) => setMaterialMasukText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                G. Saran / Instruksi
              </label>
              <textarea
                rows={3}
                value={saranText}
                onChange={(e) => setSaranText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveReport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142B4A] hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Simpan Laporan Tanggal {formatDateIndo(selectedDate)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">Pratinjau Uraian Teks Resmi</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Uraian Teks'}</span>
              </button>
            </div>

            <div className="mt-3 max-h-[500px] overflow-y-auto pr-1">
              <pre className="whitespace-pre-wrap text-[11px] font-mono text-slate-300 leading-relaxed">
                {fullReportText}
              </pre>
            </div>

            {copied && (
              <div className="mt-3 p-2.5 bg-emerald-900/60 border border-emerald-500/40 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Berhasil disalin ke clipboard! Siap ditempel di WhatsApp atau laporan.</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-4 text-xs text-blue-900 space-y-2">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <span>Dimana Laporan Ini Tersimpan?</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Semua laporan harian yang Anda simpan tersimpan otomatis di dalam <strong>Arsip Sistem (LocalStorage & Cloud)</strong> per tanggal masing-masing. Klik tombol <strong>"Arsip Semua Laporan"</strong> di atas untuk melihat, memuat ulang, atau meninjau seluruh riwayat harian sebelumnya.
            </p>
          </div>
        </div>
      </div>

      {/* History Modal / Drawer for All Previous Reports */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">Arsip Riwayat Laporan Harian Sebelumnya</h3>
                  <p className="text-xs text-slate-300">Daftar lengkap laporan harian yang tersimpan di sistem untuk proyek ini.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50">
              {allSavedReports.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Belum ada laporan harian yang tersimpan di arsip. Klik "Simpan Laporan" pada tanggal terkait.
                </div>
              ) : (
                allSavedReports.map((rep) => (
                  <div
                    key={rep.work_date}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#142B4A] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {formatDateIndo(rep.work_date)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({getDayNameIndo(rep.work_date)})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        <strong>Pekerjaan:</strong> {rep.pekerjaan || '-'} | <strong>Deviasi:</strong> {rep.deviasi_m6 || '-'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingReportModal(rep);
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-300"
                        title="Lihat bentuk pratinjau laporan harian"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#142B4A]" />
                        <span>Lihat View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onDateChange(rep.work_date);
                          setShowHistoryModal(false);
                          setViewingReportModal(rep);
                          addToast('info', `Membuka dan menampilkan view laporan harian tanggal ${formatDateIndo(rep.work_date)}`);
                        }}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>Buka & Edit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
              >
                Tutup Arsip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report View Shape Modal (Pratinjau Bentuk Laporan saat Buka & Edit / Lihat View diklik) */}
      {viewingReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-700">
            <div className="bg-slate-800 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-amber-400">
                    Pratinjau Bentuk Laporan — {formatDateIndo(viewingReportModal.work_date)}
                  </h3>
                  <p className="text-xs text-slate-300">Format resmi uraian laporan harian siap kirim WhatsApp.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReportModal(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950">
              <pre className="whitespace-pre-wrap text-xs font-mono text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-inner">
                {getReportTextForNarrative(viewingReportModal)}
              </pre>

              {modalCopied && (
                <div className="mt-3 p-2.5 bg-emerald-900/80 border border-emerald-500/40 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Berhasil disalin ke clipboard!</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const text = getReportTextForNarrative(viewingReportModal);
                    navigator.clipboard.writeText(text);
                    setModalCopied(true);
                    addToast('success', 'Uraian laporan berhasil disalin!');
                    setTimeout(() => setModalCopied(false), 2500);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-md"
                >
                  <Copy className="w-4 h-4" />
                  <span>Salin Teks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = getReportTextForNarrative(viewingReportModal);
                    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(waUrl, '_blank');
                    addToast('success', 'Membuka WhatsApp untuk mengirim laporan!');
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onDateChange(viewingReportModal.work_date);
                    setViewingReportModal(null);
                    setShowHistoryModal(false);
                    addToast('info', `Tanggal ${formatDateIndo(viewingReportModal.work_date)} dimuat ke editor utama.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#142B4A] hover:bg-slate-800 text-white text-xs font-bold transition-colors border border-slate-700"
                >
                  Muat ke Editor & Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReportModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Tutup View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
