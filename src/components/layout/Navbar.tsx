import React, { useState } from 'react';
import {
  Menu,
  Building2,
  Database,
  ShieldCheck,
  ChevronDown,
  HardHat,
  Sparkles,
  UserCheck,
  X,
  Share2,
  Bell,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Project, UserProfile, UserRole } from '../../types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeProject: Project | null;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  isSupabaseOnline: boolean;
  currentUser: UserProfile;
  onRoleChange: (newRole: UserRole) => void;
  onOpenSettings: () => void;
  onOpenShare?: () => void;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  activeProject,
  projects,
  onSelectProject,
  isSupabaseOnline,
  currentUser,
  onRoleChange,
  onOpenSettings,
  onOpenShare,
  unreadNotificationCount = 0,
  onOpenNotifications,
  onLogout,
  onOpenLogin,
}) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    admin: { label: 'Administrator', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
    project_manager: { label: 'Project Manager', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    site_engineer: { label: 'Site Engineer', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    hse_officer: { label: 'HSE Officer', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    estimator: { label: 'Estimator', badge: 'bg-teal-100 text-teal-800 border-teal-200' },
    qa_qc: { label: 'Ahli QA/QC', badge: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    supervisor: { label: 'Supervisor', badge: 'bg-sky-100 text-sky-800 border-sky-200' },
    editor: { label: 'Site Editor / Pencatat', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    viewer: { label: 'Viewer (Hanya Lihat)', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#142B4A] text-white shadow-md border-b border-[#1c3a63] w-full min-w-0">
      <div className="flex items-center justify-between px-2.5 sm:px-4 md:px-6 h-16 max-w-full">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors shrink-0"
            aria-label="Buka Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-[#F28C28] flex items-center justify-center shadow-md border border-orange-400/40 shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Logo SIM-TK204"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div className="hidden xs:block sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base md:text-lg tracking-wider text-white">
                  SIM-TK204
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-[#F28C28] border border-orange-500/30">
                  v2.0 PWA
                </span>
              </div>
              <p className="hidden lg:block text-[10px] text-slate-300 font-medium truncate max-w-[240px]">
                Monitoring Tenaga Kerja Proyek
              </p>
            </div>
          </div>
        </div>

        {/* Center / Project Selector: Expands flexibly, truncates gracefully */}
        <div className="relative flex-1 min-w-0 max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md mx-1 sm:mx-3">
          <button
            onClick={() => {
              setShowProjectDropdown(!showProjectDropdown);
              setShowRoleDropdown(false);
            }}
            className="w-full flex items-center justify-between gap-1 sm:gap-2 bg-slate-900/70 hover:bg-slate-900 text-left px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700/70 transition-all min-h-[42px] sm:min-h-[44px]"
            aria-label="Pilih Proyek Aktif"
            title={activeProject ? activeProject.name : 'Pilih Proyek...'}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F28C28] shrink-0" />
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider truncate hidden xs:block">
                  Proyek Aktif
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white truncate block">
                  {activeProject ? activeProject.name : 'Pilih Proyek...'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
          </button>

          {/* Project Dropdown: Responsive across 320px to desktop */}
          {showProjectDropdown && (
            <>
              <div
                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-2xs sm:hidden"
                onClick={() => setShowProjectDropdown(false)}
              />
              <div className="fixed top-16 left-2 right-2 sm:absolute sm:top-full sm:mt-2 sm:left-0 sm:right-auto sm:w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 max-w-[calc(100vw-16px)]">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pilih Proyek Aktif</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">{projects.length} Proyek</span>
                    <button
                      onClick={() => setShowProjectDropdown(false)}
                      className="sm:hidden p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {projects.map((p) => {
                    const isSelected = activeProject?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectProject(p.id);
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 min-h-[44px] ${
                          isSelected ? 'bg-orange-50/80 border-l-4 border-[#F28C28]' : ''
                        }`}
                      >
                        <Building2 className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#F28C28]' : 'text-slate-400'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{p.code}</span>
                            <span>•</span>
                            <span className="capitalize">{p.status}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: PWA Install, Share, Database Status & User Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* In-app PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Notifications Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:text-white transition-all min-h-[38px] flex items-center justify-center"
              title="Pusat Notifikasi & Pengingat"
              aria-label="Pusat Notifikasi"
            >
              <Bell className="w-4 h-4 text-[#F28C28]" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Share App Button */}
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:text-white text-xs font-semibold transition-all min-h-[38px]"
              title="Bagikan Tautan Aplikasi & Pratinjau Sosial"
              aria-label="Bagikan Tautan Aplikasi"
            >
              <Share2 className="w-3.5 h-3.5 text-[#F28C28]" />
              <span className="hidden md:inline">Bagikan</span>
            </button>
          )}

          {/* Database indicator */}
          {currentUser.role === 'admin' && (
            <button
              onClick={onOpenSettings}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                isSupabaseOnline
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/50 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
              }`}
              title={isSupabaseOnline ? 'Supabase PostgreSQL Terhubung' : 'Mode Offline / Demo Lokal (Klik untuk setel Supabase)'}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseOnline ? 'Supabase Online' : 'Mode Demo'}</span>
            </button>
          )}

          {/* Quick Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all min-h-[38px]"
              title="Keluar dari Aplikasi (Logout)"
              aria-label="Keluar dari Aplikasi"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          )}

          {/* User profile & Role switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowProjectDropdown(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors min-h-[44px]"
              aria-label="Profil Pengguna & Simulasi Hak Akses"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F28C28] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left max-w-[120px]">
                <div className="text-xs font-semibold text-white leading-tight truncate">{currentUser.full_name}</div>
                <div className="text-[10px] text-[#F28C28] leading-tight font-medium truncate">
                  {roleLabels[currentUser.role]?.label || currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Role Dropdown: Responsive across 320px to desktop */}
            {showRoleDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-2xs sm:hidden"
                  onClick={() => setShowRoleDropdown(false)}
                />
                <div className="fixed top-16 left-2 right-2 sm:absolute sm:top-full sm:mt-2 sm:right-0 sm:left-auto sm:w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 max-w-[calc(100vw-16px)]">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{currentUser.full_name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    </div>
                    <button
                      onClick={() => setShowRoleDropdown(false)}
                      className="sm:hidden p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>


                  <div className="border-t border-slate-100 px-2 pt-2 space-y-1">
                    {onOpenLogin && (
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onOpenLogin();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs text-blue-700 hover:bg-blue-50 rounded-md transition-colors min-h-[40px] flex items-center gap-2 font-semibold"
                      >
                        <LogIn className="w-3.5 h-3.5 text-blue-600" />
                        <span>Masuk / Ganti Akun...</span>
                      </button>
                    )}

                    {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onOpenSettings();
                            setShowRoleDropdown(false);
                          }}
                          className="w-full text-left px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors min-h-[40px] flex items-center gap-2"
                        >
                          <Database className="w-3.5 h-3.5 text-slate-500" />
                          <span>Pengaturan Database...</span>
                        </button>
                    )}

                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors min-h-[40px] flex items-center gap-2 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Keluar dari Aplikasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
