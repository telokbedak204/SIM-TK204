import React, { useState } from 'react';
import {
  Database,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
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
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  testSupabaseConnection,
  DetailedConnectionTest,
} from '../lib/supabase';
import { SIM_TK204_SQL_MIGRATION } from '../lib/sqlMigration';
import { DataService } from '../services/dataService';
import { UserRole } from '../types';

interface SettingsPageProps {
  onResetDemo: () => void;
  onRefreshData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetDemo,
  onRefreshData,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<DetailedConnectionTest | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);

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
            Pengaturan Sistem, Supabase Database & Keamanan
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi koneksi database PostgreSQL, otentikasi user multi-peran, verifikasi Row Level Security (RLS), dan migrasi data
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

      {/* 2. SQL Migration & Schema Reference */}
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

      {/* 5. Demo Data Management Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#F28C28]" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Data Uji Terstandar Proyek Pasar Loka
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Data demo mencakup proyek <strong>"Lanjutan Renovasi Pasar Loka – Kepulauan Anambas"</strong> pada periode <strong>2–8 Oktober 2026</strong> dengan 97 total orang-hari dan rata-rata 13,86 orang per hari.
        </p>

        <div className="pt-1">
          <button
            onClick={() => {
              if (confirm('Muat ulang data demo standar Pasar Loka (97 OH, 13,86 Org/Hari)?')) {
                onResetDemo();
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#F28C28] border border-orange-200 text-xs font-bold transition-colors min-h-[44px] w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Muat Ulang Data Standar Demo Pasar Loka</span>
          </button>
        </div>
      </div>
    </div>
  );
};
