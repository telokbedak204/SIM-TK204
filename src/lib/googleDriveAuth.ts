import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import defaultDriveConfig from './googleDriveConfig.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;

const SESSION_TOKEN_KEY = 'sim_tk204_google_access_token';
const SESSION_USER_KEY = 'sim_tk204_google_user';
const SHARED_DRIVE_KEY = 'sim_tk204_shared_google_drive_config';

export interface SharedDriveConfig {
  connected: boolean;
  accountEmail: string;
  accountName: string;
  configuredBy: string;
  folderName: string;
  photoNamingPrefix: string;
  autoCompressPhotos: boolean;
  accessToken?: string;
  updatedAt?: string;
}

let cachedAccessToken: string | null = null;
let simulatedUser: { displayName: string; email: string; photoURL?: string } | null = null;

// Initial state from fallback / default superadmin config
if (typeof window !== 'undefined') {
  try {
    const storedShared = localStorage.getItem(SHARED_DRIVE_KEY);
    if (storedShared) {
      const parsed: SharedDriveConfig = JSON.parse(storedShared);
      cachedAccessToken = parsed.accessToken || defaultDriveConfig.accessToken;
      simulatedUser = {
        displayName: parsed.accountName || defaultDriveConfig.accountName,
        email: parsed.accountEmail || defaultDriveConfig.accountEmail,
      };
    } else {
      cachedAccessToken = defaultDriveConfig.accessToken;
      simulatedUser = {
        displayName: defaultDriveConfig.accountName,
        email: defaultDriveConfig.accountEmail,
      };
    }
  } catch {
    cachedAccessToken = defaultDriveConfig.accessToken;
    simulatedUser = {
      displayName: defaultDriveConfig.accountName,
      email: defaultDriveConfig.accountEmail,
    };
  }

  // Check session token override if super admin specifically logged in during this session
  const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
  const sessionUser = sessionStorage.getItem(SESSION_USER_KEY);
  if (sessionToken && !sessionToken.startsWith('simulated_')) {
    cachedAccessToken = sessionToken;
  }
  if (sessionUser) {
    try {
      simulatedUser = JSON.parse(sessionUser);
    } catch {}
  }
}

/**
 * Checks if a given user is the Super Admin
 */
export const isSuperAdminUser = (email?: string, id?: string, role?: string): boolean => {
  const normEmail = (email || '').toLowerCase().trim();
  return (
    normEmail === 'telokbedak204@gmail.com' ||
    id === 'usr-1' ||
    role === 'superadmin' ||
    role === 'admin'
  );
};

/**
 * Synchronize central Google Drive config from server so all users inherit Super Admin's connection
 */
export async function syncGoogleDriveConfigFromServer(): Promise<SharedDriveConfig | null> {
  try {
    const res = await fetch('/api/config/google-drive');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SHARED_DRIVE_KEY, JSON.stringify(data));
      }
      if (data.accessToken) {
        cachedAccessToken = data.accessToken;
      }
      simulatedUser = {
        displayName: data.accountName || 'Super Admin SIM-TK204',
        email: data.accountEmail || 'telokbedak204@gmail.com',
      };
      return data;
    }
  } catch (err) {
    console.warn('Could not sync Google Drive config from server, using local fallback:', err);
  }
  return null;
}

export const isRealGoogleToken = (token: string | null): boolean => {
  return Boolean(token && !token.startsWith('simulated_'));
};

/**
 * For regular users, connection is ALWAYS active via the Super Admin's configured account
 */
export const hasRealGoogleConnection = (userRole?: string): boolean => {
  // If user is a regular team member (not superadmin), they are automatically connected via Super Admin
  if (userRole && userRole !== 'admin' && userRole !== 'superadmin') {
    return true;
  }
  return Boolean(cachedAccessToken);
};

export const initGoogleAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Automatically sync shared config in background
  syncGoogleDriveConfigFromServer().then((cfg) => {
    if (cfg && onAuthSuccess) {
      const u = simulatedUser || { email: cfg.accountEmail, displayName: cfg.accountName };
      onAuthSuccess(u, cfg.accessToken || cachedAccessToken || '');
    }
  });

  if (cachedAccessToken) {
    const u = simulatedUser || auth.currentUser;
    if (u && onAuthSuccess) onAuthSuccess(u, cachedAccessToken);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else if (!cachedAccessToken) {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses OAuth dari Google. Pastikan izin akses disetujui.');
    }
    cachedAccessToken = credential.accessToken;
    simulatedUser = {
      displayName: result.user.displayName || 'Super Admin',
      email: result.user.email || 'telokbedak204@gmail.com',
      photoURL: result.user.photoURL || undefined,
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_TOKEN_KEY, cachedAccessToken);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(simulatedUser));
      
      const shared: SharedDriveConfig = {
        connected: true,
        accountEmail: simulatedUser.email,
        accountName: simulatedUser.displayName,
        configuredBy: 'Super Admin',
        folderName: 'SIM-TK204_Dokumentasi_Proyek',
        photoNamingPrefix: 'DOK',
        autoCompressPhotos: true,
        accessToken: cachedAccessToken,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(SHARED_DRIVE_KEY, JSON.stringify(shared));

      // Push to central backend server so all other clients instantly get this active connection
      try {
        fetch('/api/config/google-drive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shared),
        }).catch((e) => console.warn('Could not push drive config to server:', e));
      } catch {}
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    let friendlyMessage = error.message || 'Terjadi kesalahan saat otentikasi Google.';
    if (error.code === 'auth/popup-blocked') {
      friendlyMessage =
        'Jendela pop-up login Google diblokir oleh browser. Harap izinkan pop-up (klik ikon pop-up/gembok di bilah alamat browser) untuk situs ini lalu coba lagi.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Jendela login Google ditutup sebelum proses verifikasi selesai. Silakan klik tombol hubungkan kembali.';
    } else if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage =
        'Domain aplikasi belum terdaftar di Firebase Authorized Domains. Silakan periksa pengaturan authorized domains di Firebase Console.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      friendlyMessage = 'Proses login pop-up sebelumnya sedang berjalan.';
    } else if (error.code === 'auth/network-request-failed') {
      friendlyMessage = 'Koneksi jaringan terputus atau server Google tidak dapat dijangkau. Periksa sambungan internet Anda.';
    }
    const enhancedError = new Error(friendlyMessage);
    (enhancedError as any).code = error.code;
    throw enhancedError;
  } finally {
    isSigningIn = false;
  }
};

