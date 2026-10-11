# SIM-TK204 — Sistem Informasi Monitoring Tenaga Kerja Proyek Konstruksi

**SIM-TK204** adalah aplikasi web modern, profesional, dan berstandar industri konstruksi untuk kontraktor pelaksana, konsultan Manajemen Konstruksi (MK), dan direksi pekerjaan. Sistem ini mencatat jumlah kehadiran tenaga kerja harian berdasarkan keahlian/jabatan, menghitung rekapitulasi kumulatif secara otomatis, menganalisis fluktuasi orang-hari, serta mengekspor berkas administrasi proyek resmi dalam format Microsoft Excel asli (`.xlsx` 4 lembar kerja) dan dokumen cetak PDF (A4 Landscape berlembar pengesahan tanda tangan).

---

## 🏗️ 1. Identitas & Desain Visual
- **Nama Aplikasi:** SIM-TK204
- **Kepanjangan:** Sistem Informasi Monitoring Tenaga Kerja Proyek Konstruksi
- **Warna Utama:** Navy `#142B4A`
- **Warna Aksen:** Oranye `#F28C28`
- **Latar Belakang:** Slate / Abu-abu sangat muda bersih (`bg-slate-50`)
- **Tipografi:** Sans-serif profesional (Inter & JetBrains Mono untuk angka)

---

## ⚡ 2. Fitur Utama

1. **Dashboard Monitoring Real-Time:**
   - Ringkasan 4 Kartu Statistik: Tenaga Kerja Terkini, Puncak Kehadiran, Total Orang-Hari (OH), dan Rata-rata Harian.
   - Indikator tanggal belum tercatat (hari tanpa catatan dihitung sebagai nol kalender dengan peringatan visual).
   - Grafik interaktif fluktuasi harian dan grafik komposisi keahlian tenaga kerja (Recharts).
   - Tabel matriks monitoring mingguan responsif dengan tombol toggle Tampilan Tabel atau Kartu Jabatan untuk layar ponsel (Android/iOS mulai 320px).

2. **Modul Input Tenaga Kerja Harian Cepat:**
   - Pencatatan jumlah orang per jabatan per hari (bukan kewajiban memasukkan nama satu per satu).
   - Stepper sentuh nyaman (+ / - minimal 44px) untuk ponsel layar sentuh dan keyboard numerik.
   - Tombol **Salin Hari Kemarin** & **Salin Dari Tanggal Tertentu**.
   - Tombol **Kosongkan Formulir** dengan konfirmasi dialog pencegahan salah tekan.
   - Indikator perubahan belum disimpan (*Unsaved Changes Indicator*).
   - Mekanisme *idempotent batch upsert* mencegah data ganda.

3. **Laporan Mingguan & Matriks Administrasi:**
   - Format standar monitoring proyek (No, Keahlian, Hari & Tanggal, Jumlah Orang-Hari, Rata-rata/Hari).
   - Kolom penandatangan resmi (Disusun oleh: Kontraktor, Diperiksa oleh: Konsultan MK, Mengetahui: PM).

4. **Ekspor Excel Asli (.xlsx) 4 Lembar Kerja:**
   - **Lembar 1: Monitoring Mingguan** — Matriks Keahlian × Tanggal, Total, dan Rata-rata.
   - **Lembar 2: Rekap Harian** — Rincian catatan harian dan keterangan lapangan.
   - **Lembar 3: Rekap Per Jabatan** — Alokasi total orang-hari dan persentase proporsi.
   - **Lembar 4: Identitas Proyek** — Data teknis kontrak, lokasi, dan stakeholder.
   - Pola nama berkas: `SIM-TK204_{NamaProyek}_{TanggalMulai}_{TanggalAkhir}.xlsx`.

5. **Ekspor Dokumen PDF A4 Landscape:**
   - Kop resmi bergaris aksen oranye dan navy.
   - Ringkasan KPI dan tabel kisi data jspdf-autotable.
   - 3 Kolom lembar tanda tangan pengesahan resmi.
   - Unduh langsung tombol satu klik tanpa bergantung pada dialog print browser.

6. **Master Proyek & Master Jabatan:**
   - Kelola multi-proyek (tambah, edit, arsipkan, ganti proyek aktif).
   - 8 Jabatan standar: *Project Manager, Mandor, Kepala Tukang, Surveyor, Pekerja, Tenaga Sondir, Drafter, HSE Koordinator*.
   - Tambah jabatan kustom, ubah urutan nomor tampilan (*sort order*), dan aktif/nonaktifkan tanpa menghapus riwayat data lama.

