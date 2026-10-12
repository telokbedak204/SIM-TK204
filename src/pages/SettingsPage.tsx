import React, { useState, useEffect } from 'react';
import {
  Database,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Server,
  CloudUpload,
  UserCheck,
  Lock,
  Mail,
  KeyRound,
  RefreshCw,
  Table,
  Folder,
  FileSpreadsheet,
  HardDrive,
  Cloud,
  LogOut,
  Sliders,
  Sparkles,
  Upload,
  Info,
  Code2,
  Layers,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  testSupabaseConnection,
  DetailedConnectionTest,
} from '../lib/supabase';
import { SIM_TK204_SQL_MIGRATION } from '../lib/sqlMigration';
import { DataService, DEFAULT_GOOGLE_SETTINGS } from '../services/dataService';
import { UserRole, GoogleIntegrationSettings } from '../types';
import { initGoogleAuth, googleSignIn, googleSignOut, getAccessToken } from '../lib/googleDriveAuth';
import { User } from 'firebase/auth';

interface SettingsPageProps {
  onRefreshData: () => void;
  onNavigateToProjects?: () => void;
  addToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onRefreshData,
  onNavigateToProjects,
  addToast,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<DetailedConnectionTest | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Google Drive & Sheets Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSettings, setGoogleSettings] = useState<GoogleIntegrationSettings>(DataService.getGoogleSettings());
  const [googleSettingsSaved, setGoogleSettingsSaved] = useState(false);
  const [isTestingSheets, setIsTestingSheets] = useState(false);
  const [sheetsTestMsg, setSheetsTestMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    const unsub = initGoogleAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        if (addToast) addToast('success', `Berhasil terhubung ke akun Google: ${res.user.email}`);
      }
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal menghubungkan akun Google: ' + err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      if (addToast) addToast('info', 'Berhasil memutuskan sambungan akun Google.');
    } catch (err: any) {
      if (addToast) addToast('error', 'Gagal logout Google: ' + err.message);
    }
  };

  const handleSaveGoogleSettings = () => {
    DataService.saveGoogleSettings(googleSettings);
    setGoogleSettingsSaved(true);
    if (addToast) addToast('success', 'Pengaturan Google Drive & Google Sheets berhasil disimpan!');
    setTimeout(() => setGoogleSettingsSaved(false), 3000);
  };

  const handleResetGoogleSettings = () => {
    setGoogleSettings(DEFAULT_GOOGLE_SETTINGS);
    DataService.saveGoogleSettings(DEFAULT_GOOGLE_SETTINGS);
    setGoogleSettingsSaved(true);
    if (addToast) addToast('info', 'Pengaturan Google dikembalikan ke nilai bawaan.');
    setTimeout(() => setGoogleSettingsSaved(false), 3000);
  };

  const handleTestCreateSheet = async () => {
    setIsTestingSheets(true);
    setSheetsTestMsg(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        if (!res) {
          setIsTestingSheets(false);
          return;
        }
        token = res.accessToken;
      }

      if (!token) throw new Error('Token akses Google tidak tersedia.');

      const nowStr = new Date().toLocaleString('id-ID');
      const createRes = await fetch('https://sheets.googleapis.com/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `[Uji Integrasi] SIM-TK204 Test Sheet - ${nowStr}`,
          },
        }),
      });

      const responseText = await createRes.text();
      let sheetData: any;
      try {
        sheetData = JSON.parse(responseText);
      } catch {
        throw new Error('Respon server Google tidak valid atau otorisasi perlu diperbarui.');
      }

      if (!createRes.ok) {
        throw new Error(sheetData.error?.message || `Gagal membuat spreadsheet (Status: ${createRes.status})`);
      }

      // Add a test row
      await fetch(
        `https://sheets.googleapis.com/spreadsheets/${sheetData.spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [
              ['Sistem Informasi Monitoring Tenaga Kerja SIM-TK204'],
              ['Status Uji Koneksi: BERHASIL'],
              ['Waktu Pengujian:', nowStr],
            ],
          }),
        }
      );

      setSheetsTestMsg({
        success: true,
        text: `Koneksi Google Sheets berhasil! Dokumen dibuat: ${sheetData.spreadsheetUrl}`,
      });
      if (googleSettings.autoOpenSpreadsheetAfterExport) {
        window.open(sheetData.spreadsheetUrl, '_blank');
      }
    } catch (err: any) {
      setSheetsTestMsg({
        success: false,
        text: 'Pengujian Google Sheets gagal: ' + err.message,
      });
    } finally {
      setIsTestingSheets(false);
    }
  };

  // Supabase Auth Tab States
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>('editor');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleSaveConfig = () => {
    saveStoredSupabaseConfig(supabaseUrl, supabaseKey);
    setTestResult({
      success: true,
      message: 'Kredensial Supabase berhasil disimpan secara lokal! Memuat ulang koneksi...',
      authWorking: true,
      tables: [],
    });
    onRefreshData();
  };

  const handleClearConfig = () => {
    clearStoredSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult(null);
    setSyncStatus(null);
    onRefreshData();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleCopyMigrationSql = () => {
    navigator.clipboard.writeText(SIM_TK204_SQL_MIGRATION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const res = await DataService.pushLocalDataToSupabase();
    setIsSyncing(false);
    setSyncStatus(res);
    if (res.success) {
      onRefreshData();
    }
  };

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthMessage(null);

    if (authMode === 'login') {
      const res = await DataService.signInWithSupabase(authEmail, authPassword);
      setIsAuthLoading(false);
      if (res.success) {
        setAuthMessage({ success: true, text: `Berhasil masuk sebagai ${res.user?.full_name} (${res.user?.role.toUpperCase()})!` });
        onRefreshData();
      } else {
        setAuthMessage({ success: false, text: res.error || 'Login gagal.' });
      }
    } else {
      const res = await DataService.signUpWithSupabase(authEmail, authPassword, authFullName, authRole);
      setIsAuthLoading(false);
      if (res.success) {
        setAuthMessage({ success: true, text: `Pendaftaran berhasil untuk ${authEmail}! Akun siap digunakan.` });
        onRefreshData();
      } else {
        setAuthMessage({ success: false, text: res.error || 'Pendaftaran gagal.' });
      }
    }
  };

  const isConfigured = Boolean(supabaseUrl && supabaseKey);
  const currentUser = DataService.getCurrentUser();

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full min-w-0">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#142B4A]"></span>
          <h2 className="text-lg font-bold text-[#142B4A]">
            Pengaturan Database
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi koneksi database PostgreSQL, otentikasi user multi-peran, teknologi integrasi Google Drive & Sheets, serta sinkronisasi data cloud
        </p>
      </div>

      {/* 1. Supabase Connection Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Koneksi Supabase PostgreSQL
              </h3>
              <p className="text-xs text-slate-500">
                Penyimpanan data cloud relasional permanen dengan isolasi antarproyek
              </p>
            </div>
          </div>

          <span
            className={`self-start sm:self-auto px-2.5 py-1 rounded-md text-xs font-bold border ${
              isConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {isConfigured ? 'Kredensial Terkonfigurasi' : 'Mode Offline / Demo'}
          </span>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project URL Supabase (VITE_SUPABASE_URL):
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-ref.supabase.co"
              className="w-full text-xs sm:text-sm font-mono px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden min-h-[44px]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Ditemukan di Supabase Dashboard &gt; Project Settings &gt; Data API &gt; Project URL
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Publishable / Anon API Key (VITE_SUPABASE_PUBLISHABLE_KEY):
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full text-xs sm:text-sm font-mono px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden min-h-[44px]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Gunakan hanya publishable/anon key. <strong>JANGAN PERNAH</strong> memasukkan service_role key di browser klien.
            </p>
          </div>
        </div>

        {/* Test Result Alert & Table Diagnostics */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2.5 ${
              testResult.success
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-semibold leading-relaxed">
                {testResult.message}
              </div>
            </div>

            {testResult.tables.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {testResult.tables.map((t) => (
                  <div
                    key={t.tableName}
                    className={`p-2 rounded-lg border text-[11px] ${
                      t.exists
                        ? 'bg-white border-emerald-200 text-emerald-900'
                        : 'bg-white border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="font-mono font-bold flex items-center justify-between">
                      <span>{t.tableName}</span>
                      {t.exists ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {t.exists ? `${t.rowCount ?? 0} baris` : 'Belum Ada'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !supabaseUrl || !supabaseKey}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 transition-colors min-h-[44px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji Diagnostik...' : 'Uji Koneksi & Diagnostik Tabel'}</span>
            </button>

            <button
              onClick={handleSaveConfig}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kredensial</span>
            </button>
          </div>

          {isConfigured && (
            <button
              onClick={handleClearConfig}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold min-h-[44px] flex items-center justify-center"
            >
              Reset ke Mode Offline
            </button>
          )}
        </div>
      </div>

      {/* 2. Integrasi Google Drive & Google Sheets */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Integrasi Google Workspace (Drive & Sheets)
              </h3>
              <p className="text-xs text-slate-500">
                Penyimpanan foto dokumentasi harian di Drive & ekspor matriks tenaga kerja ke Google Sheets
              </p>
            </div>
          </div>

          <span
            className={`self-start sm:self-auto px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 ${
              googleUser
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {googleUser ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Terhubung</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Belum Terhubung</span>
              </>
            )}
          </span>
        </div>

        {/* Google Account Status Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#142B4A] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {googleUser ? (googleUser.email ? googleUser.email.charAt(0).toUpperCase() : 'G') : 'G'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {googleUser ? googleUser.displayName || 'Akun Google Terhubung' : 'Akun Google Belum Terhubung'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {googleUser ? googleUser.email : 'Otorisasikan akun Google untuk mengaktifkan sinkronisasi Drive & Sheets'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {googleUser ? (
              <button
                type="button"
                onClick={handleGoogleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors min-h-[40px]"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Putuskan Sambungan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4285F4] hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-xs min-h-[40px]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isGoogleLoading ? 'Menghubungkan...' : 'Hubungkan Akun Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kolom Kiri: Pengaturan Google Drive */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pengaturan Google Drive (Foto)
                </h4>
              </div>
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Buka Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Folder Default di Drive:
                </label>
                <input
                  type="text"
                  value={googleSettings.driveFolderName}
                  onChange={(e) => setGoogleSettings({ ...googleSettings, driveFolderName: e.target.value })}
                  placeholder="SIM-TK204_Dokumentasi_Proyek"
                  className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#F28C28]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Folder di Google Drive tempat menampung seluruh foto progres lapangan.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Prefix Awalan Penamaan Foto:
                </label>
                <input
                  type="text"
                  value={googleSettings.photoNamingPrefix}
                  onChange={(e) => setGoogleSettings({ ...googleSettings, photoNamingPrefix: e.target.value })}
                  placeholder="DOK"
                  className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#F28C28]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Format: [Prefix]_[KodeProyek]_[Tanggal]_[NamaBerkas]
                </p>
              </div>

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={googleSettings.autoCompressPhotos}
                  onChange={(e) => setGoogleSettings({ ...googleSettings, autoCompressPhotos: e.target.checked })}
                  className="mt-0.5 rounded text-[#F28C28] focus:ring-[#F28C28]"
                />
                <span className="text-slate-700 leading-tight">
                  <strong>Kompresi Gambar Otomatis</strong> — Mengoptimalkan ukuran gambar sebelum diunggah untuk menghemat bandwidth lapangan dan kuota Google Drive.
                </span>
              </label>
            </div>
          </div>

          {/* Kolom Kanan: Pengaturan Google Sheets */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pengaturan Google Sheets (Ekspor)
                </h4>
              </div>
              <a
                href="https://sheets.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Buka Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={googleSettings.sheetsIncludeProjectHeader}
                  onChange={(e) => setGoogleSettings({ ...googleSettings, sheetsIncludeProjectHeader: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 leading-tight">
                  <strong>Sertakan Header Proyek</strong> — Menambahkan nama proyek dan tanggal periode di bagian atas lembar spreadsheet.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={googleSettings.sheetsIncludeSummaryRow}
                  onChange={(e) => setGoogleSettings({ ...googleSettings, sheetsIncludeSummaryRow: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 leading-tight">
                  <strong>Sertakan Baris Total Harian</strong> — Menyertakan baris akumulasi total orang-hari dan rata-rata di bawah tabel matriks.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={googleSettings.sheetsNumberFormatId}
                  onChange={(e) => setGoogleSettings({ ...googleSettings, sheetsNumberFormatId: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 leading-tight">
                  <strong>Format Angka Standar Indonesia</strong> — Menampilkan angka dengan pemisah koma desimal Indonesia.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={googleSettings.autoOpenSpreadsheetAfterExport}
                  onChange={(e) => setGoogleSettings({ ...googleSettings, autoOpenSpreadsheetAfterExport: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 leading-tight">
                  <strong>Buka Otomatis setelah Ekspor</strong> — Membuka spreadsheet baru di tab peramban langsung setelah proses selesai.
                </span>
              </label>

              {/* Uji Ekspor Google Sheets */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestCreateSheet}
                  disabled={isTestingSheets}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors disabled:opacity-50 min-h-[38px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTestingSheets ? 'Menguji Pembuatan Sheet...' : 'Uji Buat Dokumen di Google Sheets'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message for sheets test */}
        {sheetsTestMsg && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              sheetsTestMsg.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {sheetsTestMsg.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="break-all">{sheetsTestMsg.text}</span>
          </div>
        )}

        {/* --- SPESIFIKASI & ARSITEKTUR TEKNOLOGI GOOGLE DRIVE & GOOGLE SHEETS --- */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Spesifikasi & Arsitektur Teknologi Google Drive & Google Sheets
              </h4>
              <p className="text-[11px] text-slate-500">
                Dokumentasi arsitektur API resmi, alur transmisi berkas, isolasi hak akses OAuth 2.0, dan kompresi sisi klien
              </p>
            </div>
          </div>

          {/* 3 Technical Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tech 1: Google Drive REST API */}
            <div className="p-3.5 rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Google Drive REST API v3
                </span>
                <Folder className="w-4 h-4 text-amber-600" />
              </div>
              <div className="font-bold text-xs text-slate-800">
                Penyimpanan Awan Foto Lapangan
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Menyimpan seluruh dokumentasi foto fisik pekerjaan konstruksi langsung ke akun Google Drive pengguna menggunakan metode pengunggahan <em>multipart upload</em>.
              </p>
              <div className="space-y-1.5 pt-1 border-t border-amber-100 text-[10px] text-slate-600 font-mono">
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Scope:</span>
                  <span className="break-all text-blue-700">drive.file</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Metode:</span>
                  <span className="text-emerald-700 font-sans">Multipart (JSON Meta + Binary)</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Endpoint:</span>
                  <span className="break-all text-slate-500">upload/drive/v3/files</span>
                </div>
              </div>
              <div className="bg-amber-100/60 rounded-lg p-2 text-[10px] text-amber-900 leading-tight">
                <strong>Optimasi Kompresi:</strong> Berkas foto dikompresi otomatis di memori peramban sebelum diunggah (~80% lebih hemat kuota).
              </div>
            </div>

            {/* Tech 2: Google Sheets REST API */}
            <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Google Sheets API v4
                </span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-bold text-xs text-slate-800">
                Ekspor & Rekapitulasi Otomatis
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Membuat dokumen spreadsheet berformat resmi secara real-time yang berisi kop identitas proyek, matriks kehadiran harian (M1–M7), total OH, dan rata-rata.
              </p>
              <div className="space-y-1.5 pt-1 border-t border-emerald-100 text-[10px] text-slate-600 font-mono">
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Scope:</span>
                  <span className="break-all text-emerald-700">spreadsheets</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Metode:</span>
                  <span className="text-blue-700 font-sans">Batch Insert & Auto-Formulas</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Endpoint:</span>
                  <span className="break-all text-slate-500">sheets.googleapis.com/v4</span>
                </div>
              </div>
              <div className="bg-emerald-100/60 rounded-lg p-2 text-[10px] text-emerald-900 leading-tight">
                <strong>Kolaborasi Daring:</strong> Dokumen yang dihasilkan langsung dapat dibuka bersama oleh konsultan MK dan owner proyek.
              </div>
            </div>

            {/* Tech 3: OAuth 2.0 Security */}
            <div className="p-3.5 rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50/40 to-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  OAuth 2.0 Client Flow
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-bold text-xs text-slate-800">
                Keamanan & Isolasi Hak Akses
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Menggunakan standar otentikasi Google Identity Service. Sistem tidak pernah menyimpan password Google pengguna pada database aplikasi.
              </p>
              <div className="space-y-1.5 pt-1 border-t border-blue-100 text-[10px] text-slate-600 font-mono">
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Tipe Token:</span>
                  <span className="text-blue-700 font-sans">Bearer Access Token (OAuth2)</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Isolasi Data:</span>
                  <span className="text-emerald-700 font-sans">Hanya Berkas Aplikasi Ini</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-slate-700 shrink-0">Privasi:</span>
                  <span className="text-slate-700 font-sans">File Pribadi Lain Terlindungi 100%</span>
                </div>
              </div>
              <div className="bg-blue-100/60 rounded-lg p-2 text-[10px] text-blue-900 leading-tight">
                <strong>Kendali Penuh:</strong> Otorisasi akun dapat diputuskan sewaktu-waktu dengan satu klik dari panel pengaturan ini.
              </div>
            </div>
          </div>

          {/* Workflow Pipeline Diagram */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Diagram Alur Integrasi Teknologi di Lapangan:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="font-bold text-[#142B4A]">1. Input Lapangan</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Foto fisik diambil via kamera HP/galeri di menu Laporan Harian.
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="font-bold text-[#F28C28]">2. Kompresi Sisi Klien</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Foto dioptimalkan otomatis di browser untuk menghemat paket data.
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="font-bold text-amber-700">3. Google Drive API</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Foto terunggah ke Drive; URL thumbnail & preview disimpan ke database.
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="font-bold text-emerald-700">4. Google Sheets API</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Rekap mingguan diekspor otomatis menjadi spreadsheet interaktif cloud.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons: Save & Reset */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveGoogleSettings}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{googleSettingsSaved ? 'Tersimpan!' : 'Simpan Pengaturan Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetGoogleSettings}
              className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors min-h-[44px]"
            >
              Kembalikan ke Default
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            Pengaturan disimpan secara lokal dan berlaku untuk menu Laporan Harian & Mingguan
          </span>
        </div>
      </div>

      {/* 3. SQL Migration & Schema Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#142B4A]" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Skema DDL & Kebijakan RLS (282 Baris SQL)
            </h3>
          </div>

          <button
            onClick={handleCopyMigrationSql}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#142B4A] hover:bg-[#1c3a63] text-white text-xs font-bold transition-all min-h-[44px] shrink-0"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'SQL Tersalin ke Clipboard!' : 'Salin Seluruh SQL Skema'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Skema ini mencakup 5 tabel utama (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">profiles</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">projects</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">project_members</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">job_roles</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">daily_manpower</code>), trigger updated_at otomatis, auto-profile trigger saat user sign up, dan 10 aturan Row Level Security untuk hak akses admin, PM, editor, dan viewer.
        </p>

        <div className="bg-slate-900 rounded-lg p-3 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
          <pre>{SIM_TK204_SQL_MIGRATION.slice(0, 700)}
{'... (282 baris DDL, RLS, Indexes, & Triggers lengkap)'}</pre>
        </div>
      </div>

      {/* 3. Cloud Synchronization: Push Local Data to Supabase */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <CloudUpload className="w-5 h-5 text-[#F28C28]" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Sinkronisasi Data Lokal ke Supabase Cloud
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Setelah membuat tabel di Supabase SQL Editor, gunakan tombol ini untuk langsung mengunggah seluruh proyek, master jabatan, dan catatan tenaga kerja harian ke database online.
        </p>

        {syncStatus && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              syncStatus.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {syncStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            <span>{syncStatus.message}</span>
          </div>
        )}

        <div className="pt-1">
          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing || !isConfigured}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold disabled:opacity-40 transition-colors min-h-[44px] w-full sm:w-auto"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{isSyncing ? 'Mengunggah Data...' : 'Unggah & Sinkronisasi Seluruh Data ke Supabase'}</span>
          </button>
        </div>
      </div>

      {/* 4. Live Supabase Auth Sign In / Sign Up */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Autentikasi Supabase Auth
              </h3>
              <p className="text-xs text-slate-500">
                Login akun riil dengan email & kata sandi ke Supabase Auth
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors min-h-[36px] ${
                authMode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors min-h-[36px] ${
                authMode === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {authMessage && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              authMessage.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {authMessage.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
            <span>{authMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSupabaseAuth} className="space-y-3">
          {authMode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={authFullName}
                  onChange={(e) => setAuthFullName(e.target.value)}
                  placeholder="Ir. Budi Santoso"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran Pengguna (Role) *</label>
                <select
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value as UserRole)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white min-h-[44px]"
                >
                  <option value="admin">Administrator</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="editor">Site Editor / Pencatat</option>
                  <option value="viewer">Viewer (Hanya Lihat)</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Akun *</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="nama@perusahaan.co.id"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi *</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden min-h-[44px]"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Pengguna saat ini: <strong>{currentUser.full_name}</strong> ({currentUser.role.toUpperCase()})
            </span>
            <button
              type="submit"
              disabled={isAuthLoading || !isConfigured}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold disabled:opacity-40 transition-colors min-h-[44px]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isAuthLoading ? 'Memproses...' : authMode === 'login' ? 'Masuk dengan Supabase' : 'Daftar Akun Baru'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Clear All Data Card */}
      <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-rose-900 text-sm sm:text-base">
              Kosongkan Semua Data Sistem (Clear All Data)
            </h3>
            <p className="text-xs text-rose-700">
              Hapus seluruh data proyek, tenaga kerja, dan laporan harian agar Anda dapat memasukkan data baru dari awal
            </p>
          </div>
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh data? Tindakan ini akan menghapus semua proyek, catatan tenaga kerja, dan laporan harian sehingga Anda dapat menginput data baru.')) {
                DataService.clearAllData();
                onRefreshData();
                if (onNavigateToProjects) {
                  onNavigateToProjects();
                }
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Kosongkan Semua Data Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
