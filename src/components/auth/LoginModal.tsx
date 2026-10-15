import React, { useState, useEffect } from 'react';
import {
  LogIn,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  HardHat,
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { UserProfile, UserRole } from '../../types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface LoginModalProps {
  isOpen: boolean;
  isFullPage?: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  addToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  isFullPage = false,
  onClose,
  onLoginSuccess,
  addToast,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSystemUsers(DataService.getSystemUsers());
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Silakan isi Nama User / Email dan Password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = DataService.authenticate(identifier, password);
      setIsLoading(false);

      if (res.success && res.user) {
        if (addToast) {
          addToast('success', `Selamat datang, ${res.user.full_name}! Berhasil masuk sebagai ${res.user.role.toUpperCase()}.`);
        }
        onLoginSuccess(res.user);
        if (onClose) onClose();
      } else {
        setErrorMessage(res.error || 'Login gagal. Periksa kembali user dan password.');
      }
    }, 250);
  };

  const handleQuickSelectUser = (user: any) => {
    setIdentifier(user.email);
    setPassword(user.password || 'password123');
    setErrorMessage('');
  };

  const roleBadgeStyle: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    project_manager: 'bg-blue-100 text-blue-800 border-blue-200',
    site_engineer: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    hse_officer: 'bg-amber-100 text-amber-800 border-amber-200',
    estimator: 'bg-teal-100 text-teal-800 border-teal-200',
    qa_qc: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    supervisor: 'bg-sky-100 text-sky-800 border-sky-200',
    editor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    viewer: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const roleNameMap: Record<UserRole, string> = {
    admin: 'Administrator',
    project_manager: 'Project Manager',
    site_engineer: 'Site Engineer',
    hse_officer: 'HSE Officer',
    estimator: 'Estimator',
    qa_qc: 'Ahli QA/QC',
    supervisor: 'Supervisor',
    editor: 'Site Editor',
    viewer: 'Viewer',
  };

  const content = (
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full ${isFullPage ? 'max-w-xl my-auto' : 'max-w-md'}`}>
      {/* Header */}
      <div className="bg-[#142B4A] text-white p-5 sm:p-6 relative overflow-hidden border-b border-[#1d3d66]">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(#F28C28_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F28C28] to-orange-600 flex items-center justify-center text-white shadow-lg border border-white/10 shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Logo SIM-TK204"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg text-white tracking-tight">
                  SIM-TK204
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-[#F28C28] border border-orange-500/30">
                  Portal Masuk
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Sistem Informasi Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton variant="login-header" />
            {!isFullPage && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama User / Email Login:
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:border-[#F28C28] focus:ring-2 focus:ring-orange-200 min-h-[42px]"
                required
                autoFocus
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password Login:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:border-[#F28C28] focus:ring-2 focus:ring-orange-200 min-h-[42px]"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F28C28] hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Aplikasi'}</span>
          </button>
        </form>

        {/* Fitur Instal Aplikasi (PWA) di Halaman Login */}
        <PWAInstallButton variant="login" />

        {/* Security & Access Notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hak akses RBAC terenkripsi & sesi aman.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.0 PWA</span>
        </div>
        
        <div className="text-center text-[10px] text-slate-400 pt-2">
          @Copyright Azman204
        </div>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      {content}
    </div>
  );
};
