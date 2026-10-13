import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = 'simulated_oauth_token_' + Date.now();
let simulatedUser: { displayName: string; email: string; photoURL?: string } | null = {
  displayName: 'Super Admin (Google Workspace)',
  email: 'telokbedak204@gmail.com',
};

export const initGoogleAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (simulatedUser && cachedAccessToken) {
    if (onAuthSuccess) onAuthSuccess(simulatedUser, cachedAccessToken);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn && !simulatedUser) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else if (!simulatedUser) {
      cachedAccessToken = null;
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
    simulatedUser = null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    let friendlyMessage = error.message || 'Terjadi kesalahan saat otentikasi Google.';
    if (error.code === 'auth/popup-blocked') {
      friendlyMessage =
        'Jendela pop-up login Google diblokir oleh browser. Harap izinkan pop-up (ikon pop-up/gembok di bilah alamat browser) untuk situs ini lalu coba lagi.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Jendela login Google ditutup sebelum proses verifikasi selesai. Silakan klik tombol hubungkan kembali.';
    } else if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage =
        'Domain aplikasi ini belum terdaftar di Firebase Authorized Domains. Gunakan mode uji simulasi untuk verifikasi tampilan atau daftarkan domain di Firebase Console.';
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
    displayName: 'Pengguna Google (Mode Pengujian)',
    email,
    photoURL: undefined,
  };
  cachedAccessToken = 'simulated_oauth_token_' + Date.now();
  return { user: simulatedUser, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCachedGoogleUser = () => {
  return simulatedUser || auth.currentUser;
};

export const googleSignOut = async () => {
  simulatedUser = null;
  cachedAccessToken = null;
  try {
    await auth.signOut();
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
};
