import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Project, JobRole, DailyManpower, UserProfile, UserRole } from './types';
import { DataService, DEMO_PROJECT_ID } from './services/dataService';
import { computeWeeklyMatrix } from './lib/calculations';
import { isSupabaseConfigured } from './lib/supabase';
import { exportWeeklyMonitoringToExcel } from './lib/excelExport';
import { exportWeeklyMonitoringToPDF } from './lib/pdfExport';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { ToastContainer, ToastMessage } from './components/ui/Notification';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { DailyInputPage } from './pages/DailyInputPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import { ProjectPage } from './pages/ProjectPage';
import { JobRolesPage } from './pages/JobRolesPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyManpower[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DataService.getCurrentUser());
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);

  // Period Filters: Default to Demo Period (2026-10-02 to 2026-10-08)
  const [startDateStr, setStartDateStr] = useState<string>('2026-10-02');
  const [endDateStr, setEndDateStr] = useState<string>('2026-10-08');
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>('2026-10-02');

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setIsSupabaseOnline(isSupabaseConfigured());
      const allProjects = await DataService.getProjects();
      setProjects(allProjects);

      const active = await DataService.getActiveProject();
      setActiveProject(active);

      if (active) {
        const roles = await DataService.getJobRoles(active.id);
        setJobRoles(roles);

        const records = await DataService.getDailyManpower(active.id);
        setDailyRecords(records);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      addToast('error', 'Gagal memuat data: ' + (err as Error).message);
    }
  }, [addToast]);

  useEffect(() => {
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
      const roles = await DataService.getJobRoles(prj.id);
      setJobRoles(roles);
      const records = await DataService.getDailyManpower(prj.id);
      setDailyRecords(records);
      addToast('info', `Proyek aktif beralih ke: ${prj.name}`);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    DataService.setSimulatedRole(newRole);
    const updated = DataService.getCurrentUser();
    setCurrentUser(updated);
    addToast('info', `Peran pengguna disimulasikan sebagai: ${newRole.toUpperCase()}`);
  };

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

  const handleResetDemo = () => {
    DataService.resetToDemoData();
    loadData();
    setStartDateStr('2026-10-02');
    setEndDateStr('2026-10-08');
    setSelectedDailyDate('2026-10-02');
    addToast('success', 'Data standar demo Pasar Loka (97 OH, 13,86 Org/Hari) berhasil dimuat ulang!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeProject={activeProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        isSupabaseOnline={isSupabaseOnline}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex overflow-hidden w-full min-w-0">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLoadDemo={handleResetDemo}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-5 lg:p-8 min-w-0 w-full">
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
                onLoadDemo={handleResetDemo}
              />
            )}

            {currentTab === 'daily_input' && activeProject && (
              <DailyInputPage
                project={activeProject}
                jobRoles={jobRoles}
                dailyRecords={dailyRecords}
                selectedDate={selectedDailyDate}
                currentUser={currentUser}
                onDateChange={(d) => setSelectedDailyDate(d)}
                onSaveBatch={handleSaveBatch}
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
                currentUser={currentUser}
              />
            )}

            {currentTab === 'job_roles' && activeProject && (
              <JobRolesPage
                project={activeProject}
                jobRoles={jobRoles}
                onSaveRole={handleSaveJobRole}
                onToggleRoleActive={handleToggleRoleActive}
                currentUser={currentUser}
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
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                onResetDemo={handleResetDemo}
                onRefreshData={loadData}
              />
            )}

            {currentTab === 'about' && <AboutPage />}
          </div>
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
