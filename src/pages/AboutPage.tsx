import React from 'react';
import {
  HardHat,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Calculator,
  CheckCircle2,
  Server,
  Code2,
  Smartphone,
  Share2,
  Wifi,
  Zap,
} from 'lucide-react';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';

interface AboutPageProps {
  onOpenShare?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenShare }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full min-w-0">
      {/* Brand Hero with Official Logo */}
      <div className="bg-[#142B4A] rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden border border-[#1d3d66]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-[#F28C28] flex items-center justify-center text-white shadow-xl border-2 border-orange-400/50 shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Logo Resmi SIM-TK204"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">SIM-TK204</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-[#F28C28] border border-orange-500/30">
                  PWA Ready
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-orange-200 font-semibold tracking-wider uppercase mt-0.5">
                Sistem Informasi Monitoring Tenaga Kerja Proyek Konstruksi
              </p>
            </div>
          </div>

          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold shadow transition-all flex items-center gap-2 shrink-0 min-h-[40px]"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Link Aplikasi</span>
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mt-4">
          Aplikasi administrasi dan monitoring tenaga kerja harian/mingguan yang dirancang khusus untuk kontraktor pelaksana, konsultan Manajemen Konstruksi (MK), dan direksi pekerjaan. Sistem ini memadukan pencatatan presisi lapangan, perhitungan kumulatif otomatis, visualisasi tren kehadiran, serta ekspor laporan administratif dalam format Excel (.xlsx) dan PDF resmi berstandar proyek.
        </p>
      </div>

      {/* PWA Installation Card */}
      <PWAInstallButton variant="banner" />

      {/* Social Sharing Card & Meta Description Information */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#142B4A] font-bold text-sm">
            <Share2 className="w-5 h-5 text-[#F28C28]" />
            <span>Deskripsi & Pratinjau Tautan Berbagi Resmi</span>
          </div>
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Buka Dialog Berbagi</span>
              <span>→</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Saat tautan aplikasi dibagikan melalui WhatsApp, Telegram, Facebook, LinkedIn, atau Twitter, kartu pratinjau kaya (*OpenGraph & Twitter Card*) akan otomatis menampilkan logo resmi, judul aplikasi, dan ringkasan berikut:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <div>
            <strong className="text-slate-800">Judul Tautan (og:title):</strong>{' '}
            <span className="text-slate-600">SIM-TK204 — Sistem Informasi Monitoring Tenaga Kerja Proyek Konstruksi</span>
          </div>
          <div>
            <strong className="text-slate-800">Deskripsi Resmi (og:description):</strong>{' '}
            <span className="text-slate-600">
              Aplikasi monitoring dan rekapitulasi harian/mingguan tenaga kerja proyek konstruksi dengan ekspor Excel (.xlsx), PDF A4 Landscape resmi, dan integrasi database Supabase.
            </span>
          </div>
          <div>
            <strong className="text-slate-800">Gambar Kartu (og:image):</strong>{' '}
            <span className="text-slate-600 font-mono text-[11px]">/og-image.png (1200x630 High Definition Banner)</span>
          </div>
        </div>
      </div>

      {/* PWA Features & Capabilities */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#142B4A] font-bold text-sm">
          <Smartphone className="w-5 h-5 text-[#F28C28]" />
          <span>Keunggulan Progressive Web App (PWA) SIM-TK204</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instal Tanpa Toko Aplikasi</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dapat langsung dipasang ke layar beranda HP Android, iPhone, tablet, maupun PC desktop tanpa perlu mengunduh file APK dari Play Store.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <Wifi className="w-4 h-4 text-blue-500" />
              <span>Dukungan Caching Cepat</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Service Worker menyimpan aset penting secara lokal sehingga aplikasi terbuka sekejap mata bahkan saat sinyal internet di lokasi proyek minim.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Tampilan Mandiri (Standalone)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Bekerja di jendela layar penuh tanpa bilah peramban (URL bar), memberikan pengalaman seperti aplikasi native profesional.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Perhitungan Akurat */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#142B4A] font-bold text-sm">
            <Calculator className="w-5 h-5 text-[#F28C28]" />
            <span>Rumus Rekapitulasi Matematis Baku</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
            <li>
              <strong>Total Tenaga Kerja Harian:</strong> Penjumlahan pekerja dari seluruh jabatan aktif pada tanggal tersebut.
            </li>
            <li>
              <strong>Total Orang-Hari (OH):</strong> Penjumlahan seluruh tenaga kerja harian sepanjang rentang periode kalender.
            </li>
            <li>
              <strong>Rata-rata Harian:</strong> Total Orang-Hari dibagi jumlah hari kalender laporan (misal 97 OH / 7 hari = 13,86 orang/hari).
            </li>
            <li>
              <strong>Puncak Tenaga Kerja:</strong> Nilai kehadiran tertinggi selama periode beserta tanggal pencapaiannya.
            </li>
          </ul>
        </div>

        {/* Card 2: Keamanan & Hak Akses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#142B4A] font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Hak Akses Tersegregasi (RBAC) & RLS</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
            <li>
              <strong>Administrator:</strong> Akses penuh ke seluruh proyek, master data, anggota tim, dan konfigurasi database.
            </li>
            <li>
              <strong>Project Manager (PM):</strong> Mengawasi monitoring keseluruhan proyek, validasi, dan penandatanganan laporan.
            </li>
            <li>
              <strong>Site Editor / Pencatat:</strong> Menambahkan dan menyunting data pencatatan harian di lapangan.
            </li>
            <li>
              <strong>Viewer:</strong> Hak akses read-only untuk pengawas atau pemangku kepentingan tanpa izin modifikasi data.
            </li>
          </ul>
        </div>

        {/* Card 3: Ekspor Excel Multi-Sheet */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#142B4A] font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <span>Ekspor Excel Asli (.xlsx) 4 Lembar Kerja</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Menghasilkan berkas spreadsheet Microsoft Excel asli dengan 4 lembar kerja terstruktur:
            (1) Monitoring Mingguan (matriks tanggal), (2) Rekap Harian, (3) Rekap Komposisi Per Jabatan, dan (4) Lembar Identitas & Pengesahan Proyek.
          </p>
        </div>

        {/* Card 4: Dokumen PDF Cetak Langsung */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#142B4A] font-bold text-sm">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>Ekspor PDF Format A4 Landscape Resmi</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Menghasilkan dokumen PDF profesional dengan kop identitas proyek, tabel matriks monitoring lengkap dengan border kisi, indikator statistik, serta 3 kolom lembar tanda tangan pengesahan (Kontraktor Pelaksana, Konsultan MK, dan Project Manager).
          </p>
        </div>
      </div>

      {/* Technical Stack Specifications */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#F28C28]" />
          <span>Arsitektur & Komponen Teknologi:</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-800">React + TypeScript</div>
            <div className="text-[11px] text-slate-500">Frontend Modular & Type-Safe</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-800">Progressive Web App</div>
            <div className="text-[11px] text-slate-500">Service Worker & Manifest</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-800">Supabase PostgreSQL</div>
            <div className="text-[11px] text-slate-500">Database Cloud & Auth RLS</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-800">SheetJS & jsPDF</div>
            <div className="text-[11px] text-slate-500">Ekspor Excel .xlsx & PDF</div>
          </div>
        </div>
      </div>
    </div>
  );
};
