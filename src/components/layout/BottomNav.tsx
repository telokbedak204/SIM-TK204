import React from 'react';
import {
  LayoutDashboard,
  ClipboardEdit,
  FileSpreadsheet,
  Building2,
  Menu,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  // Tabs that are directly on the bottom bar
  const isMenuTabActive = [
    'job_roles',
    'history',
    'settings',
    'about',
  ].includes(currentTab);

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Beranda',
      icon: LayoutDashboard,
    },
    {
      id: 'daily_input' as NavigationTab,
      label: 'Input TK',
      icon: ClipboardEdit,
      isHighlighted: true,
    },
    {
      id: 'weekly_report' as NavigationTab,
      label: 'Laporan',
      icon: FileSpreadsheet,
    },
    {
      id: 'projects' as NavigationTab,
      label: 'Proyek',
      icon: Building2,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Ponsel"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#142B4A]/95 backdrop-blur-md border-t border-[#1f3f6b] shadow-2xl transition-all duration-200 pb-[max(env(safe-area-inset-bottom),0.35rem)]"
    >
      <div className="grid grid-cols-5 items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          if (item.isHighlighted) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center -mt-3.5 group relative focus:outline-hidden"
                aria-label={item.label}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                    isActive
                      ? 'bg-[#F26A1B] text-white shadow-[#F26A1B]/40 ring-4 ring-[#142B4A]'
                      : 'bg-[#1b375d] text-amber-300 border-2 border-amber-500/50 hover:bg-[#234574] ring-2 ring-[#142B4A]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] font-semibold mt-0.5 tracking-tight ${
                    isActive ? 'text-[#F26A1B] font-bold' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors duration-150 focus:outline-hidden relative ${
                isActive
                  ? 'text-[#F26A1B]'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
              aria-label={item.label}
            >
              {isActive && (
                <span className="absolute top-0 w-7 h-0.5 bg-[#F26A1B] rounded-full shadow-[0_0_8px_#F26A1B]" />
              )}
              <Icon
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] mt-1 tracking-tight truncate max-w-full ${
                  isActive ? 'font-bold text-white' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Menu / Drawer Toggle */}
        <button
          onClick={onToggleSidebar}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors duration-150 focus:outline-hidden relative ${
            isMenuTabActive || isSidebarOpen
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200 active:scale-95'
          }`}
          aria-label="Buka Menu Lengkap"
        >
          {(isMenuTabActive || isSidebarOpen) && (
            <span className="absolute top-0 w-7 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]" />
          )}
          <div className="relative">
            <Menu
              className={`w-5 h-5 transition-transform duration-150 ${
                isMenuTabActive || isSidebarOpen
                  ? 'scale-110 stroke-[2.3]'
                  : 'stroke-[1.8]'
              }`}
            />
            {isMenuTabActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#142B4A]" />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 tracking-tight truncate max-w-full ${
              isMenuTabActive || isSidebarOpen
                ? 'font-bold text-white'
                : 'font-medium'
            }`}
          >
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