7. **Keamanan & Hak Akses Berjenjang (RBAC):**
   - **Administrator:** Kelola proyek, anggota, jabatan, dan database.
   - **Project Manager:** Memantau monitoring, memvalidasi dan menandatangani laporan.
   - **Site Editor:** Mencatat dan menyunting data harian lapangan.
   - **Viewer:** Hanya melihat (*read-only*), dicegah menyimpan perubahan.

---

## 🗄️ 3. Skema & Migrasi Database Supabase

Berkas migrasi SQL siap pakai tersedia di:
`supabase/migrations/20261011000000_init_sim_tk204.sql`

Struktur tabel PostgreSQL:
1. `public.profiles` (UUID primary key terhubung ke auth.users, nama lengkap, peran RBAC).
2. `public.projects` (kode unik, nama, pemilik, kontraktor, MK, lokasi, periode, status).
3. `public.project_members` (kombinasi unik project_id dan user_id, peran pengguna).
4. `public.job_roles` (nama keahlian, nomor urut sort_order, status is_active).
5. `public.daily_manpower` (unique constraint `project_id, job_role_id, work_date`, worker_count integer 0–9999, catatan).
6. **Row Level Security (RLS)** aktif pada seluruh tabel dengan kebijakan berbasis keanggotaan proyek dan peran akun.

---

## 🚀 4. Panduan Menjalankan Aplikasi Secara Lokal

### Prasyarat:
- Node.js versi 18 atau 20+.
- npm versi 9+.

### Langkah-langkah:
```bash
# 1. Kloning repository atau unduh source code
git clone https://github.com/username/sim-tk204.git
cd sim-tk204

# 2. Instal seluruh dependensi
npm install

# 3. Salin berkas lingkungan
cp .env.example .env

# 4. Jalankan server pengembangan Vite
npm run dev
```

Buka peramban Anda di `http://localhost:3000`.

---

## ☁️ 5. Menghubungkan ke Database Supabase

1. Buka [Supabase](https://supabase.com) dan buat proyek baru (*New Project*).
2. Di Dashboard Supabase, buka menu **SQL Editor**.
3. Buka file `supabase/migrations/20261011000000_init_sim_tk204.sql`, salin seluruh isinya, dan klik tombol **Run** di Supabase SQL Editor.
4. Buka **Project Settings** > **API**.
5. Salin nilai:
   - **Project URL**
   - **Project API Keys** (gunakan yang bertanda `anon` / `public`)
6. Masukkan ke file `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
   ```
   *Atau* Anda dapat memasukkannya langsung melalui menu **Pengaturan & Supabase** di dalam antarmuka aplikasi SIM-TK204, lalu klik **Simpan Kredensial**.

---

## 🧪 6. Menjalankan Pengujian Logika (Vitest)

Aplikasi dilengkapi unit testing otomatis untuk menguji seluruh formula matematis dan batas operasional:
```bash
npm run test
```

Pengujian memverifikasi:
- Ketepatan perhitungan data demo "Pasar Loka": **97 orang-hari** dan rata-rata **13,86 orang per hari**.
- Deteksi tanggal tanpa pencatatan (*missing dates*).
- Format tanggal dan hari Indonesia (*Asia/Jakarta*).
- Penolakan angka negatif, desimal, huruf, dan nilai melebihi batas 9.999 orang.
- Validasi rentang tanggal laporan.

---

## 📦 7. Build Produksi & Hosting di Vercel

### Build Lokal:
```bash
npm run build
```
Hasil build yang optimal dan minified akan dibuat di folder `dist/`.

### Deployment ke Vercel:
1. Hubungkan repository GitHub Anda ke akun [Vercel](https://vercel.com).
2. Pengaturan Proyek Vercel:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Atur *Environment Variables* di Vercel:
   - `VITE_SUPABASE_URL` : URL proyek Supabase Anda
   - `VITE_SUPABASE_PUBLISHABLE_KEY` : Anon key Supabase Anda
4. File `vercel.json` telah disediakan dengan aturan *rewrites* agar routing SPA tidak mengalami error 404 ketika halaman di-refresh.

---

## 📊 8. Data Uji Coba Standar (Demo Bagian S)
- **Nama Proyek:** Lanjutan Renovasi Pasar Loka – Kepulauan Anambas
- **Periode Demo:** 2–8 Oktober 2026 (7 Hari Kalender)
- **Komposisi Pekerja:**
  - Project Manager: 1 org/hari
  - Mandor: 1 org/hari
  - Surveyor: 1 org/hari
  - Pekerja: 11, 11, 8, 8, 8, 8, 8 org
  - HSE Koordinator: 2 org/hari
  - Kepala Tukang, Sondir, Drafter: 0 org
- **Jumlah Harian:** 16, 16, 13, 13, 13, 13, 13 orang
- **Total:** 97 orang-hari
- **Rata-rata:** 13,86 orang per hari
