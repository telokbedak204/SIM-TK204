import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Project, JobRole, DailyManpower, UserProfile, UserRole, AppNotification } from './types';
import { DataService, DEMO_PROJECT_ID, DEFAULT_USER } from './services/dataService';
import { computeWeeklyMatrix } from './lib/calculations';
import { isSupabaseConfigured, syncSupabaseConfigFromServer } from './lib/supabase';
import { exportWeeklyMonitoringToExcel } from './lib/excelExport';
import { exportWeeklyMonitoringToPDF } from './lib/pdfExport';
import { syncGoogleDriveConfigFromServer } from './lib/googleDriveAuth';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer, ToastMessage } from './components/ui/Notification';
import { ShareAppModal } from './components/pwa/ShareAppModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { NotificationModal } from './components/modals/NotificationModal';
import { LoginModal } from './components/auth/LoginModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { DailyInputPage } from './pages/DailyInputPage';
import { DailyReportPage } from './pages/DailyReportPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import { ProjectPage } from './pages/ProjectPage';
import { JobRolesPage } from './pages/JobRolesPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserRolesPage } from './pages/UserRolesPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyManpower[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DataService.getCurrentUser());
  const effectiveUser: UserProfile = currentUser || DEFAULT_USER;
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);

  // Period: Mulai Kontrak Proyek hingga Tanggal Saat Ini
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [startDateStr, setStartDateStr] = useState<string>('2026-08-28');
  const [endDateStr, setEndDateStr] = useState<string>(getTodayStr());
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(getTodayStr());

  // Authentication & Session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!DataService.isLoggedIn());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(!DataService.isLoggedIn());

  // Notifications & Modals
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  const addToast = useCallback((type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    DataService.markNotificationAsRead(id);
    setNotifications(DataService.getNotifications());
  };

  const handleMarkAllAsRead = () => {
    DataService.markAllNotificationsAsRead();
    setNotifications(DataService.getNotifications());
    addToast('success', 'Semua notifikasi ditandai telah dibaca.');
  };

  const handleDeleteNotification = (id: string) => {
    DataService.deleteNotification(id);
    setNotifications(DataService.getNotifications());
    addToast('info', 'Notifikasi dihapus.');
  };

  const handleAddNotification = (notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => {
    DataService.addNotification(notif);
    setNotifications(DataService.getNotifications());
    addToast('success', 'Pengingat berhasil dibuat.');
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setIsSupabaseOnline(isSupabaseConfigured());
      const allProjects = await DataService.getProjects();
      setProjects(allProjects);

      const active = await DataService.getActiveProject();
      setActiveProject(active);

      if (active) {
        if (active.start_date) {
          setStartDateStr(active.start_date);
        }
        const todayStr = getTodayStr();
        setEndDateStr(todayStr);
        setSelectedDailyDate(todayStr);

        const roles = await DataService.getJobRoles(active.id);
        setJobRoles(roles);

        const records = await DataService.getDailyManpower(active.id);
        setDailyRecords(records);
      }

      const notifs = DataService.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading data:', err);
      addToast('error', 'Gagal memuat data: ' + (err as Error).message);
    }
  }, [addToast]);

  useEffect(() => {
    syncSupabaseConfigFromServer().then((cfg) => {
      if (cfg) {
        setIsSupabaseOnline(isSupabaseConfigured());
      }
    });
    syncGoogleDriveConfigFromServer();
    loadData();
  }, [loadData]);

  // Compute Weekly Matrix whenever records, roles, or date range changes
  const matrixSummary = useMemo(() => {
    return computeWeeklyMatrix(startDateStr, endDateStr, jobRoles, dailyRecords);
  }, [startDateStr, endDateStr, jobRoles, dailyRecords]);

  // Handlers
  const handleSelectProject = async (projectId: string) => {
    DataService.setActiveProject(projectId);
    const prj = projects.find((p) => p.id === projectId);
    if (prj) {
      setActiveProject(prj);
      if (prj.start_date) {
        setStartDateStr(prj.start_date);
      }
      const todayStr = getTodayStr();
      setEndDateStr(todayStr);
      setSelectedDailyDate(todayStr);
      const roles = await DataService.getJobRoles(prj.id);
      setJobRoles(roles);
      const records = await DataService.getDailyManpower(prj.id);
      setDailyRecords(records);
      addToast('info', `Proyek aktif beralih ke: ${prj.name}`);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    // Only admins can change roles, and only in a real auth context.
    // In production this should be a protected server-side action.
    if (effectiveUser.role !== 'admin') {
      addToast('error', 'Akses ditolak: Hanya Administrator yang berhak mengatur role.');
      return;
    }
    DataService.setSimulatedRole(newRole);
    const updated = DataService.getCurrentUser();
    setCurrentUser(updated);
    addToast('info', `Peran pengguna disimulasikan sebagai: ${newRole.toUpperCase()}`);
  };

  const handleLogout = useCallback(() => {
    DataService.logout();
    setIsLoggedIn(false);
    setIsSidebarOpen(false);
    addToast('info', 'Anda telah keluar dari aplikasi.');
  }, [addToast]);

  const handleLoginSuccess = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  }, []);

  const handleDateRangeChange = (start: string, end: string) => {
    if (end < start) {
      addToast('warning', 'Tanggal akhir tidak boleh mendahului tanggal mulai.');
      return;
    }
    setStartDateStr(start);
    setEndDateStr(end);
  };

  const handleSaveBatch = async (
    workDate: string,
    entries: { job_role_id: string; worker_count: number; notes?: string }[]
  ): Promise<boolean> => {
    if (!activeProject) return false;

    const res = await DataService.upsertDailyManpowerBatch(activeProject.id, workDate, entries);
    if (res.success) {
      // Reload daily records for current project
      const updatedRecords = await DataService.getDailyManpower(activeProject.id);
      setDailyRecords(updatedRecords);
      addToast('success', `Berhasil menyimpan catatan tenaga kerja untuk tanggal ${workDate}!`);
      return true;
    } else {
      addToast('error', res.error || 'Gagal menyimpan catatan harian.');
      return false;
    }
  };

  const handleSaveProject = async (projectData: Partial<Project>): Promise<boolean> => {
    try {
      const saved = await DataService.saveProject(projectData);
      await loadData();
      addToast('success', `Proyek "${saved.name}" berhasil disimpan!`);
      return true;
    } catch (err) {
      addToast('error', 'Gagal menyimpan proyek: ' + (err as Error).message);
      return false;
    }
  };

  const handleArchiveProject = async (id: string): Promise<boolean> => {
    try {
      await DataService.archiveProject(id);
      await loadData();
      addToast('info', 'Proyek berhasil diarsipkan.');
      return true;
    } catch (err) {
      addToast('error', 'Gagal mengarsipkan proyek.');
      return false;
    }
  };

  const handleDeleteProject = async (id: string): Promise<boolean> => {
    try {
      await DataService.deleteProject(id);
      await loadData();
      addToast('success', 'Proyek berhasil dihapus.');
      return true;
    } catch (err) {
      addToast('error', 'Gagal menghapus proyek: ' + (err as Error).message);
      return false;
    }
  };

  const handleSaveJobRole = async (roleData: { id?: string; name: string; sort_order: number; is_active: boolean }): Promise<boolean> => {
    if (!activeProject) return false;
    try {
      await DataService.saveJobRole({
        ...roleData,
        project_id: activeProject.id,
      });
      const updatedRoles = await DataService.getJobRoles(activeProject.id);
      setJobRoles(updatedRoles);
      addToast('success', `Jabatan "${roleData.name}" berhasil disimpan!`);
      return true;
    } catch (err) {
      addToast('error', 'Gagal menyimpan jabatan: ' + (err as Error).message);
      return false;
    }
  };

  const handleToggleRoleActive = async (roleId: string, isActive: boolean): Promise<boolean> => {
    try {
      await DataService.toggleJobRoleActive(roleId, isActive);
      if (activeProject) {
        const updatedRoles = await DataService.getJobRoles(activeProject.id);
        setJobRoles(updatedRoles);
      }
      addToast('info', `Status jabatan diubah menjadi: ${isActive ? 'Aktif' : 'Non-Aktif'}`);
      return true;
    } catch (err) {
      addToast('error', 'Gagal mengubah status jabatan.');
      return false;
    }
  };

  const handleExportExcel = (recorder?: string, inspector?: string) => {
    if (!activeProject) return;
    try {
      const fileName = exportWeeklyMonitoringToExcel(
        activeProject,
        matrixSummary,
        startDateStr,
        endDateStr,
        recorder,
        inspector
      );
      addToast('success', `Laporan Excel berhasil diunduh: ${fileName}`, 'Unduh Excel Berhasil');
    } catch (err) {
      addToast('error', 'Gagal mengekspor Excel: ' + (err as Error).message);
    }
  };

  const handleExportPDF = (recorder?: string, inspector?: string) => {
    if (!activeProject) return;
    try {
      const fileName = exportWeeklyMonitoringToPDF(
        activeProject,
        matrixSummary,
        startDateStr,
        endDateStr,
        recorder,
        inspector
      );
      addToast('success', `Laporan PDF berhasil dibuat: ${fileName}`, 'Unduh PDF Berhasil');
    } catch (err) {
      addToast('error', 'Gagal membuat berkas PDF: ' + (err as Error).message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 sm:p-4">
        <LoginModal
          isOpen={true}
          isFullPage={true}
          onLoginSuccess={handleLoginSuccess}
          addToast={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeProject={activeProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        isSupabaseOnline={isSupabaseOnline}
        currentUser={effectiveUser}
        onRoleChange={handleRoleChange}
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenShare={() => setIsShareModalOpen(true)}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex overflow-hidden w-full min-w-0">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenShare={() => setIsShareModalOpen(true)}
          onLogout={handleLogout}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          currentUserRole={effectiveUser.role}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-5 lg:p-8 pb-24 sm:pb-24 lg:pb-8 min-w-0 w-full">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {/* Tab Routing */}
            {currentTab === 'dashboard' && activeProject && (
              <DashboardPage
                project={activeProject}
                jobRoles={jobRoles}
                dailyRecords={dailyRecords}
                summary={matrixSummary}
                selectedDate={selectedDailyDate}
                startDateStr={startDateStr}
                endDateStr={endDateStr}
                onSelectDate={(d) => setSelectedDailyDate(d)}
                onDateRangeChange={handleDateRangeChange}
                onNavigateToInput={() => setCurrentTab('daily_input')}
                onNavigateToReport={() => setCurrentTab('weekly_report')}
                onExportExcel={() => handleExportExcel()}
                onExportPDF={() => handleExportPDF()}
              />
            )}

            {currentTab === 'daily_input' && activeProject && (
              <DailyInputPage
                project={activeProject}
                jobRoles={jobRoles}
                dailyRecords={dailyRecords}
                selectedDate={selectedDailyDate}
                currentUser={effectiveUser}
                onDateChange={(d) => setSelectedDailyDate(d)}
                onSaveBatch={handleSaveBatch}
              />
            )}

            {currentTab === 'daily_report' && activeProject && (
              <DailyReportPage
                project={activeProject}
                jobRoles={jobRoles}
                dailyRecords={dailyRecords}
                selectedDate={selectedDailyDate}
                onDateChange={(d) => setSelectedDailyDate(d)}
                addToast={addToast}
                currentUser={effectiveUser}
              />
            )}

            {currentTab === 'weekly_report' && activeProject && (
              <WeeklyReportPage
                project={activeProject}
                summary={matrixSummary}
                startDateStr={startDateStr}
                endDateStr={endDateStr}
                onDateRangeChange={handleDateRangeChange}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
              />
            )}

            {currentTab === 'projects' && (
              <ProjectPage
                projects={projects}
                activeProjectId={activeProject?.id || ''}
                onSelectProject={handleSelectProject}
                onSaveProject={handleSaveProject}
                onArchiveProject={handleArchiveProject}
                onDeleteProject={handleDeleteProject}
                currentUser={effectiveUser}
              />
            )}

            {currentTab === 'job_roles' && activeProject && (
              <JobRolesPage
                project={activeProject}
                jobRoles={jobRoles}
                onSaveRole={handleSaveJobRole}
                onToggleRoleActive={handleToggleRoleActive}
                currentUser={effectiveUser}
              />
            )}

            {currentTab === 'history' && activeProject && (
              <HistoryPage
                projects={projects}
                activeProject={activeProject}
                onSelectProject={handleSelectProject}
                onOpenReport={(start, end) => {
                  setStartDateStr(start);
                  setEndDateStr(end);
                  setCurrentTab('weekly_report');
                }}
                allDailyRecords={dailyRecords}
                allRoles={jobRoles}
                addToast={addToast}
              />
            )}

            {!activeProject && ['dashboard', 'daily_input', 'daily_report', 'weekly_report', 'job_roles', 'history'].includes(currentTab) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-orange-50 text-[#F28C28] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                  📁
                </div>
                <h3 className="text-lg font-bold text-slate-800">Belum Ada Proyek Aktif / Data Kosong</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seluruh data telah dikosongkan. Silakan buat proyek baru atau pilih proyek untuk mulai memasukkan data harian dan laporan konstruksi Anda.
                </p>
                <button
                  onClick={() => setCurrentTab('projects')}
                  className="px-5 py-2.5 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Kelola / Buat Proyek Baru
                </button>
              </div>
            )}

            {currentTab === 'user_roles' && (
              <UserRolesPage
                currentUser={effectiveUser}
                onRoleChange={handleRoleChange}
                addToast={addToast}
                onUpdateCurrentUser={(updated) => {
                  DataService.setCurrentUser(updated);
                  setCurrentUser(updated);
                }}
                onLogout={handleLogout}
                onOpenLogin={() => setIsLoginModalOpen(true)}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                currentUser={effectiveUser}
                onRefreshData={loadData}
                onNavigateToProjects={() => setCurrentTab('projects')}
                onNavigateToUserRoles={() => setCurrentTab('user_roles')}
                addToast={addToast}
              />
            )}

            {currentTab === 'about' && (
              <AboutPage onOpenShare={() => setIsShareModalOpen(true)} />
            )}
          </div>
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Share App Link & Social Preview Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={(type, msg) => addToast(type, msg)}
      />

      {/* Notification & Reminder Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
        onAddNotification={handleAddNotification}
        addToast={addToast}
      />

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator />

      {/* Modal Masuk / Ganti Akun */}
      <LoginModal
        isOpen={isLoginModalOpen}
        isFullPage={true}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        addToast={addToast}
      />

      {/* Mobile Bottom Navigation Bar (Phone Screens) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}
