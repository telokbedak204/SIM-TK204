import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  Monitor,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'banner' | 'card' | 'login' | 'login-header';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'desktop'>(
    isIOS ? 'ios' : 'android'
  );
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const success = await install();
        if (!success) {
          // If browser dismissed or didn't open prompt, fallback to guide
          setShowGuideModal(true);
        }
      } catch {
        setShowGuideModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // Guide Modal for all devices (Android, iOS, Desktop)
  const renderGuideModal = () => {
    if (!showGuideModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 text-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F28C28] to-orange-600 flex items-center justify-center text-white shadow shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  Cara Pasang Aplikasi SIM-TK204
                </h3>
                <p className="text-[11px] text-slate-300">
                  Instalasi cepat ke layar utama tanpa Google Play / App Store
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuideModal(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Device Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveGuideTab('android')}
              className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeGuideTab === 'android'
                  ? 'bg-white text-[#142B4A] shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android / Chrome</span>
            </button>
            <button
              onClick={() => setActiveGuideTab('ios')}
              className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeGuideTab === 'ios'
                  ? 'bg-white text-[#142B4A] shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>iPhone / iPad</span>
            </button>
            <button
              onClick={() => setActiveGuideTab('desktop')}
              className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeGuideTab === 'desktop'
                  ? 'bg-white text-[#142B4A] shadow-xs font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-purple-600" />
              <span>Laptop / PC</span>
            </button>
          </div>

          {/* Guide Content */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
            {activeGuideTab === 'android' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    Buka halaman ini menggunakan browser <strong>Google Chrome</strong> di ponsel Android Anda.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    Ketuk ikon <strong>menu titik tiga (⋮)</strong> di sudut kanan atas peramban Chrome.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    Pilih opsi <strong>&quot;Instal aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>).
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    Ikon aplikasi <strong>SIM-TK204</strong> akan langsung muncul di beranda ponsel Anda dan dapat dibuka seperti aplikasi Android biasa!
                  </div>
                </div>
              </div>
            )}

            {activeGuideTab === 'ios' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    Buka tautan ini di browser <strong>Safari</strong> (bukan di dalam browser aplikasi lain seperti WA/IG).
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    Ketuk tombol <strong>Bagikan (Share)</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 mx-0.5" /> di bilah navigasi bawah Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    Gulir menu ke bawah dan ketuk opsi <strong>Tambah ke Layar Utama</strong> (<PlusSquare className="inline w-3.5 h-3.5 text-slate-700 mx-0.5" /> <em>Add to Home Screen</em>).
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div className="flex-1">
                    Ketuk <strong>Tambah (Add)</strong> di sudut kanan atas. Selesai!
                  </div>
                </div>
              </div>
            )}

            {activeGuideTab === 'desktop' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    Buka halaman ini di browser <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong> di komputer / laptop Anda.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    Lihat ke bilah alamat (URL bar) di bagian atas kanan. Cari ikon <strong>komputer dengan panah bawah / Instal</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    Klik <strong>&quot;Instal&quot;</strong>. Aplikasi akan terbuka di jendela mandiri tanpa bingkai browser.
                  </div>
                </div>
              </div>
            )}

            {/* Quick Benefits */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
              <p>
                <strong>Keuntungan PWA:</strong> Akses 1-klik langsung dari layar utama, bekerja lebih cepat, tampilan layar penuh tanpa URL bar, dan hemat kuota data internet saat di lapangan.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#1a385f] text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 1. Variant: Login Modal Header Button
  if (variant === 'login-header') {
    if (isInstalled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Terpasang</span>
        </span>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Pasang aplikasi SIM-TK204 ke layar utama HP / Laptop"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F28C28] to-orange-500 hover:from-orange-600 hover:to-orange-600 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 animate-pulse" />
          <span>Instal App</span>
        </button>
        {renderGuideModal()}
      </>
    );
  }

  // 2. Variant: Login Page Dedicated Card
  if (variant === 'login') {
    if (isInstalled) {
      return (
        <div className={`p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Aplikasi SIM-TK204 Terpasang</div>
              <p className="text-[11px] text-emerald-700">Berjalan dalam mode PWA Standalone di perangkat Anda.</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-200/60 text-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase">
            PWA Aktif
          </span>
        </div>
      );
    }

    return (
      <>
        <div className={`p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 to-orange-50/40 border border-orange-200/80 shadow-xs space-y-3 ${className}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F28C28] text-white flex items-center justify-center shadow-xs shrink-0">
                <Download className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#142B4A] flex items-center gap-1.5">
                  <span>Pasang Aplikasi SIM-TK204</span>
                  <span className="text-[9px] font-extrabold uppercase bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded border border-orange-200">
                    PWA
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Akses langsung 1-klik dari layar utama HP atau Laptop tanpa ketik URL web.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#F28C28] to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] text-white text-xs font-bold shadow transition-all cursor-pointer min-h-[40px]"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'Membuka Pemasangan...' : 'Instal ke Layar Utama'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px] whitespace-nowrap"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Petunjuk Cara Pasang</span>
            </button>
          </div>
        </div>

        {renderGuideModal()}
      </>
    );
  }

  // 3. Variant: Sidebar Button
  if (variant === 'sidebar') {
    if (isInstalled) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>SIM-TK204 Terpasang</span>
        </div>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all min-h-[44px] cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 animate-bounce" />
            <span>Instal Aplikasi SIM-TK</span>
          </div>
          <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            PWA
          </span>
        </button>
        {renderGuideModal()}
      </>
    );
  }

  // 4. Variant: Banner / Card
  if (variant === 'banner' || variant === 'card') {
    if (isInstalled) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Aplikasi SIM-TK204 terpasang (Standalone PWA)</span>
        </div>
      );
    }

    return (
      <>
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="px-4 py-2 bg-[#F28C28] hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center justify-center gap-2 shrink-0 min-h-[40px] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'Memasang...' : 'Instal Sekarang'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Petunjuk
            </button>
          </div>
        </div>
        {renderGuideModal()}
      </>
    );
  }

  // 5. Default Navbar variant
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Instal SIM-TK204 ke Layar Utama Perangkat"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold shadow transition-all min-h-[38px] cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5 animate-pulse" />
        <span className="hidden sm:inline">Instal App</span>
        <span className="sm:hidden">Instal</span>
      </button>
      {renderGuideModal()}
    </>
  );
};

