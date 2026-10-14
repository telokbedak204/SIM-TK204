import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

import defaultConfig from './supabaseConfig.json';

const STORAGE_KEY_URL = 'sim_tk204_supabase_url';
const STORAGE_KEY_KEY = 'sim_tk204_supabase_key';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  let localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  let localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  // Auto-migrate from older defunct project URL or empty values
  if (!localUrl || localUrl.includes('nsbaodoisubzhksrzcyq')) {
    localUrl = (defaultConfig as any).url || 'https://kobplnzozlxawiqxykng.supabase.co';
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_URL, localUrl);
  }
  if (!localKey || localUrl.includes('kobplnzozlxawiqxykng')) {
    if (!localKey || localKey.length < 10) {
      localKey = (defaultConfig as any).key || 'sb_publishable_8E4DUqq7tEnBx67jUMdlXQ_sLA5gMRt';
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_KEY, localKey);
    }
  }

  return {
    url: localUrl || envUrl || (defaultConfig as any).url || 'https://kobplnzozlxawiqxykng.supabase.co',
    key: localKey || envKey || (defaultConfig as any).key || 'sb_publishable_8E4DUqq7tEnBx67jUMdlXQ_sLA5gMRt',
  };
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    // Invalidate cached client to force re-instantiation
    cachedClient = null;
    lastUrl = '';
    lastKey = '';

    // Asynchronously notify server so other devices get updated
    fetch('/api/config/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl, key: cleanKey }),
    }).catch((err) => {
      console.warn('Failed to sync Supabase config to server:', err);
    });
  }
}

export async function syncSupabaseConfigFromServer(): Promise<{ url: string; key: string } | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/config/supabase');
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        localStorage.setItem(STORAGE_KEY_URL, data.url.trim());
        if (data.key) {
          localStorage.setItem(STORAGE_KEY_KEY, data.key.trim());
        }
        if (cachedClient && (lastUrl !== data.url || (data.key && lastKey !== data.key))) {
          cachedClient = null;
          lastUrl = '';
          lastKey = '';
        }
        return { url: data.url, key: data.key || '' };
      }
    }
  } catch (err) {
    console.warn('Could not sync Supabase config from server:', err);
  }
  return null;
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    cachedClient = null;
    lastUrl = '';
    lastKey = '';
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
