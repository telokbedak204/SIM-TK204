import React, { useState, useEffect } from 'react';
import {
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { UserProfile } from '../../types';
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

  useEffect(() => {
    if (isOpen) {
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

  const cardContent = (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden w-full max-w-[calc(100vw-24px)] sm:max-w-md md:max-w-lg transition-all duration-200 mx-auto box-border">
      {/* Header */}
      <div className="bg-[#142B4A] text-white p-3.5 sm:p-6 relative overflow-hidden border-b border-[#1d3d66]">
        {/* Subtle decorative pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 bg-[radial-gradient(#F28C28_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
        
        <div className="flex items-center justify-between gap-2 relative z-10 w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#F28C28] to-orange-600 flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Logo SIM-TK204"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-lg text-white tracking-tight truncate">
                  SIM-TK204
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-[#F28C28] border border-orange-500/30 whitespace-nowrap">
                  Portal Masuk
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                Sistem Informasi Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <PWAInstallButton variant="login-header" />
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama User / Email Login:
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="misal: base204data@gmail.com"
                className="w-full text-sm pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 rounded-xl border border-slate-300 font-sans focus:outline-hidden focus:border-[#F28C28] focus:ring-2 focus:ring-orange-200 min-h-[44px] transition-all box-border"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                placeholder="Masukkan password akun..."
                className="w-full text-sm pl-9 sm:pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-300 font-sans focus:outline-hidden focus:border-[#F28C28] focus:ring-2 focus:ring-orange-200 min-h-[44px] transition-all box-border"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F28C28] hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all min-h-[46px] sm:min-h-[48px] cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Aplikasi'}</span>
          </button>
        </form>

        {/* Fitur Instal Aplikasi (PWA) di Halaman Login */}
        <PWAInstallButton variant="login" />

        {/* Security & Access Notice */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] sm:text-xs text-slate-500 flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Hak akses RBAC terenkripsi & sesi aman.</span>
          </div>
          <span className="font-mono text-[9px] text-slate-400 shrink-0">v2.0 PWA</span>
        </div>
        
        <div className="text-center text-[10px] sm:text-[11px] text-slate-400 pt-0.5">
          @Copyright Azman204
        </div>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6 overflow-x-hidden">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in">
      <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6 overflow-x-hidden">
        {cardContent}
      </div>
    </div>
  );
};
