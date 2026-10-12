// SIM-TK204: Full PostgreSQL Migration Script for Supabase
export const SIM_TK204_SQL_MIGRATION = `-- ==============================================================================
-- SIM-TK204: Sistem Informasi Monitoring Tenaga Kerja Proyek Konstruksi
-- Database: Supabase PostgreSQL (Auth, Schemas, Constraints, Indexes, Functions, RLS)
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'project_manager', 'editor', 'viewer')),
    company TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    contractor_name TEXT NOT NULL,
    consultant_name TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    project_manager TEXT NOT NULL,
    site_manager TEXT NOT NULL,
    recorder_name TEXT,
    inspector_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'paused')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_project_dates CHECK (end_date >= start_date)
);

-- 3. PROJECT_MEMBERS TABLE (Role Based Access Control per Project)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'project_manager', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_user UNIQUE (project_id, user_id)
);

-- 4. JOB_ROLES TABLE (Master Jabatan & Keahlian)
CREATE TABLE IF NOT EXISTS public.job_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_role_name UNIQUE (project_id, name)
);

-- 5. DAILY_MANPOWER TABLE (Catatan Tenaga Kerja Harian)
CREATE TABLE IF NOT EXISTS public.daily_manpower (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    job_role_id UUID NOT NULL REFERENCES public.job_roles(id) ON DELETE RESTRICT,
    work_date DATE NOT NULL,
    worker_count INTEGER NOT NULL DEFAULT 0 CHECK (worker_count >= 0 AND worker_count <= 9999),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_project_role_date UNIQUE (project_id, job_role_id, work_date)
);

-- 6. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_job_roles_project ON public.job_roles(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_daily_manpower_project_date ON public.daily_manpower(project_id, work_date);
CREATE INDEX IF NOT EXISTS idx_daily_manpower_role ON public.daily_manpower(job_role_id);
CREATE INDEX IF NOT EXISTS idx_project_members_lookup ON public.project_members(project_id, user_id);

-- 7. TRIGGER FUNCTION FOR updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_job_roles_updated_at ON public.job_roles;
CREATE TRIGGER trg_job_roles_updated_at BEFORE UPDATE ON public.job_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_daily_manpower_updated_at ON public.daily_manpower;
CREATE TRIGGER trg_daily_manpower_updated_at BEFORE UPDATE ON public.daily_manpower FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. AUTH TRIGGER: AUTO-CREATE PROFILE ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'editor'),
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. HELPER FUNCTIONS FOR CLEAN, RECURSION-SAFE RLS POLICIES
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_project_access(p_id UUID, min_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    -- Global Admin always has access
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    -- Check membership role in project_members
    RETURN EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = p_id
          AND user_id = auth.uid()
          AND role = ANY(min_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Mendukung autentikasi Supabase Auth serta sinkronisasi data lapangan via Anon/Public Key
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_manpower ENABLE ROW LEVEL SECURITY;

-- A. Profiles Policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
CREATE POLICY "Allow all access to profiles" ON public.profiles
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- B. Project Members Policies
DROP POLICY IF EXISTS "View project members" ON public.project_members;
DROP POLICY IF EXISTS "Manage project members" ON public.project_members;
DROP POLICY IF EXISTS "Allow all access to project_members" ON public.project_members;
CREATE POLICY "Allow all access to project_members" ON public.project_members
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- C. Projects Policies
DROP POLICY IF EXISTS "View assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Create projects" ON public.projects;
DROP POLICY IF EXISTS "Update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;
CREATE POLICY "Allow all access to projects" ON public.projects
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- D. Job Roles Policies
DROP POLICY IF EXISTS "View job roles" ON public.job_roles;
DROP POLICY IF EXISTS "Manage job roles" ON public.job_roles;
DROP POLICY IF EXISTS "Allow all access to job_roles" ON public.job_roles;
CREATE POLICY "Allow all access to job_roles" ON public.job_roles
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- E. Daily Manpower Policies
DROP POLICY IF EXISTS "View daily manpower" ON public.daily_manpower;
DROP POLICY IF EXISTS "Insert or update daily manpower" ON public.daily_manpower;
DROP POLICY IF EXISTS "Allow all access to daily_manpower" ON public.daily_manpower;
CREATE POLICY "Allow all access to daily_manpower" ON public.daily_manpower
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 11. INITIAL SEED (Demo Project & Standard 8 Roles)
INSERT INTO public.projects (
    id, code, name, owner_name, contractor_name, consultant_name,
    location, start_date, end_date, project_manager, site_manager,
    recorder_name, inspector_name, status
) VALUES (
    '00000000-0000-0000-0000-000000000204',
    'PRJ-2026-ANB-04',
    'Lanjutan Renovasi Pasar Loka – Kepulauan Anambas',
    'Pemerintah Kabupaten Kepulauan Anambas / Disperindag',
    'PT. Bahtera Karya Anambas',
    'PT. Rekayasa Multi Konsultan MK',
    'Tarempa Barat, Kec. Siantan, Kab. Kepulauan Anambas',
    '2026-10-01',
    '2026-12-31',
    'Ir. Hendra Wijaya, MT',
    'Rian Pratama, ST',
    'Ahmad Faisal (Site Admin)',
    'Dedi Kurniawan, ST (Inspector MK)',
    'active'
) ON CONFLICT (code) DO NOTHING;

-- Insert standard 8 job roles for the demo project
INSERT INTO public.job_roles (project_id, name, sort_order, is_active)
SELECT '00000000-0000-0000-0000-000000000204', role_name, ord, true
FROM (VALUES
    ('Project Manager', 1),
    ('Mandor', 2),
    ('Kepala Tukang', 3),
    ('Surveyor', 4),
    ('Pekerja', 5),
    ('Tenaga Sondir', 6),
    ('Drafter', 7),
    ('HSE Koordinator', 8)
) AS t(role_name, ord)
ON CONFLICT (project_id, name) DO NOTHING;
`;

