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
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full min-w-0">
      {/* Brand Hero */}
      <div className="bg-[#142B4A] rounded-2xl p-4 sm:p-6 text-white shadow-md">
        <div className="flex items-center gap-3 sm:gap-3.5 mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F28C28] flex items-center justify-center text-white shadow shrink-0">
            <HardHat className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">SIM-TK204</h1>
            <p className="text-[10px] sm:text-xs text-orange-200 font-semibold tracking-wider uppercase">
              Sistem Informasi Monitoring Tenaga Kerja Proyek Konstruksi
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Aplikasi administrasi dan monitoring tenaga kerja harian/mingguan yang dirancang khusus untuk kontraktor pelaksana, konsultan Manajemen Konstruksi (MK), dan direksi pekerjaan. Sistem ini memadukan pencatatan presisi lapangan, perhitungan kumulatif otomatis, visualisasi tren kehadiran, serta ekspor laporan administratif dalam format Excel (.xlsx) dan PDF resmi berstandar proyek.
        </p>
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
              <strong>Rata-rata Harian:</strong> Total Orang-Hari dibagi jumlah hari kalender laporan. Hari tanpa catatan dihitung sebagai nol untuk rata-rata kalender dengan indikator peringatan khusus.
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
            <div className="font-bold text-slate-800">Tailwind CSS</div>
            <div className="text-[11px] text-slate-500">Desain Responsif Mobile-First</div>
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
