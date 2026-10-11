import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, QrCode, Smartphone, X, MessageSquare, Send } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'info', msg: string) => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://sim-tk204.app';
  const shareTitle = 'SIM-TK204 — Sistem Informasi Monitoring Tenaga Kerja Proyek Konstruksi';
  const shareDescription =
    'Aplikasi monitoring dan rekapitulasi harian/mingguan tenaga kerja proyek konstruksi dengan ekspor Excel (.xlsx), PDF A4 Landscape resmi, dan sinkronisasi database Supabase.';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      onShowToast?.('success', 'Link aplikasi berhasil disalin ke papan klip!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl,
        });
        onShowToast?.('info', 'Tautan berhasil dibagikan');
      } catch (err) {
        // User cancelled or not supported
        console.log('Share dismissed or cancelled:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const waText = encodeURIComponent(
      `*${shareTitle}*\n\n${shareDescription}\n\nBuka aplikasi:\n${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(tgUrl, '_blank');
  };

  // QR Code URL via reliable public QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&bgcolor=142B4A&color=FFFFFF&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#142B4A] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F28C28] flex items-center justify-center text-white shadow">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Bagikan Link SIM-TK204</h3>
              <p className="text-[11px] text-slate-300">Pratinjau kartu tautan & deskripsi resmi saat dibagikan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Social Share Preview Card (Simulates OpenGraph Card in WhatsApp/Socials) */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50">
            <div className="relative aspect-[16/9] w-full bg-[#142B4A] overflow-hidden">
              <img
                src="/og-image.png"
                alt="Kartu Pratinjau SIM-TK204"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to SVG if image loading fails
                  (e.target as HTMLImageElement).src = '/icon.svg';
                }}
              />
              <div className="absolute top-2 left-2 bg-[#142B4A]/90 backdrop-blur-xs text-[#F28C28] text-[10px] font-bold px-2 py-0.5 rounded border border-orange-500/30">
                Pratinjau Tautan Media Sosial
              </div>
            </div>
            <div className="p-3.5 bg-white border-t border-slate-100">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#F28C28] mb-1">
                sim-tk204.app • Aplikasi Web Proyek
              </div>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">
                {shareTitle}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {shareDescription}
              </p>
            </div>
          </div>

          {/* Share Link Input & Copy */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Tautan Aplikasi:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 truncate select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-lg bg-[#142B4A] hover:bg-[#1a385f] active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all shrink-0 min-h-[38px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Share Channels */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors gap-1 text-xs font-medium min-h-[56px]"
            >
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleShareTelegram}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors gap-1 text-xs font-medium min-h-[56px]"
            >
              <Send className="w-5 h-5 text-sky-600" />
              <span>Telegram</span>
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors gap-1 text-xs font-medium min-h-[56px]"
            >
              <QrCode className="w-5 h-5 text-purple-600" />
              <span>{showQR ? 'Tutup QR' : 'QR Code'}</span>
            </button>
          </div>

          {/* QR Code Section */}
          {showQR && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center animate-in fade-in">
              <div className="bg-[#142B4A] p-2.5 rounded-xl shadow-md mb-2">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Aplikasi SIM-TK204"
                  className="w-36 h-36 rounded-lg object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-800">Pindai dengan Kamera HP</p>
              <p className="text-[11px] text-slate-500">Buka langsung di browser ponsel rekan proyek atau mandor</p>
            </div>
          )}

          {/* Native Web Share Button (Mobile/PWA) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow flex items-center justify-center gap-2 transition-all min-h-[42px]"
            >
              <Share2 className="w-4 h-4" />
              <span>Buka Menu Berbagi Sistem Perangkat</span>
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Didukung fitur Progressive Web App (PWA)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