// Script perbaikan instan untuk database yang mengalami galat:
// "new row violates row-level security policy for table 'projects'"
export const SIM_TK204_RLS_FIX_SQL = `-- ==============================================================================
-- SIM-TK204: SKRIP PERBAIKAN ROW-LEVEL SECURITY (RLS) SUPABASE
-- Salin dan jalankan seluruh teks ini di: Supabase Dashboard > SQL Editor > Run
-- ==============================================================================

-- 1. Berikan izin akses penuh ke tabel projects (mengatasi galat RLS pada tabel projects)
DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;
DROP POLICY IF EXISTS "View assigned projects" ON public.projects;
DROP POLICY IF EXISTS "Create projects" ON public.projects;
DROP POLICY IF EXISTS "Update projects" ON public.projects;
CREATE POLICY "Allow all access to projects" ON public.projects
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Berikan izin akses penuh ke tabel job_roles
DROP POLICY IF EXISTS "Allow all access to job_roles" ON public.job_roles;
DROP POLICY IF EXISTS "View job roles" ON public.job_roles;
DROP POLICY IF EXISTS "Manage job roles" ON public.job_roles;
CREATE POLICY "Allow all access to job_roles" ON public.job_roles
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Berikan izin akses penuh ke tabel daily_manpower
DROP POLICY IF EXISTS "Allow all access to daily_manpower" ON public.daily_manpower;
DROP POLICY IF EXISTS "View daily manpower" ON public.daily_manpower;
DROP POLICY IF EXISTS "Insert or update daily manpower" ON public.daily_manpower;
CREATE POLICY "Allow all access to daily_manpower" ON public.daily_manpower
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Berikan izin akses penuh ke tabel project_members
DROP POLICY IF EXISTS "Allow all access to project_members" ON public.project_members;
DROP POLICY IF EXISTS "View project members" ON public.project_members;
DROP POLICY IF EXISTS "Manage project members" ON public.project_members;
CREATE POLICY "Allow all access to project_members" ON public.project_members
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Berikan izin akses penuh ke tabel profiles
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Allow all access to profiles" ON public.profiles
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;

