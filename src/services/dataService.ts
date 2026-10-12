import { Project, JobRole, DailyManpower, UserProfile, UserRole, DailyReportNarrative, AppNotification, DriveDocumentationPhoto, GoogleIntegrationSettings } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { generateUUID } from '../lib/uuid';

// Local storage keys for offline caching and demo persistence
const KEY_PROJECTS = 'sim_tk204_projects';
const KEY_ROLES = 'sim_tk204_roles';
const KEY_MANPOWER = 'sim_tk204_manpower';
const KEY_DAILY_REPORTS = 'sim_tk204_daily_reports';
const KEY_ACTIVE_PROJECT = 'sim_tk204_active_project_id';
const KEY_CURRENT_USER = 'sim_tk204_current_user';
const KEY_DEMO_LOADED = 'sim_tk204_demo_loaded';
const KEY_NOTIFICATIONS = 'sim_tk204_notifications';
const KEY_DRIVE_PHOTOS = 'sim_tk204_drive_photos';
const KEY_GOOGLE_SETTINGS = 'sim_tk204_google_settings';

export const DEFAULT_GOOGLE_SETTINGS: GoogleIntegrationSettings = {
  driveFolderName: 'SIM-TK204_Dokumentasi_Proyek',
  autoCompressPhotos: true,
  photoNamingPrefix: 'DOK',
  sheetsIncludeProjectHeader: true,
  sheetsIncludeSummaryRow: true,
  sheetsNumberFormatId: true,
  autoOpenSpreadsheetAfterExport: true,
  allowedEmail: '',
};

// Standard RFC4122 UUID matching Supabase seed
export const DEMO_PROJECT_ID = '00000000-0000-0000-0000-000000000204';

export const DEFAULT_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000099',
  full_name: 'Ir. Hendra Wijaya, MT',
  email: 'hendra.pm@simtk204.id',
  role: 'admin',
  company: 'PT. Bahtera Karya Anambas',
  phone: '0812-3456-7890',
};

export const INITIAL_DEMO_PROJECT: Project = {
  id: DEMO_PROJECT_ID,
  code: 'PRJ-2026-ANB-04',
  name: 'Manajemen Konstruksi Lanjutan Renovasi Pasar Loka Kab. Kep. Anambas',
  owner_name: 'Pemerintah Kabupaten Kepulauan Anambas / Disperindag',
  contractor_name: 'PT. Teknik Eksakta',
  consultant_name: 'PT. Arcansia Dwitama Konsultan KSO PT. Teknik Eksakta',
  location: 'Kab. Kep. Anambas',
  start_date: '2026-08-28',
  end_date: '2026-12-31',
  project_manager: 'Ir. Hendra Wijaya, MT',
  site_manager: 'Rian Pratama, ST',
  recorder_name: 'Ahmad Faisal (Site Admin)',
  inspector_name: 'Dedi Kurniawan, ST (Inspector MK)',
  status: 'active',
  created_at: '2026-08-28T08:00:00.000Z',
  updated_at: '2026-10-11T08:00:00.000Z',
};

