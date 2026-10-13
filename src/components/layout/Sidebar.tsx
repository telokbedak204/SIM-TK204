import React from 'react';
import {
  LayoutDashboard,
  ClipboardEdit,
  FileSpreadsheet,
  FileText,
  Building2,
  Users2,
  Archive,
  Settings,
  Info,
  X,
  HardHat,
  ChevronRight,
  Share2,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { UserRole } from '../../types';

export type NavigationTab =
  | 'dashboard'
  | 'daily_input'
  | 'daily_report'
  | 'weekly_report'
  | 'projects'
  | 'job_roles'
  | 'history'
  | 'user_roles'
  | 'settings'
  | 'about';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenShare?: () => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
  currentUserRole: UserRole;
}

interface MenuItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenShare,
  onLogout,
  onOpenLogin,
  currentUserRole,
}) => {
  const allMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Monitoring',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'daily_input',
      label: 'Input Tenaga Kerja',
      icon: <ClipboardEdit className="w-5 h-5" />,
      badge: 'Harian',
    },
    {
      id: 'daily_report',
      label: 'Input Laporan Harian',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Resmi',
    },
    {
      id: 'weekly_report',
      label: 'Laporan Mingguan & Rekap',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      id: 'projects',
      label: 'Master Proyek',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 'job_roles',
      label: 'Master Jabatan & Keahlian',
      icon: <Users2 className="w-5 h-5" />,
    },
    {
      id: 'history',
      label: 'Riwayat & Arsip Laporan',
      icon: <Archive className="w-5 h-5" />,
    },
    {
      id: 'user_roles',
      label: 'Pengaturan Role Pengguna',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Pengaturan Database',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: 'about',
      label: 'Tentang Aplikasi',
      icon: <Info className="w-5 h-5" />,
    },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (currentUserRole !== 'admin' && (item.id === 'user_roles' || item.id === 'settings')) {
      return false;
    }
    return true;
  });

  const handleNav = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] sm:max-w-xs bg-[#142B4A] text-slate-100 flex flex-col border-r border-[#1a385f] transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-30 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header inside Mobile Drawer */}
        <div className="flex items-center justify-between px-4 sm:px-5 h-16 border-b border-[#1c3a63] lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#F28C28] flex items-center justify-center text-white border border-orange-400/30">
              <img
                src="/pwa-192x192.png"
                alt="Logo SIM-TK204"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <span className="font-bold text-lg text-white">SIM-TK204</span>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Operasional
          </div>

          {menuItems.slice(0, 3).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-[#F28C28] text-white shadow-md font-semibold'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-[#F28C28]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-[#F28C28]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Administrasi & Master
          </div>

          {menuItems.slice(3, 6).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-[#F28C28] text-white shadow-md font-semibold'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Sistem & Bantuan
          </div>

          {menuItems.slice(6).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-[#F28C28] text-white shadow-md font-semibold'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* PWA & Share Actions Card */}
        <div className="px-3 pt-2 space-y-2">
          <PWAInstallButton variant="sidebar" />


          {/* Keluar dari Aplikasi */}
          {onLogout && (
            <button
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 transition-colors min-h-[40px]"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Keluar dari Aplikasi</span>
              </div>
              <span className="text-[10px] text-rose-400 font-mono">Logout</span>
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-[#1c3a63] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Kontraktor & MK Portal</span>
          <span className="font-mono text-[10px]">2026</span>
        </div>
      </aside>
    </>
  );
};