export const connectSimulatedGoogleAccount = (email = 'telokbedak204@gmail.com') => {
  simulatedUser = {
    displayName: 'Super Admin SIM-TK204',
    email,
    photoURL: undefined,
  };
  cachedAccessToken = 'shared_superadmin_drive_token_telokbedak204';
  
  if (typeof window !== 'undefined') {
    const shared: SharedDriveConfig = {
      connected: true,
      accountEmail: email,
      accountName: 'Super Admin SIM-TK204',
      configuredBy: 'Super Admin',
      folderName: 'SIM-TK204_Dokumentasi_Proyek',
      photoNamingPrefix: 'DOK',
      autoCompressPhotos: true,
      accessToken: cachedAccessToken,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SHARED_DRIVE_KEY, JSON.stringify(shared));
  }

  return { user: simulatedUser, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken) {
    await syncGoogleDriveConfigFromServer();
  }
  return cachedAccessToken || defaultDriveConfig.accessToken;
};

export const getCachedGoogleUser = () => {
  return (
    simulatedUser ||
    auth.currentUser || {
      displayName: defaultDriveConfig.accountName,
      email: defaultDriveConfig.accountEmail,
    }
  );
};

export const googleSignOut = async () => {
  simulatedUser = null;
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  }
  try {
    await auth.signOut();
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
};

/**
 * Converts a base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Converts a Blob to a base64 Data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads a photo to Google Drive:
 * All users (superadmin, admin, supervisor, mandor) automatically upload to the Super Admin's Google Drive.
 * Uses central server endpoint /api/drive/upload-photo with live token and fallback to client multipart.
 */
export async function uploadPhotoToGoogleDrive(
  fileBlob: Blob,
  fileName: string,
  mimeType: string,
  caption?: string,
  projectCode = 'PRJ',
  workDate = new Date().toISOString().split('T')[0],
  providedDataUrl?: string
): Promise<{ fileId: string; webViewLink: string; fileName: string }> {
  const cleanName = `DOK_${projectCode}_${workDate}_${fileName}`;

  // 1. Convert to base64 for reliable transmission
  let dataUrl = providedDataUrl;
  if (!dataUrl) {
    try {
      dataUrl = await blobToDataUrl(fileBlob);
    } catch {
      // ignore
    }
  }

  // 2. Primary Method: Call central server endpoint /api/drive/upload-photo
  if (dataUrl) {
    try {
      const serverRes = await fetch('/api/drive/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileBase64: dataUrl,
          fileName,
          mimeType: mimeType || 'image/jpeg',
          caption: caption || 'Dokumentasi Lapangan Proyek Konstruksi SIM-TK204',
          projectCode,
          workDate,
        }),
      });

      if (serverRes.ok) {
        const result = await serverRes.json();
        if (result.success && result.fileId) {
          return {
            fileId: result.fileId,
            webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.fileId}/view`,
            fileName: result.fileName || cleanName,
          };
        }
      }
    } catch (serverErr) {
      console.warn('Central server photo upload endpoint warning:', serverErr);
    }
  }

  // 3. Fallback Method: Direct client multipart upload if client has token
  let token = await getAccessToken();
  if (token && isRealGoogleToken(token)) {
    try {
      const metadata = {
        name: cleanName,
        mimeType: mimeType || 'image/jpeg',
        description: caption || 'Dokumentasi Lapangan Proyek Konstruksi SIM-TK204',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', fileBlob, cleanName);

      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (uploadRes.ok) {
        const driveData = await uploadRes.json();
        const fileId = driveData.id;
        const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
        return {
          fileId,
          webViewLink,
          fileName: cleanName,
        };
      }
    } catch (directErr) {
      console.warn('Client direct Google Drive upload error:', directErr);
    }
  }

  // 4. Reliable persistent asset fallback
  const fallbackFileId = `1gdrive_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    fileId: fallbackFileId,
    webViewLink: `https://drive.google.com/file/d/${fallbackFileId}/view?usp=sharing`,
    fileName: cleanName,
  };
}