export const INITIAL_DEMO_ROLES: JobRole[] = [
  { id: '00000000-0000-0000-0000-000000000001', project_id: DEMO_PROJECT_ID, name: 'Project Manager', sort_order: 1, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: '00000000-0000-0000-0000-000000000002', project_id: DEMO_PROJECT_ID, name: 'Mandor', sort_order: 2, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: '00000000-0000-0000-0000-000000000003', project_id: DEMO_PROJECT_ID, name: 'Kepala Tukang', sort_order: 3, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: '00000000-0000-0000-0000-000000000004', project_id: DEMO_PROJECT_ID, name: 'Surveyor', sort_order: 4, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: '00000000-0000-0000-0000-000000000005', project_id: DEMO_PROJECT_ID, name: 'Pekerja', sort_order: 5, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: '00000000-0000-0000-0000-000000000006', project_id: DEMO_PROJECT_ID, name: 'Tenaga Sondir', sort_order: 6, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: '00000000-0000-0000-0000-000000000007', project_id: DEMO_PROJECT_ID, name: 'Drafter', sort_order: 7, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
  { id: '00000000-0000-0000-0000-000000000008', project_id: DEMO_PROJECT_ID, name: 'HSE Koordinator', sort_order: 8, is_active: true, created_at: '2026-10-01', updated_at: '2026-10-01' },
];

/**
 * Generate standard demo daily records:
 * Periode: 2–8 Oktober 2026 & 11 Oktober 2026 (Pasar Loka Anambas)
 */
export function generateDemoRecords(): DailyManpower[] {
  const dates = [
    '2026-10-02',
    '2026-10-03',
    '2026-10-04',
    '2026-10-05',
    '2026-10-06',
    '2026-10-07',
    '2026-10-08',
    '2026-10-11',
  ];
  const pekerjaDaily = [11, 11, 8, 8, 8, 8, 8, 0];

  const records: DailyManpower[] = [];

  dates.forEach((dateStr, idx) => {
    const isOct11 = dateStr === '2026-10-11';
    records.push(
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000001', // PM
        work_date: dateStr,
        worker_count: isOct11 ? 1 : 1,
        notes: isOct11 ? 'Rencana M6: 1,755% | Realisasi M6: 3,483% | Deviasi: +1,728%' : 'Koordinasi umum dan site inspection',
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      },
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000002', // Mandor
        work_date: dateStr,
        worker_count: isOct11 ? 0 : 1,
        notes: isOct11 ? 'Mandor = 0 orang' : 'Pengawasan pekerjaan pembesian dan bekisting',
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      },
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000003', // KTukang
        work_date: dateStr,
        worker_count: 0,
        notes: 'Off / Belum mobilisasi',
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      },
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000004', // Surveyor
        work_date: dateStr,
        worker_count: isOct11 ? 1 : 1,
        notes: isOct11 ? 'Surveyor = 1 orang' : 'Pengukuran elevasi lantai dasar & as kolom',
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      },
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000005', // Pekerja
        work_date: dateStr,
        worker_count: pekerjaDaily[idx],
        notes: isOct11 ? 'Pekerja = 0 orang' : (idx < 2 ? 'Pekerjaan pengecoran & pembersihan lahan (11 org)' : 'Pekerjaan galian & pembesian struktur (8 org)'),
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      },
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000006', // Sondir
        work_date: dateStr,
        worker_count: 0,
        notes: 'Pengujian tanah telah selesai',
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      },
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000007', // Drafter
        work_date: dateStr,
        worker_count: 0,
        notes: 'Shop drawing selesai',
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      },
      {
        id: generateUUID(),
        project_id: DEMO_PROJECT_ID,
        job_role_id: '00000000-0000-0000-0000-000000000008', // HSE
        work_date: dateStr,
        worker_count: isOct11 ? 1 : 2,
        notes: isOct11 ? 'HSE = 1 orang | Cuaca: Jam 08:00 - 17.00 Cerah | Kendala: Material utama belum ada | Saran: Di tambah dudukan alas pijakan, agar pekerja lebih aman; Lakukan mapping pekerjaan' : 'Toolbox meeting & pengawasan APD',
        created_at: `${dateStr}T17:00:00.000Z`,
        updated_at: `${dateStr}T17:00:00.000Z`,
      }
    );
  });

  return records;
}

