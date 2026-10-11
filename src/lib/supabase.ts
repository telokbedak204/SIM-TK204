import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'sim_tk204_supabase_url';
const STORAGE_KEY_KEY = 'sim_tk204_supabase_key';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
  };
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  }
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
}

export interface TableDiagnostic {
  tableName: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

export interface DetailedConnectionTest {
  success: boolean;
  message: string;
  authWorking: boolean;
  tables: TableDiagnostic[];
}

export async function testSupabaseConnection(url: string, key: string): Promise<DetailedConnectionTest> {
  const tables: TableDiagnostic[] = [
    { tableName: 'projects', exists: false },
    { tableName: 'job_roles', exists: false },
    { tableName: 'daily_manpower', exists: false },
    { tableName: 'profiles', exists: false },
  ];

  if (!url || !key) {
    return {
      success: false,
      message: 'URL dan Publishable Key wajib diisi.',
      authWorking: false,
      tables,
    };
  }

  try {
    const client = createClient(url, key);

    // 1. Test Auth service reachability
    let authWorking = false;
    try {
      const { data: sessionData, error: sessionErr } = await client.auth.getSession();
      authWorking = !sessionErr;
    } catch {
      authWorking = false;
    }

    // 2. Test each table
    let allTablesExist = true;
    for (const t of tables) {
      try {
        const { count, error } = await client.from(t.tableName).select('*', { count: 'exact', head: true });
        if (error) {
          if (error.message.includes('does not exist') || error.code === '42P01') {
            t.exists = false;
            t.error = 'Tabel belum dibuat (Jalankan migrasi SQL)';
            allTablesExist = false;
          } else {
            // Table might exist but RLS blocked or empty
            t.exists = true;
            t.error = `Respons RLS/DB: ${error.message}`;
          }
        } else {
          t.exists = true;
          t.rowCount = count ?? 0;
        }
      } catch (err) {
        t.exists = false;
        t.error = (err as Error).message;
        allTablesExist = false;
      }
    }

    if (allTablesExist) {
      return {
        success: true,
        message: 'Koneksi ke Supabase PostgreSQL berhasil terverifikasi! Semua 4 tabel terdeteksi dengan baik.',
        authWorking,
        tables,
      };
    } else {
      return {
        success: true,
        message: 'Koneksi ke server Supabase berhasil, namun beberapa tabel belum dibuat. Silakan salin & jalankan berkas migrasi SQL pada Supabase SQL Editor.',
        authWorking,
        tables,
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Koneksi gagal: ${(err as Error).message}`,
      authWorking: false,
      tables,
    };
  }
}
