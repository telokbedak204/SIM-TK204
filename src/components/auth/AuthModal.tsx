import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';
import { UserProfile, UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    if (!isConfigured) {
      setErrorMsg('Koneksi Supabase belum diatur. Silakan masukkan Project URL & Key di menu Pengaturan terlebih dahulu.');
      return;
    }

    const client = getSupabase();
    if (!client) {
      setErrorMsg('Klien Supabase tidak dapat diinisialisasi.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // Fetch profile from public.profiles
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const activeUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profileData?.full_name || data.user.user_metadata?.full_name || splitEmail(email),
            role: (profileData?.role as UserRole) || 'editor',
            company: profileData?.company,
            phone: profileData?.phone,
          };

          onAuthSuccess(activeUser);
          onClose();
        }
      } else {
        // Sign Up
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim() || splitEmail(email),
              role,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setSuccessMsg('Pendaftaran berhasil! Akun Anda telah dibuat.');
          // Auto sign in or set profile
          const newUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName.trim() || splitEmail(email),
            role,
          };
          onAuthSuccess(newUser);
          setTimeout(() => onClose(), 1200);
        }
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Terjadi kesalahan otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const splitEmail = (em: string) => em.split('@')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F28C28] flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {mode === 'signin' ? 'Masuk ke SIM-TK204' : 'Daftar Akun Pengguna Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                Autentikasi aman melalui Supabase Auth & RLS
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuth} className="p-5 space-y-4">
          {!isConfigured && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Supabase URL & Key belum terpasang. Anda dapat menyetel kredensial terlebih dahulu pada menu <strong>Pengaturan & Supabase</strong>.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ir. Hendra Wijaya, MT"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden min-h-[44px]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden min-h-[44px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi (Password) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden min-h-[44px]"
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peran Pengguna (Role Akses) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden min-h-[44px] bg-white font-medium"
              >
                <option value="editor">Site Editor / Pencatat (Input Lapangan)</option>
                <option value="project_manager">Project Manager (Kelola & Validasi Laporan Proyek)</option>
                <option value="site_engineer">Site Engineer / Ahli Teknik</option>
                <option value="hse_officer">Ahli K3 / HSE Officer</option>
                <option value="estimator">Estimator & Cost Control</option>
                <option value="qa_qc">Ahli QA / QC</option>
                <option value="supervisor">Pengawas Lapangan / Supervisor</option>
                <option value="viewer">Viewer (Hanya Melihat Laporan & Dashboard)</option>
                <option value="admin">Administrator (Akses Penuh Seluruh Sistem)</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md transition-colors min-h-[44px] disabled:opacity-50"
            >
              {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{loading ? 'Memproses...' : mode === 'signin' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs text-slate-600 hover:text-[#142B4A] font-semibold underline"
            >
              {mode === 'signin' ? 'Belum punya akun? Buat akun baru' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