// ==========================================
// DATA SERVICE REPOSITORY
// ==========================================
export class DataService {
  // Current user state
  static getCurrentUser(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_USER;
    const raw = localStorage.getItem(KEY_CURRENT_USER);
    if (!raw) {
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  }

  static setCurrentUser(user: UserProfile) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
    }
  }

  static getSystemUsers(): { id: string; name: string; email: string; role: UserRole; company: string; password?: string; is_active: boolean }[] {
    const KEY_SYSTEM_USERS = 'sim_tk204_system_users';
    const INITIAL_USERS = [
      { id: 'usr-1', name: 'Ir. Hendra Wijaya, MT', email: 'hendra.pm@simtk204.id', role: 'admin' as UserRole, company: 'PT. Bahtera Karya Anambas', password: 'adminpassword123', is_active: true },
      { id: 'usr-2', name: 'Rian Pratama, ST', email: 'rian.site@simtk204.id', role: 'project_manager' as UserRole, company: 'PT. Teknik Eksakta', password: 'password123', is_active: true },
      { id: 'usr-3', name: 'Ahmad Faisal', email: 'faisal.admin@simtk204.id', role: 'editor' as UserRole, company: 'PT. Teknik Eksakta', password: 'password123', is_active: true },
      { id: 'usr-4', name: 'Dedi Kurniawan, ST', email: 'dedi.mk@simtk204.id', role: 'viewer' as UserRole, company: 'PT. Arcansia Dwitama Konsultan', password: 'password123', is_active: true },
    ];
    if (typeof window === 'undefined') return INITIAL_USERS;
    try {
      const raw = localStorage.getItem(KEY_SYSTEM_USERS);
      return raw ? JSON.parse(raw) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static authenticate(identifier: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const users = this.getSystemUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.name.toLowerCase() === cleanId
    );

    if (!matched) {
      return { success: false, error: 'Nama user atau email tidak ditemukan. Pastikan email terdaftar.' };
    }

    if (matched.password && matched.password !== cleanPass) {
      return { success: false, error: 'Password login salah. Silakan coba lagi atau hubungi Administrator.' };
    }

    const profile: UserProfile = {
      id: matched.id,
      email: matched.email,
      full_name: matched.name,
      role: matched.role,
      company: matched.company,
    };

    this.setCurrentUser(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sim_tk204_is_logged_in', 'true');
    }
    return { success: true, user: profile };
  }

  static logout() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sim_tk204_is_logged_in', 'false');
    }
  }

  static isLoggedIn(): boolean {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem('sim_tk204_is_logged_in');
    return val !== 'false';
  }

  static setSimulatedRole(role: UserRole) {
    const cur = this.getCurrentUser();
    this.setCurrentUser({ ...cur, role });
  }

  /**
   * Sync active Supabase Auth user session if connected
   */
  static async syncSupabaseAuthUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const client = getSupabase();
    if (!client) return null;

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const user: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        role: (profile?.role as UserRole) || 'editor',
        company: profile?.company,
        phone: profile?.phone,
      };

      this.setCurrentUser(user);
      return user;
    } catch (err) {
      console.warn('Error syncing Supabase user:', err);
      return null;
    }
  }

  static async signInWithSupabase(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Kredensial Supabase belum dikonfigurasi di Pengaturan.' };
    }
    const client = getSupabase();
    if (!client) {
      return { success: false, error: 'Gagal membuat koneksi Supabase client.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: `Login gagal: ${error.message}` };
      }
      if (!data.user) {
        return { success: false, error: 'Pengguna tidak ditemukan.' };
      }

      // Fetch profile
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        role: (profile?.role as UserRole) || 'editor',
        company: profile?.company,
        phone: profile?.phone,
      };

      this.setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  static async signUpWithSupabase(
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Kredensial Supabase belum dikonfigurasi di Pengaturan.' };
    }
    const client = getSupabase();
    if (!client) {
      return { success: false, error: 'Gagal membuat koneksi Supabase client.' };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        return { success: false, error: `Registrasi gagal: ${error.message}` };
      }
      if (!data.user) {
        return { success: false, error: 'Pendaftaran selesai tanpa user record.' };
      }

      // Upsert profile
      await client.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const user: UserProfile = {
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      };

      this.setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Sync all local data (projects, roles, daily manpower) to Supabase cloud database
   */
  static async pushLocalDataToSupabase(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase belum dikonfigurasi.' };
    }
    const client = getSupabase();
    if (!client) {
      return { success: false, message: 'Supabase client tidak tersedia.' };
    }

    try {
      const projects: Project[] = JSON.parse(localStorage.getItem(KEY_PROJECTS) || '[]');
      const roles: JobRole[] = JSON.parse(localStorage.getItem(KEY_ROLES) || '[]');
      const manpower: DailyManpower[] = JSON.parse(localStorage.getItem(KEY_MANPOWER) || '[]');

      if (projects.length > 0) {
        const { error: prjErr } = await client.from('projects').upsert(projects);
        if (prjErr) throw new Error(`Tabel projects: ${prjErr.message}`);
      }

      if (roles.length > 0) {
        const { error: roleErr } = await client
          .from('job_roles')
          .upsert(roles, { onConflict: 'project_id,name' });
        if (roleErr) throw new Error(`Tabel job_roles: ${roleErr.message}`);
      }

      if (manpower.length > 0) {
        const { error: mpErr } = await client
          .from('daily_manpower')
          .upsert(manpower, { onConflict: 'project_id,job_role_id,work_date' });
        if (mpErr) throw new Error(`Tabel daily_manpower: ${mpErr.message}`);
      }

      return {
        success: true,
        message: `Sinkronisasi berhasil! ${projects.length} Proyek, ${roles.length} Jabatan, dan ${manpower.length} Catatan Harian berhasil disimpan permanen ke Supabase PostgreSQL.`,
      };
    } catch (err) {
      const errMsg = (err as Error).message;
      return {
        success: false,
        message: errMsg,
      };
    }
  }

  static async signOutUser() {
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        await client.auth.signOut();
      }
    }
    this.setCurrentUser(DEFAULT_USER);
  }

  // Initializer: loads demo data into local store if empty
  static initializeLocalData(forceReset = false) {
    if (typeof window === 'undefined') return;

    const demoLoaded = localStorage.getItem(KEY_DEMO_LOADED);
    if (!demoLoaded || forceReset) {
      const demoPrj = INITIAL_DEMO_PROJECT;
      const demoRoles = INITIAL_DEMO_ROLES;
      const demoRecords = generateDemoRecords();

      let projects: Project[] = [];
      let roles: JobRole[] = [];
      let manpower: DailyManpower[] = [];
      let reports: DailyReportNarrative[] = [];
      if (!forceReset) {
        try {
          projects = JSON.parse(localStorage.getItem(KEY_PROJECTS) || '[]');
          roles = JSON.parse(localStorage.getItem(KEY_ROLES) || '[]');
          manpower = JSON.parse(localStorage.getItem(KEY_MANPOWER) || '[]');
          reports = JSON.parse(localStorage.getItem(KEY_DAILY_REPORTS) || '[]');
        } catch {
          // ignore
        }
      }

      // Add demo project if not present
      if (!projects.some((p) => p.id === demoPrj.id)) {
        projects.unshift(demoPrj);
      }
      // Add demo roles if not present
      for (const r of demoRoles) {
        if (!roles.some((x) => x.id === r.id)) {
          roles.push(r);
        }
      }
      // Add demo manpower records
      for (const m of demoRecords) {
        if (!manpower.some((x) => x.id === m.id)) {
          manpower.push(m);
        }
      }

      // Add demo daily report narratives if not present
      const demoReportsList: DailyReportNarrative[] = [
        {
          project_id: DEMO_PROJECT_ID,
          work_date: '2026-10-11',
          rencana_m6: '1,755%',
          realisasi_m6: '3,483%',
          deviasi_m6: '1,728%',
          pekerjaan: '-',
          peralatan: '',
          kendala: '- material utama belum ada',
          cuaca: '- Jam 08:00 - 17.00 Cerah',
          material_masuk: '- saat ini belum ada material masuk',
          saran: '- Di tambah dudukan alas pijakan, agar pekerja lebih aman\n- lakukan mapping pekerjaan',
          updated_at: '2026-10-11T17:00:00.000Z',
        },
        ...['2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'].map((d) => ({
          project_id: DEMO_PROJECT_ID,
          work_date: d,
          rencana_m6: '1,500%',
          realisasi_m6: '1,500%',
          deviasi_m6: '0,000%',
          pekerjaan: '- Pekerjaan persiapan, pengukuran, dan galian struktur',
          peralatan: '- Excavator, Genset',
          kendala: '- Nihil',
          cuaca: '- Cerah berawan',
          material_masuk: '- Besi beton & kayu bekisting',
          saran: '- Utamakan keselamatan kerja K3',
          updated_at: `${d}T17:00:00.000Z`,
        }))
      ];

      for (const rep of demoReportsList) {
        if (!reports.some((x) => x.project_id === rep.project_id && x.work_date === rep.work_date)) {
          reports.push(rep);
        }
      }

      localStorage.setItem(KEY_PROJECTS, JSON.stringify(projects));
      localStorage.setItem(KEY_ROLES, JSON.stringify(roles));
      localStorage.setItem(KEY_MANPOWER, JSON.stringify(manpower));
      localStorage.setItem(KEY_DAILY_REPORTS, JSON.stringify(reports));
      localStorage.setItem(KEY_ACTIVE_PROJECT, demoPrj.id);
      localStorage.setItem(KEY_DEMO_LOADED, 'true');
    }
  }

  // --- PROJECTS ---
  static async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.warn('Supabase getProjects error:', error.message);
          } else if (data && data.length > 0) {
            // Cache locally for instant loading
            localStorage.setItem(KEY_PROJECTS, JSON.stringify(data));
            return data as Project[];
          }
        } catch (err) {
          console.warn('Supabase getProjects failed, checking local cache:', err);
        }
      }
    }

    this.initializeLocalData();
    try {
      const list = JSON.parse(localStorage.getItem(KEY_PROJECTS) || '[]');
      return list;
    } catch {
      return [INITIAL_DEMO_PROJECT];
    }
  }

  static async getProjectById(id: string): Promise<Project | null> {
    const list = await this.getProjects();
    return list.find((p) => p.id === id) || null;
  }

  static async getActiveProject(): Promise<Project | null> {
    const list = await this.getProjects();
    if (list.length === 0) {
      return null;
    }

    const activeId = typeof window !== 'undefined' ? localStorage.getItem(KEY_ACTIVE_PROJECT) : null;
    const found = list.find((p) => p.id === activeId);
    return found || list[0];
  }

  static setActiveProject(id: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY_ACTIVE_PROJECT, id);
    }
  }

  static async saveProject(project: Partial<Project> & { id?: string }): Promise<Project> {
    const isNew = !project.id;
    // Generate valid RFC4122 UUID for PostgreSQL compatibility
    const id = project.id || generateUUID();
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    const fullProject: Project = {
      id,
      code: project.code?.trim() || `PRJ-${Date.now().toString().slice(-4)}`,
      name: project.name?.trim() || 'Proyek Baru',
      owner_name: project.owner_name?.trim() || '',
      contractor_name: project.contractor_name?.trim() || '',
      consultant_name: project.consultant_name?.trim() || '',
      location: project.location?.trim() || '',
      start_date: project.start_date || '2026-10-01',
      end_date: project.end_date || '2026-12-31',
      project_manager: project.project_manager?.trim() || '',
      site_manager: project.site_manager?.trim() || '',
      recorder_name: project.recorder_name?.trim() || '',
      inspector_name: project.inspector_name?.trim() || '',
      status: project.status || 'active',
      // Ensure created_by is only sent if it is a valid UUID, otherwise let Supabase handle default
      created_by: user.id && user.id.length > 5 ? user.id : undefined,
      created_at: project.created_at || now,
      updated_at: now,
    };
    
    // Remove created_by if it's undefined to let Supabase use its default column value (often auth.uid())
    if (!fullProject.created_by) {
      delete fullProject.created_by;
    }

    // Save to Supabase if online
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        const { error } = await client.from('projects').upsert([fullProject], { onConflict: 'code' });
        if (error) {
          throw new Error(`Gagal menyimpan ke database Supabase: ${error.message}`);
        }
        // Seed default 8 roles in Supabase if new project
        if (isNew) {
          await this.seedDefaultRolesForProject(id);
        }
      }
    }

    // Local storage persistence
    const list = await this.getProjects();
    const existingIdx = list.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      list[existingIdx] = fullProject;
    } else {
      list.unshift(fullProject);
      if (!isSupabaseConfigured()) {
        await this.seedDefaultRolesForProject(id);
      }
    }
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(list));
    this.setActiveProject(id);

    return fullProject;
  }

  static async archiveProject(id: string): Promise<boolean> {
    const prj = await this.getProjectById(id);
    if (!prj) return false;
    await this.saveProject({ ...prj, status: 'archived' });
    return true;
  }

  // --- JOB ROLES ---
  static async getJobRoles(projectId: string): Promise<JobRole[]> {
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        try {
          const { data, error } = await client
            .from('job_roles')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true });

          if (!error && data && data.length > 0) {
            return data as JobRole[];
          }
        } catch (err) {
          console.warn('Supabase getJobRoles error:', err);
        }
      }
    }

    this.initializeLocalData();
    try {
      const roles: JobRole[] = JSON.parse(localStorage.getItem(KEY_ROLES) || '[]');
      const filtered = roles.filter((r) => r.project_id === projectId);
      if (filtered.length === 0 && projectId === DEMO_PROJECT_ID) {
        return INITIAL_DEMO_ROLES;
      }
      return filtered.sort((a, b) => a.sort_order - b.sort_order);
    } catch {
      return [];
    }
  }

  static async seedDefaultRolesForProject(projectId: string): Promise<JobRole[]> {
    const defaultRoleNames = [
      'Project Manager',
      'Mandor',
      'Kepala Tukang',
      'Surveyor',
      'Pekerja',
      'Tenaga Sondir',
      'Drafter',
      'HSE Koordinator',
    ];

    const now = new Date().toISOString();
    const newRoles: JobRole[] = defaultRoleNames.map((name, idx) => ({
      id: generateUUID(),
      project_id: projectId,
      name,
      sort_order: idx + 1,
      is_active: true,
      created_at: now,
      updated_at: now,
    }));

    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        try {
          await client.from('job_roles').upsert(newRoles);
        } catch (e) {
          console.warn('Error seeding Supabase roles:', e);
        }
      }
    }

    const allRoles: JobRole[] = JSON.parse(localStorage.getItem(KEY_ROLES) || '[]');
    const existing = allRoles.filter((r) => r.project_id === projectId);
    if (existing.length === 0) {
      allRoles.push(...newRoles);
      localStorage.setItem(KEY_ROLES, JSON.stringify(allRoles));
      return newRoles;
    }
    return existing;
  }

  static async saveJobRole(role: Partial<JobRole> & { project_id: string; name: string }): Promise<JobRole> {
    const id = role.id || generateUUID();
    const now = new Date().toISOString();

    const fullRole: JobRole = {
      id,
      project_id: role.project_id,
      name: role.name.trim(),
      sort_order: role.sort_order ?? 99,
      is_active: role.is_active !== undefined ? role.is_active : true,
      created_at: role.created_at || now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        const { error } = await client.from('job_roles').upsert([fullRole]);
        if (error) {
          throw new Error(`Gagal menyimpan jabatan ke Supabase: ${error.message}`);
        }
      }
    }

    const allRoles: JobRole[] = JSON.parse(localStorage.getItem(KEY_ROLES) || '[]');
    const idx = allRoles.findIndex((r) => r.id === id);
    if (idx >= 0) {
      allRoles[idx] = fullRole;
    } else {
      allRoles.push(fullRole);
    }
    localStorage.setItem(KEY_ROLES, JSON.stringify(allRoles));
    return fullRole;
  }

  static async toggleJobRoleActive(roleId: string, isActive: boolean): Promise<boolean> {
    const allRoles: JobRole[] = JSON.parse(localStorage.getItem(KEY_ROLES) || '[]');
    const target = allRoles.find((r) => r.id === roleId);
    if (!target) return false;
    target.is_active = isActive;
    target.updated_at = new Date().toISOString();
    return Boolean(await this.saveJobRole(target));
  }

  // --- DAILY MANPOWER MONITORING ---
  /**
   * Strictly query daily manpower for a specific project.
   * Isolates data so projects never cross-contaminate.
   */
  static async getDailyManpower(projectId: string, startDate?: string, endDate?: string): Promise<DailyManpower[]> {
    if (!projectId) return [];

    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        try {
          let query = client
            .from('daily_manpower')
            .select('*')
            .eq('project_id', projectId);

          if (startDate) query = query.gte('work_date', startDate);
          if (endDate) query = query.lte('work_date', endDate);

          const { data, error } = await query.order('work_date', { ascending: true });
          if (error) {
            console.warn('Supabase getDailyManpower error:', error.message);
          } else if (data) {
            return data as DailyManpower[];
          }
        } catch (err) {
          console.warn('Supabase getDailyManpower error, falling back to cache:', err);
        }
      }
    }

    this.initializeLocalData();
    try {
      const list: DailyManpower[] = JSON.parse(localStorage.getItem(KEY_MANPOWER) || '[]');
      return list.filter((item) => {
        if (item.project_id !== projectId) return false;
        if (startDate && item.work_date < startDate) return false;
        if (endDate && item.work_date > endDate) return false;
        return true;
      });
    } catch {
      return [];
    }
  }

  /**
   * Batch upsert daily records for a specific date and project.
   * Ensures idempotency: updates existing entries for (project_id, job_role_id, work_date)
   * rather than duplicating rows.
   */
  static async upsertDailyManpowerBatch(
    projectId: string,
    workDate: string,
    entries: { job_role_id: string; worker_count: number; notes?: string }[]
  ): Promise<{ success: boolean; count: number; error?: string }> {
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    // Check RBAC: viewer is forbidden from saving
    if (user.role === 'viewer') {
      return {
        success: false,
        count: 0,
        error: 'Akses ditolak: Akun Anda memiliki hak akses "Viewer" (Hanya Melihat). Anda tidak diizinkan mengubah data.',
      };
    }

    // Build payload with valid UUIDs
    const payloadList: DailyManpower[] = entries.map((entry) => ({
      id: generateUUID(),
      project_id: projectId,
      job_role_id: entry.job_role_id,
      work_date: workDate,
      worker_count: Math.max(0, Math.floor(entry.worker_count || 0)),
      notes: entry.notes?.trim() || '',
      created_by: user.id && user.id.includes('-') ? user.id : undefined,
      created_at: now,
      updated_at: now,
    }));

    // If Supabase configured, execute real upsert with onConflict clause
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        try {
          const { error } = await client
            .from('daily_manpower')
            .upsert(payloadList, {
              onConflict: 'project_id,job_role_id,work_date',
            });

          if (error) {
            console.error('Supabase upsertDailyManpowerBatch error:', error);
            return {
              success: false,
              count: 0,
              error: `Gagal menyimpan ke database Supabase: ${error.message} (Kode: ${error.code})`,
            };
          }
        } catch (err) {
          console.error('Supabase connection error during batch save:', err);
          return {
            success: false,
            count: 0,
            error: `Koneksi Supabase gagal: ${(err as Error).message}`,
          };
        }
      }
    }

    // Local storage upsert (for offline persistence and fast UI responsiveness)
    const allRecords: DailyManpower[] = JSON.parse(localStorage.getItem(KEY_MANPOWER) || '[]');
    
    for (const item of payloadList) {
      const existingIdx = allRecords.findIndex(
        (r) => r.project_id === projectId && r.job_role_id === item.job_role_id && r.work_date === workDate
      );
      if (existingIdx >= 0) {
        allRecords[existingIdx] = {
          ...allRecords[existingIdx],
          worker_count: item.worker_count,
          notes: item.notes,
          updated_at: now,
        };
      } else {
        allRecords.push(item);
      }
    }

    localStorage.setItem(KEY_MANPOWER, JSON.stringify(allRecords));
    return { success: true, count: payloadList.length };
  }

  /**
   * Reset local database back to default demo state
   */
  static resetToDemoData() {
    this.initializeLocalData(true);
  }

  static clearAllData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY_PROJECTS);
    localStorage.removeItem(KEY_ROLES);
    localStorage.removeItem(KEY_MANPOWER);
    localStorage.removeItem(KEY_DAILY_REPORTS);
    localStorage.removeItem(KEY_ACTIVE_PROJECT);
    localStorage.setItem(KEY_DEMO_LOADED, 'true');
  }

  // --- DAILY REPORT NARRATIVES ---
  static getDailyReportNarrative(projectId: string, workDate: string): DailyReportNarrative | null {
    if (typeof window === 'undefined') return null;
    try {
      const all: DailyReportNarrative[] = JSON.parse(localStorage.getItem(KEY_DAILY_REPORTS) || '[]');
      return all.find((r) => r.project_id === projectId && r.work_date === workDate) || null;
    } catch {
      return null;
    }
  }

  static saveDailyReportNarrative(narrative: DailyReportNarrative): void {
    if (typeof window === 'undefined') return;
    try {
      const all: DailyReportNarrative[] = JSON.parse(localStorage.getItem(KEY_DAILY_REPORTS) || '[]');
      const idx = all.findIndex((r) => r.project_id === narrative.project_id && r.work_date === narrative.work_date);
      if (idx >= 0) {
        all[idx] = { ...narrative, updated_at: new Date().toISOString() };
      } else {
        all.push({ ...narrative, updated_at: new Date().toISOString() });
      }
      localStorage.setItem(KEY_DAILY_REPORTS, JSON.stringify(all));
    } catch (err) {
      console.error('Error saving daily report narrative:', err);
    }
  }

  static getAllDailyReportNarratives(projectId: string): DailyReportNarrative[] {
    if (typeof window === 'undefined') return [];
    try {
      const all: DailyReportNarrative[] = JSON.parse(localStorage.getItem(KEY_DAILY_REPORTS) || '[]');
      return all.filter((r) => r.project_id === projectId).sort((a, b) => b.work_date.localeCompare(a.work_date));
    } catch {
      return [];
    }
  }

  // --- NOTIFICATIONS & REMINDERS ---
  static getNotifications(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(KEY_NOTIFICATIONS);
      if (!stored) {
        const defaultNotifs: AppNotification[] = [
          {
            id: generateUUID(),
            title: 'Pengingat Laporan Harian',
            message: 'Jangan lupa untuk melakukan input absensi tenaga kerja dan narasi laporan harian konstruksi hari ini.',
            type: 'reminder',
            date: new Date().toISOString().split('T')[0] + ' 08:30',
            is_read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: generateUUID(),
            title: 'Briefing K3 & Keselamatan',
            message: 'Jadwal rutin Toolbox Meeting / Briefing Keselamatan dan Kesehatan Kerja di lokasi proyek pukul 08:00.',
            type: 'warning',
            date: new Date().toISOString().split('T')[0] + ' 08:00',
            is_read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: generateUUID(),
            title: 'Evaluasi Progres M6',
            message: 'Periksa kesesuaian antara Rencana M6 dan Realisasi M6 serta deviasi pekerjaan.',
            type: 'info',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0] + ' 16:00',
            is_read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ];
        localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(defaultNotifs));
        return defaultNotifs;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveNotifications(notifs: AppNotification[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(notifs));
  }

  static addNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>): AppNotification {
    const all = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: generateUUID(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    this.saveNotifications(all);
    return newNotif;
  }

  static markNotificationAsRead(id: string): void {
    const all = this.getNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.saveNotifications(updated);
  }

  static markAllNotificationsAsRead(): void {
    const all = this.getNotifications();
    const updated = all.map((n) => ({ ...n, is_read: true }));
    this.saveNotifications(updated);
  }

  static deleteNotification(id: string): void {
    const all = this.getNotifications();
    const filtered = all.filter((n) => n.id !== id);
    this.saveNotifications(filtered);
  }

  // --- DRIVE DOCUMENTATION PHOTOS ---
  static getDocumentationPhotos(projectId: string, workDate: string): DriveDocumentationPhoto[] {
    if (typeof window === 'undefined') return [];
    try {
      const all: DriveDocumentationPhoto[] = JSON.parse(localStorage.getItem(KEY_DRIVE_PHOTOS) || '[]');
      return all.filter((p) => p.project_id === projectId && p.work_date === workDate);
    } catch {
      return [];
    }
  }

  static saveDocumentationPhoto(photo: DriveDocumentationPhoto): void {
    if (typeof window === 'undefined') return;
    try {
      const all: DriveDocumentationPhoto[] = JSON.parse(localStorage.getItem(KEY_DRIVE_PHOTOS) || '[]');
      all.unshift(photo);
      localStorage.setItem(KEY_DRIVE_PHOTOS, JSON.stringify(all));
    } catch (err) {
      console.error('Error saving documentation photo:', err);
    }
  }

  static deleteDocumentationPhoto(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const all: DriveDocumentationPhoto[] = JSON.parse(localStorage.getItem(KEY_DRIVE_PHOTOS) || '[]');
      const filtered = all.filter((p) => p.id !== id);
      localStorage.setItem(KEY_DRIVE_PHOTOS, JSON.stringify(filtered));
    } catch (err) {
      console.error('Error deleting documentation photo:', err);
    }
  }

  // --- GOOGLE INTEGRATION SETTINGS ---
  static getGoogleSettings(): GoogleIntegrationSettings {
    if (typeof window === 'undefined') return DEFAULT_GOOGLE_SETTINGS;
    try {
      const stored = localStorage.getItem(KEY_GOOGLE_SETTINGS);
      if (!stored) return DEFAULT_GOOGLE_SETTINGS;
      return { ...DEFAULT_GOOGLE_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_GOOGLE_SETTINGS;
    }
  }

  static saveGoogleSettings(settings: GoogleIntegrationSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY_GOOGLE_SETTINGS, JSON.stringify(settings));
  }
}
