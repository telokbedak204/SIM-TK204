import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running inside installed standalone PWA
  if (isInstalled) {
    if (variant === 'card' || variant === 'banner') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Aplikasi SIM-TK204 terpasang (Standalone PWA)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Render for Chromium / Android / Desktop (beforeinstallprompt supported)
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all min-h-[44px] ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 animate-bounce" />
            <span>Instal Aplikasi SIM-TK</span>
          </div>
          <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            PWA
          </span>
        </button>
      );
    }

    if (variant === 'banner') {
      return (
        <div className={`p-4 rounded-xl bg-gradient-to-r from-[#142B4A] to-[#1c3a63] border border-orange-500/40 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F28C28] flex items-center justify-center shrink-0 shadow">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Pasang SIM-TK204 di Perangkat Anda</div>
              <p className="text-xs text-slate-300">Akses cepat satu klik dari layar utama, responsif, dan hemat kuota.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="px-4 py-2 bg-[#F28C28] hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-2 shrink-0 min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalling ? 'Memasang...' : 'Instal Sekarang'}</span>
          </button>
        </div>
      );
    }

    // Default Navbar variant
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Instal SIM-TK204 ke Layar Utama Perangkat"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold shadow transition-all min-h-[38px] ${className}`}
      >
        <Download className="w-3.5 h-3.5 animate-pulse" />
        <span className="hidden sm:inline">Instal App</span>
        <span className="sm:hidden">Instal</span>
      </button>
    );
  }

  // Render for iOS Safari devices (WebKit does not support beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition-colors min-h-[38px] ${className}`}
          title="Petunjuk Pasang di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#F28C28]" />
          <span>Instal di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-base text-[#142B4A]">
                  <Smartphone className="w-5 h-5 text-[#F28C28]" />
                  <span>Pasang di iPhone / iPad</span>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    Buka halaman ini di browser <strong>Safari</strong>, lalu ketuk tombol <strong>Bagikan (Share)</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 mx-0.5" /> di bilah bawah.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    Gulir ke bawah dan ketuk opsi <strong>Tambah ke Layar Utama</strong> (<PlusSquare className="inline w-3.5 h-3.5 text-slate-700 mx-0.5" /> <em>Add to Home Screen</em>).
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    Ketuk <strong>Tambah (Add)</strong> di sudut kanan atas. Ikon SIM-TK204 akan otomatis muncul di layar utama gadget Anda.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#1a385f] text-white font-semibold text-xs transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers where beforeinstallprompt has not triggered yet
  if (variant === 'sidebar' || variant === 'banner') {
    return (
      <div className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs ${className}`}>
        <div className="flex items-center gap-2 font-semibold text-white mb-1">
          <Smartphone className="w-4 h-4 text-[#F28C28]" />
          <span>Dukungan Aplikasi PWA</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
          Dapat diinstal langsung ke layar utama ponsel atau laptop via menu browser (<em>Add to Home screen / Install</em>).
        </p>
      </div>
    );
  }

  return null;
};
