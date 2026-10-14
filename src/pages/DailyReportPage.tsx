import React, { useState, useEffect } from 'react';
import { Project, JobRole, DailyManpower, DailyReportNarrative, DriveDocumentationPhoto, UserProfile } from '../types';
import { DataService } from '../services/dataService';
import { formatDateIndo, getDayNameIndo, formatDateIndoFull } from '../lib/calculations';
import { initGoogleAuth, googleSignIn, getAccessToken, uploadPhotoToGoogleDrive, dataUrlToBlob, hasRealGoogleConnection, isSuperAdminUser, syncGoogleDriveConfigFromServer } from '../lib/googleDriveAuth';
import {
  FileText,
  Copy,
  Calendar,
  CheckCircle2,
  History,
  Save,
  FolderArchive,
  ArrowRight,
  Eye,
  Send,
  Camera,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  Trash2,
  Check,
  User,
  X,
  RefreshCw,
  AlertCircle,
  CloudUpload,
  Download,
  Edit3,
  Sun,
  SunMedium,
  CloudSun,
  CloudRain,
  Wrench,
} from 'lucide-react';
import { exportDailyReportToPDF } from '../lib/pdfExport';

const WEATHER_OPTIONS = [
  { value: 'Cerah', label: '☀️ Cerah' },
  { value: 'Cerah Berawan', label: '⛅ Cerah Berawan' },
  { value: 'Berawan', label: '☁️ Berawan' },
  { value: 'Hujan Ringan / Gerimis', label: '🌦️ Hujan Ringan / Gerimis' },
  { value: 'Hujan Sedang / Lebat', label: '🌧️ Hujan Sedang / Lebat' },
  { value: 'Hujan Disertai Petir', label: '⛈️ Hujan Petir / Badai' },
];

interface BuildingEquipmentItem {
  id: string;
  name: string;
  category: string;
  defaultQty: string;
  defaultStatus: string;
}

const BUILDING_EQUIPMENT_LIST: BuildingEquipmentItem[] = [
  // 1. Alat Ukur & Penandaan
  { id: 'meteran_gulung', name: 'Meteran Gulung', category: 'Alat Ukur & Penandaan', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'meteran_laser', name: 'Meteran Laser', category: 'Alat Ukur & Penandaan', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'waterpass', name: 'Waterpass', category: 'Alat Ukur & Penandaan', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'selang_air_timbang', name: 'Selang Air Timbang', category: 'Alat Ukur & Penandaan', defaultQty: '1 Roll', defaultStatus: 'Beroperasi' },
  { id: 'unting_unting', name: 'Unting-Unting', category: 'Alat Ukur & Penandaan', defaultQty: '2 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'benang_tukang', name: 'Benang Tukang', category: 'Alat Ukur & Penandaan', defaultQty: '2 Roll', defaultStatus: 'Beroperasi' },
  { id: 'penggaris_siku', name: 'Penggaris Siku', category: 'Alat Ukur & Penandaan', defaultQty: '2 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'kapur_pensil_tukang', name: 'Kapur/Pensil Tukang', category: 'Alat Ukur & Penandaan', defaultQty: '5 Pcs', defaultStatus: 'Beroperasi' },

  // 2. Alat Galian, Pondasi & Adukan
  { id: 'cangkul', name: 'Cangkul', category: 'Alat Galian & Pondasi', defaultQty: '5 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'sekop', name: 'Sekop', category: 'Alat Galian & Pondasi', defaultQty: '5 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'linggis', name: 'Linggis', category: 'Alat Galian & Pondasi', defaultQty: '2 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'blat_belincong', name: 'Blat/Belincong', category: 'Alat Galian & Pondasi', defaultQty: '2 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'bak_spesi', name: 'Bak Spesi', category: 'Alat Galian & Pondasi', defaultQty: '6 Unit', defaultStatus: 'Beroperasi' },
  { id: 'ember_cor', name: 'Ember Cor', category: 'Alat Galian & Pondasi', defaultQty: '15 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'ayakan_pasir', name: 'Ayakan Pasir', category: 'Alat Galian & Pondasi', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },

  // 3. Alat Pekerjaan Dinding & Lantai
  { id: 'cetok_segitiga', name: 'Cetok Segitiga', category: 'Pekerjaan Dinding & Lantai', defaultQty: '10 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'cetok_kotak', name: 'Cetok Kotak', category: 'Pekerjaan Dinding & Lantai', defaultQty: '5 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'roskam_kayu_plastik', name: 'Roskam Kayu/Plastik', category: 'Pekerjaan Dinding & Lantai', defaultQty: '5 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'roskam_besi_kamprat', name: 'Roskam Besi/Kamprat', category: 'Pekerjaan Dinding & Lantai', defaultQty: '3 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'jidar_aluminium', name: 'Jidar Aluminium', category: 'Pekerjaan Dinding & Lantai', defaultQty: '4 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'palu_karet', name: 'Palu Karet', category: 'Pekerjaan Dinding & Lantai', defaultQty: '3 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'palu_konde', name: 'Palu Konde', category: 'Pekerjaan Dinding & Lantai', defaultQty: '3 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'pahat_batu', name: 'Pahat Batu', category: 'Pekerjaan Dinding & Lantai', defaultQty: '4 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'spons_busa_gosok', name: 'Spons/Busa Gosok', category: 'Pekerjaan Dinding & Lantai', defaultQty: '5 Pcs', defaultStatus: 'Beroperasi' },

  // 4. Alat Pekerjaan Kayu & Bekisting
  { id: 'gergaji_tangan', name: 'Gergaji Tangan', category: 'Pekerjaan Kayu & Bekisting', defaultQty: '4 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'palu_kambing', name: 'Palu Kambing', category: 'Pekerjaan Kayu & Bekisting', defaultQty: '6 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'pahat_kayu', name: 'Pahat Kayu', category: 'Pekerjaan Kayu & Bekisting', defaultQty: '3 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'sugu_ketam_tangan', name: 'Sugu/Ketam Tangan', category: 'Pekerjaan Kayu & Bekisting', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'klem_f_klem_c', name: 'Klem F/Klem C', category: 'Pekerjaan Kayu & Bekisting', defaultQty: '6 Pcs', defaultStatus: 'Beroperasi' },

  // 5. Alat Pekerjaan Besi Struktur
  { id: 'gunting_beton', name: 'Gunting Beton', category: 'Pekerjaan Besi Struktur', defaultQty: '2 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'alat_pembengkok_besi', name: 'Alat Pembengkok Besi', category: 'Pekerjaan Besi Struktur', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'kakatua_catut', name: 'Kakatua/Catut', category: 'Pekerjaan Besi Struktur', defaultQty: '4 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'gergaji_besi', name: 'Gergaji Besi', category: 'Pekerjaan Besi Struktur', defaultQty: '3 Pcs', defaultStatus: 'Beroperasi' },

  // 6. Alat Mesin Elektrik (Power Tools)
  { id: 'mesin_bor_beton', name: 'Mesin Bor Beton', category: 'Mesin Elektrik', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_bor_obeng', name: 'Mesin Bor Obeng', category: 'Mesin Elektrik', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_gerinda_tangan', name: 'Mesin Gerinda Tangan', category: 'Mesin Elektrik', defaultQty: '3 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_circular_saw', name: 'Mesin Circular Saw', category: 'Mesin Elektrik', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_pemotong_keramik', name: 'Mesin Pemotong Keramik', category: 'Mesin Elektrik', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_molen_beton', name: 'Mesin Molen Beton', category: 'Mesin Elektrik', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_vibrator_beton', name: 'Mesin Vibrator Beton', category: 'Mesin Elektrik', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'jet_cleaner', name: 'Jet Cleaner', category: 'Mesin Elektrik', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },

  // 7. Alat Akses & Mobilisasi
  { id: 'gerobak_dorong', name: 'Gerobak Dorong', category: 'Akses & Mobilisasi', defaultQty: '6 Unit', defaultStatus: 'Beroperasi' },
  { id: 'katrol_kerekan_manual', name: 'Katrol/Kerekan Manual', category: 'Akses & Mobilisasi', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'lift_barang_mini', name: 'Lift Barang Mini', category: 'Akses & Mobilisasi', defaultQty: '1 Unit', defaultStatus: 'Standby' },
  { id: 'tangga_aluminium', name: 'Tangga Aluminium', category: 'Akses & Mobilisasi', defaultQty: '3 Unit', defaultStatus: 'Beroperasi' },
  { id: 'scaffolding', name: 'Scaffolding', category: 'Akses & Mobilisasi', defaultQty: '50 Set', defaultStatus: 'Terpasang' },

  // 8. Alat Pelindung Diri (APD)
  { id: 'helm_proyek', name: 'Helm Proyek', category: 'APD', defaultQty: '15 Pcs', defaultStatus: 'Terpakai' },
  { id: 'sepatu_boots_karet', name: 'Sepatu Boots Karet', category: 'APD', defaultQty: '15 Pasang', defaultStatus: 'Terpakai' },
  { id: 'sarung_tangan', name: 'Sarung Tangan', category: 'APD', defaultQty: '30 Pasang', defaultStatus: 'Terpakai' },
  { id: 'kacamata_safety', name: 'Kacamata Safety', category: 'APD', defaultQty: '10 Pcs', defaultStatus: 'Terpakai' },
  { id: 'masker_debu', name: 'Masker Debu', category: 'APD', defaultQty: '1 Kotak', defaultStatus: 'Terpakai' },
  { id: 'full_body_harness', name: 'Full Body Harness', category: 'APD', defaultQty: '4 Pcs', defaultStatus: 'Beroperasi' },

  // 9. Alat Utama / Mesin Pancang (Pile Driver)
  { id: 'diesel_hammer', name: 'Diesel Hammer', category: 'Alat Utama / Mesin Pancang', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'hydraulic_hammer', name: 'Hydraulic Hammer', category: 'Alat Utama / Mesin Pancang', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'vibratory_hammer', name: 'Vibratory Hammer', category: 'Alat Utama / Mesin Pancang', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'hydraulic_jack_in_pile', name: 'Hydraulic Jack-In Pile (Injeksi)', category: 'Alat Utama / Mesin Pancang', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'drop_hammer', name: 'Drop Hammer', category: 'Alat Utama / Mesin Pancang', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },

  // 10. Mesin & Alat Pendukung
  { id: 'crane_crawler', name: 'Crane Crawler', category: 'Mesin & Alat Pendukung', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'tripod_rig', name: 'Tripod Rig', category: 'Mesin & Alat Pendukung', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_bor_bore_pile', name: 'Mesin Bor Bore Pile (Rotary Drilling Rig)', category: 'Mesin & Alat Pendukung', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'power_pack', name: 'Power Pack (Pompa Hidrolik)', category: 'Mesin & Alat Pendukung', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'kompresor_udara', name: 'Kompresor Udara', category: 'Mesin & Alat Pendukung', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'mesin_las', name: 'Mesin Las', category: 'Mesin & Alat Pendukung', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },

  // 11. Alat Bantu & Pengikat
  { id: 'sling_baja', name: 'Sling Baja (Wire Rope)', category: 'Alat Bantu & Pengikat', defaultQty: '4 Unit', defaultStatus: 'Beroperasi' },
  { id: 'shackle', name: 'Shackle (Segel / Belenggu)', category: 'Alat Bantu & Pengikat', defaultQty: '10 Pcs', defaultStatus: 'Beroperasi' },
  { id: 'pipa_tremie', name: 'Pipa Tremie', category: 'Alat Bantu & Pengikat', defaultQty: '1 Set', defaultStatus: 'Beroperasi' },
  { id: 'bucket_cor', name: 'Bucket Cor / Bucket Bor', category: 'Alat Bantu & Pengikat', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'casing_pipa_temporary', name: 'Casing Pipa Temporary', category: 'Alat Bantu & Pengikat', defaultQty: '4 Unit', defaultStatus: 'Beroperasi' },
  { id: 'pile_cap_protector', name: 'Pile Cap Protector (Bantalan Kepala Tiang)', category: 'Alat Bantu & Pengikat', defaultQty: '2 Pcs', defaultStatus: 'Beroperasi' },

  // 12. Alat Ukur & Pengujian (Tambahan)
  { id: 'theodolite_total_station', name: 'Theodolite / Total Station', category: 'Alat Ukur & Pengujian', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'piezometer', name: 'Piezometer', category: 'Alat Ukur & Pengujian', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'alat_uji_pda', name: 'Alat Uji PDA (Pile Driving Analyzer)', category: 'Alat Ukur & Pengujian', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },

  // 13. Alat Potong & Pembersihan
  { id: 'pile_cutter', name: 'Pile Cutter (Pemotong Kepala Tiang)', category: 'Alat Potong & Pembersihan', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
  { id: 'pompa_slurry', name: 'Pompa Slurry (Pompa Lumpur)', category: 'Alat Potong & Pembersihan', defaultQty: '2 Unit', defaultStatus: 'Beroperasi' },
  { id: 'excavator', name: 'Excavator', category: 'Alat Potong & Pembersihan', defaultQty: '1 Unit', defaultStatus: 'Beroperasi' },
];

interface DailyReportPageProps {
  project: Project;
  jobRoles: JobRole[];
  dailyRecords: DailyManpower[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
  currentUser?: UserProfile;
}

export const DailyReportPage: React.FC<DailyReportPageProps> = ({
  project,
  jobRoles,
  dailyRecords,
  selectedDate,
  onDateChange,
  addToast,
  currentUser,
}) => {
  // Report customizable fields
  const [rencanaM6, setRencanaM6] = useState<string>('1,755%');
  const [realisasiM6, setRealisasiM6] = useState<string>('3,483%');
  const [deviasiM6, setDeviasiM6] = useState<string>('1,728%');

  const [pekerjaanText, setPekerjaanText] = useState<string>('-');
  const [peralatanText, setPeralatanText] = useState<string>('');
  const [kendalaText, setKendalaText] = useState<string>('- material utama belum ada');
  const [cuacaText, setCuacaText] = useState<string>('- Pagi (07:00 - 12:00) : Cerah\n- Siang (12:00 - 15:00) : Cerah\n- Sore (15:00 - 17:00) : Cerah');
  const [materialMasukText, setMaterialMasukText] = useState<string>('- saat ini belum ada material masuk');
  const [saranText, setSaranText] = useState<string>('- Di tambah dudukan alas pijakan, agar pekerja lebih aman\n- lakukan mapping pekerjaan');

  // Weather Structured State (Opsi Select Pagi, Siang, Sore & Jam)
  const [weatherInputMode, setWeatherInputMode] = useState<'select' | 'manual'>('select');
  const [cuacaPagi, setCuacaPagi] = useState<string>('Cerah');
  const [cuacaSiang, setCuacaSiang] = useState<string>('Cerah');
  const [cuacaSore, setCuacaSore] = useState<string>('Cerah');
  const [jamPagi, setJamPagi] = useState<string>('07:00 - 12:00');
  const [jamSiang, setJamSiang] = useState<string>('12:00 - 15:00');
  const [jamSore, setJamSore] = useState<string>('15:00 - 17:00');

  const formatWeatherString = (pagi: string, siang: string, sore: string, jPagi: string, jSiang: string, jSore: string) => {
    return `- Pagi (${jPagi}) : ${pagi}\n- Siang (${jSiang}) : ${siang}\n- Sore (${jSore}) : ${sore}`;
  };

  const handleWeatherSelect = (timeSlot: 'pagi' | 'siang' | 'sore', val: string) => {
    let p = cuacaPagi;
    let s = cuacaSiang;
    let so = cuacaSore;
    if (timeSlot === 'pagi') {
      p = val;
      setCuacaPagi(val);
    } else if (timeSlot === 'siang') {
      s = val;
      setCuacaSiang(val);
    } else if (timeSlot === 'sore') {
      so = val;
      setCuacaSore(val);
    }
    setCuacaText(formatWeatherString(p, s, so, jamPagi, jamSiang, jamSore));
  };

  const handleWeatherTimeChange = (timeSlot: 'pagi' | 'siang' | 'sore', val: string) => {
    let jp = jamPagi;
    let js = jamSiang;
    let jso = jamSore;
    if (timeSlot === 'pagi') {
      jp = val;
      setJamPagi(val);
    } else if (timeSlot === 'siang') {
      js = val;
      setJamSiang(val);
    } else if (timeSlot === 'sore') {
      jso = val;
      setJamSore(val);
    }
    setCuacaText(formatWeatherString(cuacaPagi, cuacaSiang, cuacaSore, jp, js, jso));
  };

  const applyWeatherPreset = (pagi: string, siang: string, sore: string) => {
    setCuacaPagi(pagi);
    setCuacaSiang(siang);
    setCuacaSore(sore);
    setCuacaText(formatWeatherString(pagi, siang, sore, jamPagi, jamSiang, jamSore));
  };

  // Equipment Dropdown Select State (Nama Alat Saja Tanpa Volume)
  const [peralatanInputMode, setPeralatanInputMode] = useState<'select' | 'manual'>('select');
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);

  const updateEquipmentText = (ids: string[]) => {
    if (ids.length === 0) {
      setPeralatanText('- Belum ada peralatan tercatat');
      return;
    }
    const text = ids
      .map((id, index) => {
        const item = BUILDING_EQUIPMENT_LIST.find((e) => e.id === id);
        return `- ${index + 1}. ${item ? item.name : id}`;
      })
      .join('\n');
    setPeralatanText(text);
  };

  const applyEquipmentPreset = (presetType: 'lengkap_gedung' | 'struktur_beton' | 'finishing') => {
    let ids: string[] = [];
    if (presetType === 'lengkap_gedung') {
      ids = ['excavator', 'concrete_mixer', 'genset', 'scaffolding', 'plate_compactor'];
    } else if (presetType === 'struktur_beton') {
      ids = ['concrete_mixer', 'concrete_pump', 'concrete_vibrator', 'bar_bender_cutter', 'excavator'];
    } else if (presetType === 'finishing') {
      ids = ['scaffolding', 'welding_machine', 'water_pump', 'genset'];
    }
    setSelectedEquipmentIds(ids);
    updateEquipmentText(ids);
  };

  const [copied, setCopied] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [allSavedReports, setAllSavedReports] = useState<DailyReportNarrative[]>([]);
  
  // State for viewing report shape modal when clicking "Buka & Edit"
  const [viewingReportModal, setViewingReportModal] = useState<DailyReportNarrative | null>(null);
  const [modalCopied, setModalCopied] = useState<boolean>(false);

  // Google Drive & Photos State
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [photos, setPhotos] = useState<DriveDocumentationPhoto[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [captionInput, setCaptionInput] = useState<string>('');

  // Photo Staging State (Pratinjau sebelum simpan/unggah)
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // In-app Delete Confirmation Modal States (bypasses iframe window.confirm block)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const isSuperAdmin = currentUser ? isSuperAdminUser(currentUser.email, currentUser.id, currentUser.role) : false;

  useEffect(() => {
    // Sinkronisasi otomatis konfigurasi Google Drive Super Admin
    syncGoogleDriveConfigFromServer().then((cfg) => {
      if (cfg) {
        setGoogleUser({
          email: cfg.accountEmail || 'telokbedak204@gmail.com',
          displayName: cfg.accountName || 'Super Admin SIM-TK204',
        });
        setNeedsGoogleAuth(false);
      }
    });

    if (!isSuperAdmin) {
      setNeedsGoogleAuth(false);
      setGoogleUser({
        email: 'telokbedak204@gmail.com',
        displayName: 'Super Admin SIM-TK204',
      });
      return;
    }

    const unsubscribe = initGoogleAuth(
      (user) => {
        setGoogleUser(user);
        setNeedsGoogleAuth(false);
      },
      () => {
        setGoogleUser({
          email: 'telokbedak204@gmail.com',
          displayName: 'Super Admin SIM-TK204',
        });
        setNeedsGoogleAuth(false);
      }
    );
    return () => unsubscribe();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!project) return;
    const loadedPhotos = DataService.getDocumentationPhotos(project.id, selectedDate);
    setPhotos(loadedPhotos);
  }, [project, selectedDate]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setNeedsGoogleAuth(false);
        addToast('success', `Berhasil terhubung ke Google Drive (${res.user.email})`, 'Google Drive Terhubung');
      }
    } catch (err: any) {
      addToast('error', 'Gagal menghubungkan Google Drive: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle selecting a photo into local staging preview (without uploading immediately)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Hanya berkas gambar (JPG, PNG, WebP) yang diperbolehkan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setStagedFile(file);
      setStagedPreviewUrl(reader.result as string);
      if (!captionInput.trim()) {
        setCaptionInput('Dokumentasi Lapangan Proyek');
      }
      addToast('info', `Foto "${file.name}" siap ditinjau. Tekan tombol "Simpan & Unggah Foto" untuk menyimpan.`, 'Foto Dipilih');
    };
    reader.readAsDataURL(file);
  };

  // Cancel staged photo
  const handleCancelStaged = () => {
    setStagedFile(null);
    setStagedPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Explicit Save & Upload handler called by the user
  const handleSaveAndUpload = async () => {
    if (!stagedFile || !stagedPreviewUrl) {
      addToast('warning', 'Pilih foto dokumentasi terlebih dahulu sebelum menyimpan.');
      return;
    }

    setUploading(true);
    try {
      let driveFileId: string | undefined = undefined;
      let webViewLink: string | undefined = undefined;

      try {
        const driveResult = await uploadPhotoToGoogleDrive(
          stagedFile,
          stagedFile.name,
          stagedFile.type,
          captionInput.trim() || 'Dokumentasi Lapangan Proyek',
          project.code,
          selectedDate,
          stagedPreviewUrl
        );
        driveFileId = driveResult.fileId;
        webViewLink = driveResult.webViewLink;
      } catch (driveErr: any) {
        console.warn('Google Drive direct upload error:', driveErr);
        addToast('warning', `Foto disimpan lokal. Google Drive: ${driveErr.message}`, 'Google Drive');
      }

      const newPhoto: DriveDocumentationPhoto = {
        id: `photo-${Date.now()}-${Math.random()}`,
        project_id: project.id,
        work_date: selectedDate,
        file_name: stagedFile.name,
        file_size: stagedFile.size,
        mime_type: stagedFile.type,
        google_drive_file_id: driveFileId,
        web_view_link: webViewLink,
        data_url: stagedPreviewUrl,
        caption: captionInput.trim() || 'Dokumentasi Lapangan Proyek',
        uploaded_at: new Date().toISOString(),
      };

      DataService.saveDocumentationPhoto(newPhoto);
      setPhotos(DataService.getDocumentationPhotos(project.id, selectedDate));
      
      // Reset staging state
      setStagedFile(null);
      setStagedPreviewUrl(null);
      setCaptionInput('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploading(false);
      addToast(
        'success',
        driveFileId
          ? `Foto "${stagedFile.name}" berhasil diunggah langsung ke Google Drive dan tersimpan!`
          : 'Foto dokumentasi berhasil disimpan secara lokal!',
        'Foto Berhasil Disimpan'
      );
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      addToast('error', 'Gagal memproses foto: ' + err.message);
      setUploading(false);
    }
  };

  // Upload an existing photo to Google Drive (e.g. if saved before authenticating or simulated)
  const handleUploadExistingPhotoToDrive = async (photo: DriveDocumentationPhoto) => {
    if (!photo.data_url) {
      addToast('warning', 'Berkas foto tidak ditemukan di penyimpanan lokal.');
      return;
    }

    setUploading(true);
    try {
      const blob = dataUrlToBlob(photo.data_url);
      const driveResult = await uploadPhotoToGoogleDrive(
        blob,
        photo.file_name,
        photo.mime_type || 'image/jpeg',
        photo.caption,
        project.code,
        photo.work_date,
        photo.data_url
      );

      const updatedPhoto: DriveDocumentationPhoto = {
        ...photo,
        google_drive_file_id: driveResult.fileId,
        web_view_link: driveResult.webViewLink,
      };

      DataService.saveDocumentationPhoto(updatedPhoto);
      setPhotos(DataService.getDocumentationPhotos(project.id, selectedDate));
      addToast(
        'success',
        `Foto "${photo.file_name}" telah berhasil diunggah ke Google Drive!`,
        'Tersimpan di Google Drive'
      );
    } catch (err: any) {
      console.error('Error uploading existing photo to drive:', err);
      addToast('error', 'Gagal mengunggah ke Google Drive: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotoToDelete(photoId);
  };

  const confirmDeletePhoto = (photoId: string) => {
    DataService.deleteDocumentationPhoto(photoId);
    setPhotos(DataService.getDocumentationPhotos(project.id, selectedDate));
    addToast('info', 'Foto dokumentasi berhasil dihapus.');
    setPhotoToDelete(null);
  };

  const handleDeleteArchivedReport = (workDate: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReportToDelete(workDate);
  };

  const confirmDeleteArchivedReport = (workDate: string) => {
    DataService.deleteDailyReportNarrative(project.id, workDate);
    const updated = DataService.getAllDailyReportNarratives(project.id);
    setAllSavedReports(updated);
    addToast('success', `Laporan harian tanggal ${formatDateIndo(workDate)} berhasil dihapus dari arsip.`);

    if (viewingReportModal && viewingReportModal.work_date === workDate) {
      setViewingReportModal(null);
    }
    setReportToDelete(null);
  };

  // Load saved narrative whenever project or selectedDate changes
  useEffect(() => {
    if (!project) return;
    const existing = DataService.getDailyReportNarrative(project.id, selectedDate);
    if (existing) {
      setRencanaM6(existing.rencana_m6 || '1,755%');
      setRealisasiM6(existing.realisasi_m6 || '3,483%');
      setDeviasiM6(existing.deviasi_m6 || '1,728%');
      setPekerjaanText(existing.pekerjaan || '-');
      setPeralatanText(existing.peralatan || '');
      setKendalaText(existing.kendala || '-');
      const loadedCuaca = existing.cuaca || formatWeatherString('Cerah', 'Cerah', 'Cerah', '07:00 - 12:00', '12:00 - 15:00', '15:00 - 17:00');
      setCuacaText(loadedCuaca);

      // Check if structured matching exists
      const pagiMatch = loadedCuaca.match(/Pagi\s*\(([^)]+)\)\s*:\s*([^\n]+)/i);
      const siangMatch = loadedCuaca.match(/Siang\s*\(([^)]+)\)\s*:\s*([^\n]+)/i);
      const soreMatch = loadedCuaca.match(/Sore\s*\(([^)]+)\)\s*:\s*([^\n]+)/i);
      if (pagiMatch) {
        setJamPagi(pagiMatch[1].trim());
        setCuacaPagi(pagiMatch[2].trim());
      }
      if (siangMatch) {
        setJamSiang(siangMatch[1].trim());
        setCuacaSiang(siangMatch[2].trim());
      }
      if (soreMatch) {
        setJamSore(soreMatch[1].trim());
        setCuacaSore(soreMatch[2].trim());
      }
      setMaterialMasukText(existing.material_masuk || '-');
      setSaranText(existing.saran || '-');
    } else {
      const defaultCuaca = formatWeatherString('Cerah', 'Cerah', 'Cerah', '07:00 - 12:00', '12:00 - 15:00', '15:00 - 17:00');
      setCuacaPagi('Cerah');
      setCuacaSiang('Cerah');
      setCuacaSore('Cerah');
      setJamPagi('07:00 - 12:00');
      setJamSiang('12:00 - 15:00');
      setJamSore('15:00 - 17:00');
      setCuacaText(defaultCuaca);

      if (selectedDate === '2026-10-11') {
        setRencanaM6('1,755%');
        setRealisasiM6('3,483%');
        setDeviasiM6('1,728%');
        setPekerjaanText('-');
        setPeralatanText('');
        setSelectedEquipmentIds([]);
        setKendalaText('- material utama belum ada');
        setMaterialMasukText('- saat ini belum ada material masuk');
        setSaranText('- Di tambah dudukan alas pijakan, agar pekerja lebih aman\n- lakukan mapping pekerjaan');
      } else {
        setRencanaM6('1,500%');
        setRealisasiM6('1,500%');
        setDeviasiM6('0,000%');
        setPekerjaanText('- Pekerjaan persiapan & struktur konstruksi');
        setPeralatanText('');
        setSelectedEquipmentIds([]);
        setKendalaText('- Nihil');
        setMaterialMasukText('- Belum ada');
        setSaranText('- Utamakan K3 dan kebersihan area kerja');
      }
    }
    // Load all reports for history list
    setAllSavedReports(DataService.getAllDailyReportNarratives(project.id));
  }, [project, selectedDate]);

  // Handle explicit Save
  const handleSaveReport = () => {
    if (!project) return;
    const narrative: DailyReportNarrative = {
      project_id: project.id,
      work_date: selectedDate,
      rencana_m6: rencanaM6,
      realisasi_m6: realisasiM6,
      deviasi_m6: deviasiM6,
      pekerjaan: pekerjaanText,
      peralatan: peralatanText,
      kendala: kendalaText,
      cuaca: cuacaText,
      material_masuk: materialMasukText,
      saran: saranText,
      updated_at: new Date().toISOString(),
    };
    DataService.saveDailyReportNarrative(narrative);
    setAllSavedReports(DataService.getAllDailyReportNarratives(project.id));
    addToast('success', `Laporan harian tanggal ${formatDateIndo(selectedDate)} berhasil disimpan ke Arsip & LocalStorage!`, 'Penyimpanan Berhasil');
  };

  // Active roles
  const activeRoles = jobRoles.filter((r) => r.is_active).sort((a, b) => a.sort_order - b.sort_order);

  // Records for selected date
  const recordsForDate = dailyRecords.filter((r) => r.work_date === selectedDate);

  // Build manpower lines dynamically for current state
  const manpowerLines = activeRoles.map((role) => {
    const rec = recordsForDate.find((r) => r.job_role_id === role.id);
    const cnt = rec ? Number(rec.worker_count) || 0 : 0;
    return `- ${role.name} = ${cnt} orang`;
  }).join('\n');

  const dayName = getDayNameIndo(selectedDate);
  const dateFull = formatDateIndoFull(selectedDate);
  const spmkDate = project.spmk_date ? formatDateIndoFull(project.spmk_date) : (project.start_date ? formatDateIndoFull(project.start_date) : '28 Agustus 2026');
  const consultantName = project.consultant_name || 'PT. Arcansia Dwitama Konsultan KSO PT. Teknik Eksakta';

  const fullReportText = `${project.name}
----------------------------------------
Hari, Tanggal : ${dayName}, ${dateFull}
----------------------------------------
Mulai kerja berdasarkan SPMK = ${spmkDate}
-----------------------------------------
Rencana M6  : ${rencanaM6}
Realisasi M6 : ${realisasiM6}
Deviasi  M6    :  ${deviasiM6}

A. Pekerjaan
${pekerjaanText}

B. Peralatan
${peralatanText || '-'}

C. Kendala di lapangan
${kendalaText}

D. Laporan Cuaca 
${cuacaText}

E. Jumlah Tenaga Kerja :
${manpowerLines || '-'}

F. Material masuk
${materialMasukText}

G. Saran/Instruksi
${saranText}

Terima kasih
${consultantName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    addToast('success', 'Uraian teks laporan harian berhasil disalin ke clipboard!', 'Tersalin');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleExportPDF = (targetNarrative?: DailyReportNarrative, targetDate?: string) => {
    setIsExportingPDF(true);
    try {
      const activeDate = targetDate || selectedDate;
      const nar = targetNarrative || {
        project_id: project.id,
        work_date: activeDate,
        rencana_m6: rencanaM6,
        realisasi_m6: realisasiM6,
        deviasi_m6: deviasiM6,
        pekerjaan: pekerjaanText,
        peralatan: peralatanText,
        kendala: kendalaText,
        cuaca: cuacaText,
        material_masuk: materialMasukText,
        saran: saranText,
        updated_at: new Date().toISOString(),
      };

      const docPhotos = targetDate && targetDate !== selectedDate
        ? DataService.getDocumentationPhotos(project.id, targetDate)
        : photos;

      const fileName = exportDailyReportToPDF({
        project,
        selectedDate: activeDate,
        dailyRecords,
        jobRoles,
        narrative: nar,
        photos: docPhotos,
        consultantName: project.consultant_name,
        recorderName: project.site_manager,
        inspectorName: project.inspector_name,
      });

      addToast('success', `Laporan harian PDF resmi berhasil diunduh (${fileName})`, 'PDF Berhasil Dibuat');
    } catch (err: any) {
      console.error('Error generating Daily Report PDF:', err);
      addToast('error', 'Gagal membuat dokumen PDF: ' + (err.message || 'Error'));
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Helper to generate full report text for any archived narrative
  const getReportTextForNarrative = (rep: DailyReportNarrative) => {
    const dName = getDayNameIndo(rep.work_date);
    const dFull = formatDateIndoFull(rep.work_date);
    const sDate = project.start_date ? formatDateIndoFull(project.start_date) : '28 Agustus 2026';
    const recs = dailyRecords.filter((r) => r.work_date === rep.work_date);
    const mLines = activeRoles.map((role) => {
      const rec = recs.find((r) => r.job_role_id === role.id);
      const cnt = rec ? Number(rec.worker_count) || 0 : 0;
      return `- ${role.name} = ${cnt} orang`;
    }).join('\n');

    return `${project.name}
----------------------------------------
Hari, Tanggal : ${dName}, ${dFull}
----------------------------------------
Mulai kerja berdasarkan SPMK = ${sDate}
-----------------------------------------
Rencana M6  : ${rep.rencana_m6 || '1,755%'}
Realisasi M6 : ${rep.realisasi_m6 || '3,483%'}
Deviasi  M6    :  ${rep.deviasi_m6 || '1,728%'}

A. Pekerjaan
${rep.pekerjaan || '-'}

B. Peralatan
${rep.peralatan || '-'}

C. Kendala di lapangan
${rep.kendala || '-'}

D. Laporan Cuaca 
${rep.cuaca || '-'}

E. Jumlah Tenaga Kerja :
${mLines || '-'}

F. Material masuk
${rep.material_masuk || '-'}

G. Saran/Instruksi
${rep.saran || '-'}

Terima kasih
${consultantName}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#142B4A] to-[#1e3a60] rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Manajemen Laporan Harian Lapangan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">{project.name}</h1>
          <p className="text-slate-300 text-xs mt-1">
            Susun, pratinjau, dan arsipkan laporan harian konsultan pengawas secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleExportPDF()}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? 'Membuat PDF...' : 'Unduh Laporan Harian (PDF)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors border border-white/10 shadow-sm"
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
            <span>Arsip Semua Laporan ({allSavedReports.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Left Editor & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Form Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Parameter Laporan Harian
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-[#F28C28]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rencana M6</label>
              <input
                type="text"
                value={rencanaM6}
                onChange={(e) => setRencanaM6(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Realisasi M6</label>
              <input
                type="text"
                value={realisasiM6}
                onChange={(e) => setRealisasiM6(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deviasi M6</label>
              <input
                type="text"
                value={deviasiM6}
                onChange={(e) => setDeviasiM6(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                A. Pekerjaan (Uraian progres harian)
              </label>
              <textarea
                rows={2}
                value={pekerjaanText}
                onChange={(e) => setPekerjaanText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
                placeholder="- Pekerjaan galian / pengecoran..."
              />
            </div>

            {/* B. Peralatan (Alat berat & pendukung) dengan Opsi Select & Preset Alat Gedung */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-bold text-slate-800">
                    B. Peralatan (Alat berat & pendukung pekerjaan Gedung)
                  </label>
                </div>
                {/* Switcher Mode: Select Opsi vs Teks Bebas */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPeralatanInputMode('select')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      peralatanInputMode === 'select'
                        ? 'bg-[#142B4A] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Opsi Select Alat
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeralatanInputMode('manual')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      peralatanInputMode === 'manual'
                        ? 'bg-[#142B4A] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Edit Teks Bebas
                  </button>
                </div>
              </div>

              {peralatanInputMode === 'select' ? (
                <div className="space-y-3">
                  {/* Dropdown Select (Seperti Gambar Contoh) */}
                  <div>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !selectedEquipmentIds.includes(val)) {
                          const next = [...selectedEquipmentIds, val];
                          setSelectedEquipmentIds(next);
                          updateEquipmentText(next);
                        }
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-[#F28C28] focus:outline-hidden cursor-pointer shadow-2xs"
                    >
                      <option value="" disabled>
                        Pilih alat berat atau pendukung...
                      </option>
                      {BUILDING_EQUIPMENT_LIST.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Equipment Tags / Chips List */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedEquipmentIds.map((id, index) => {
                      const item = BUILDING_EQUIPMENT_LIST.find((e) => e.id === id);
                      if (!item) return null;
                      return (
                        <div
                          key={id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs"
                        >
                          <span>{index + 1}. {item.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = selectedEquipmentIds.filter((i) => i !== id);
                              setSelectedEquipmentIds(next);
                              updateEquipmentText(next);
                            }}
                            className="w-4 h-4 rounded-full hover:bg-blue-200 text-blue-700 flex items-center justify-center text-xs transition-colors cursor-pointer"
                            title="Hapus alat"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    {selectedEquipmentIds.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Belum ada alat dipilih dari dropdown.</span>
                    )}
                  </div>



                  {/* Teks Peralatan Terformat */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs mt-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Format Teks Laporan Peralatan:
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                      {peralatanText}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    value={peralatanText}
                    onChange={(e) => setPeralatanText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:border-[#F28C28] focus:outline-hidden"
                    placeholder="Contoh: - 1. Excavator (1 Unit) - Kondisi: Beroperasi\n- 2. Molen Beton (2 Unit) - Kondisi: Beroperasi"
                  />
                  <p className="text-[10px] text-slate-400">
                    Mode teks manual aktif. Anda bebas mengetikkan keterangan peralatan sesuai kondisi di lapangan.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                C. Kendala di lapangan
              </label>
              <textarea
                rows={2}
                value={kendalaText}
                onChange={(e) => setKendalaText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
                placeholder="- material utama belum ada"
              />
            </div>

            {/* D. Laporan Cuaca dengan Opsi Select Pagi, Siang, Sore & Jam */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <SunMedium className="w-4 h-4 text-amber-500" />
                  <label className="text-xs font-bold text-slate-800">
                    D. Laporan Cuaca (Pagi, Siang, Sore)
                  </label>
                </div>
                {/* Switcher Mode: Select Opsi vs Teks Bebas */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setWeatherInputMode('select')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      weatherInputMode === 'select'
                        ? 'bg-[#142B4A] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Opsi Select Jam
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherInputMode('manual')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      weatherInputMode === 'manual'
                        ? 'bg-[#142B4A] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Edit Teks Bebas
                  </button>
                </div>
              </div>

              {weatherInputMode === 'select' ? (
                <div className="space-y-3">
                  {/* Grid 3 Kolom: Pagi, Siang, Sore */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Waktu Pagi */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5" /> Pagi
                        </span>
                        <input
                          type="text"
                          value={jamPagi}
                          onChange={(e) => handleWeatherTimeChange('pagi', e.target.value)}
                          className="text-[10px] font-mono px-1.5 py-0.5 w-24 text-right bg-slate-50 border border-slate-200 rounded text-slate-600 focus:outline-hidden"
                          title="Jam Pagi"
                        />
                      </div>
                      <select
                        value={cuacaPagi}
                        onChange={(e) => handleWeatherSelect('pagi', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-[#F28C28] focus:outline-hidden"
                      >
                        {WEATHER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Waktu Siang */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-orange-600 flex items-center gap-1">
                          <SunMedium className="w-3.5 h-3.5" /> Siang
                        </span>
                        <input
                          type="text"
                          value={jamSiang}
                          onChange={(e) => handleWeatherTimeChange('siang', e.target.value)}
                          className="text-[10px] font-mono px-1.5 py-0.5 w-24 text-right bg-slate-50 border border-slate-200 rounded text-slate-600 focus:outline-hidden"
                          title="Jam Siang"
                        />
                      </div>
                      <select
                        value={cuacaSiang}
                        onChange={(e) => handleWeatherSelect('siang', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-[#F28C28] focus:outline-hidden"
                      >
                        {WEATHER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Waktu Sore */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                          <CloudSun className="w-3.5 h-3.5" /> Sore
                        </span>
                        <input
                          type="text"
                          value={jamSore}
                          onChange={(e) => handleWeatherTimeChange('sore', e.target.value)}
                          className="text-[10px] font-mono px-1.5 py-0.5 w-24 text-right bg-slate-50 border border-slate-200 rounded text-slate-600 focus:outline-hidden"
                          title="Jam Sore"
                        />
                      </div>
                      <select
                        value={cuacaSore}
                        onChange={(e) => handleWeatherSelect('sore', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-[#F28C28] focus:outline-hidden"
                      >
                        {WEATHER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tombol Pilihan Cepat (Presets) */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                    <span className="text-slate-500 font-medium">Pilihan Cepat:</span>
                    <button
                      type="button"
                      onClick={() => applyWeatherPreset('Cerah', 'Cerah', 'Cerah')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      ☀️ Seharian Cerah
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWeatherPreset('Cerah Berawan', 'Cerah Berawan', 'Cerah Berawan')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      ⛅ Cerah Berawan
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWeatherPreset('Cerah', 'Cerah Berawan', 'Hujan Ringan / Gerimis')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      🌦️ Sore Gerimis/Hujan
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWeatherPreset('Berawan', 'Hujan Sedang / Lebat', 'Hujan Sedang / Lebat')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      🌧️ Siang-Sore Hujan
                    </button>
                  </div>

                  {/* Teks Cuaca Terformat */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Format Teks Laporan Cuaca:
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                      {cuacaText}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    value={cuacaText}
                    onChange={(e) => setCuacaText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:border-[#F28C28] focus:outline-hidden"
                    placeholder="Contoh: - Pagi (07:00 - 12:00) : Cerah\n- Siang (12:00 - 15:00) : Cerah\n- Sore (15:00 - 17:00) : Hujan"
                  />
                  <p className="text-[10px] text-slate-400">
                    Mode teks manual aktif. Anda bebas mengetikkan keterangan cuaca sesuai kondisi di lapangan.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                F. Material masuk
              </label>
              <input
                type="text"
                value={materialMasukText}
                onChange={(e) => setMaterialMasukText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                G. Saran / Instruksi
              </label>
              <textarea
                rows={3}
                value={saranText}
                onChange={(e) => setSaranText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#F28C28] focus:outline-hidden"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleExportPDF()}
                disabled={isExportingPDF}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Unduh Laporan Harian versi PDF Resmi (Teks & Foto Dokumentasi)"
              >
                <Download className="w-4 h-4 text-[#F28C28]" />
                <span>{isExportingPDF ? 'Membuat PDF...' : 'Cetak / Unduh PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveReport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142B4A] hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Simpan Laporan Tanggal {formatDateIndo(selectedDate)}</span>
              </button>
            </div>
          </div>

          {/* Google Drive Photo Documentation Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Dokumentasi Foto Lapangan (Google Drive)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Unggah foto progres dan simpan otomatis ke Google Drive.
                  </p>
                </div>
              </div>

              {!isSuperAdmin ? (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Terhubung Otomatis ke Google Drive (Super Admin: {googleUser?.email || 'telokbedak204@gmail.com'})</span>
                </div>
              ) : needsGoogleAuth ? (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4285F4] hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isLoggingIn ? 'Menghubungkan...' : 'Hubungkan Google Drive'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-[150px]">{googleUser?.email || 'telokbedak204@gmail.com'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 cursor-pointer"
                    title="Ganti / Perbarui Akun Google Drive"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoggingIn ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Input & Staging Photo Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Caption Foto Dokumentasi
                </label>
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="Cth: Pengecoran lantai 2 area zonasi A"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#F28C28]"
                />
              </div>

              {/* STAGING ACTIVE: Pratinjau foto terpilih sebelum disimpan */}
              {stagedFile && stagedPreviewUrl ? (
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Pratinjau Foto Terpilih (Belum Disimpan)
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Pastikan foto sudah sesuai sebelum disimpan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Thumbnail preview */}
                    <div className="sm:col-span-5 h-44 rounded-xl overflow-hidden bg-slate-900 border border-amber-200 relative group shadow-xs">
                      <img
                        src={stagedPreviewUrl}
                        alt="Pratinjau Foto"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/75 to-transparent p-2 text-white text-[10px] truncate">
                        {stagedFile.name}
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="sm:col-span-7 space-y-3">
                      <div className="bg-white/80 rounded-xl p-3 border border-amber-200 space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Nama Berkas:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[180px]">{stagedFile.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Ukuran:</span>
                          <span className="font-semibold text-slate-800">{(stagedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Tanggal Laporan:</span>
                          <span className="font-semibold text-slate-800">{formatDateIndo(selectedDate)}</span>
                        </div>
                      </div>

                      {/* Tombol Aksi Utama: Simpan & Unggah */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handleSaveAndUpload}
                          disabled={uploading}
                          className="flex-1 min-w-[190px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        >
                          {uploading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Sedang Mengunggah & Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Simpan & Unggah Foto</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelStaged}
                          disabled={uploading}
                          className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Batal pilih foto"
                        >
                          <X className="w-4 h-4 text-slate-500" />
                          <span>Batal</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STAGING INACTIVE: Picker Area & Standby Save Button */
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2.5 px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#F28C28] bg-slate-50 hover:bg-orange-50/50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Camera className="w-5 h-5 text-[#F28C28]" />
                      <div className="text-center sm:text-left">
                        <span className="text-xs font-bold text-slate-800 block">
                          Pilih Foto Dokumentasi Lapangan
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Pilih berkas dari galeri atau kamera (foto tidak langsung terunggah)
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Tombol Simpan & Unggah Standby State */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-3">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Pilih foto terlebih dahulu untuk mengaktifkan tombol simpan & unggah.</span>
                    </div>
                    <button
                      type="button"
                      disabled={true}
                      className="opacity-60 cursor-not-allowed flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-200 text-slate-500 text-xs font-bold"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan & Unggah Foto</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Photos Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Foto Dokumentasi ({photos.length})
              </h4>
              {photos.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Belum ada foto dokumentasi diunggah untuk tanggal {formatDateIndo(selectedDate)}.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((p) => {
                    const isRealOnDrive = Boolean(p.google_drive_file_id && !p.google_drive_file_id.startsWith('simulated-'));
                    return (
                      <div key={p.id} className="relative group bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col">
                        <div className="h-28 bg-slate-200 overflow-hidden relative">
                          {p.data_url ? (
                            <img src={p.data_url} alt={p.file_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Foto</div>
                          )}
                          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            {p.web_view_link && (
                              <a
                                href={p.web_view_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-blue-600 text-white rounded-md shadow-xs hover:bg-blue-700"
                                title="Buka di Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(p.id)}
                              className="p-1 bg-rose-600 text-white rounded-md shadow-xs hover:bg-rose-700 cursor-pointer"
                              title="Hapus Foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-2 bg-white flex-1 flex flex-col justify-between">
                          <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">{p.caption}</p>
                          <div className="flex items-center justify-between mt-1 text-[9px]">
                            <span className="truncate text-slate-400 max-w-[85px]">{p.file_name}</span>
                            {isRealOnDrive ? (
                              <a
                                href={p.web_view_link || `https://drive.google.com/file/d/${p.google_drive_file_id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 font-bold flex items-center gap-0.5 hover:underline"
                                title="Buka berkas ini di Google Drive"
                              >
                                <span>Drive ☁️</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUploadExistingPhotoToDrive(p)}
                                disabled={uploading}
                                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Unggah berkas foto ini ke Google Drive Anda sekarang"
                              >
                                <CloudUpload className="w-2.5 h-2.5 text-blue-600" />
                                <span>Unggah ke Drive</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">Pratinjau Uraian Teks Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportPDF()}
                  disabled={isExportingPDF}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                  title="Unduh Laporan Harian versi PDF Resmi (Teks & Foto Dokumentasi)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPDF ? 'PDF...' : 'Unduh PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>
            </div>

            <div className="mt-3 max-h-[500px] overflow-y-auto pr-1">
              <pre className="whitespace-pre-wrap text-[11px] font-mono text-slate-300 leading-relaxed">
                {fullReportText}
              </pre>
            </div>

            {copied && (
              <div className="mt-3 p-2.5 bg-emerald-900/60 border border-emerald-500/40 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Berhasil disalin ke clipboard! Siap ditempel di WhatsApp atau laporan.</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-4 text-xs text-blue-900 space-y-2">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <span>Dimana Laporan Ini Tersimpan?</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Semua laporan harian yang Anda simpan tersimpan otomatis di dalam <strong>Arsip Sistem (LocalStorage & Cloud)</strong> per tanggal masing-masing. Klik tombol <strong>"Arsip Semua Laporan"</strong> di atas untuk melihat, memuat ulang, atau meninjau seluruh riwayat harian sebelumnya.
            </p>
          </div>
        </div>
      </div>

      {/* Daftar Kartu Laporan Harian (No Urut, Edit, Hapus, View) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#142B4A] text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">Daftar & Riwayat Laporan Harian</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black">
                  {allSavedReports.length} Hari Laporan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar lengkap laporan harian yang tersimpan ({allSavedReports.length} hari terdata). Tersedia tombol Edit, Hapus, dan View pada setiap kartu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#142B4A]" />
              <span>Buka Modal Arsip</span>
            </button>
          </div>
        </div>

        {allSavedReports.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Belum ada laporan harian yang tersimpan di arsip. Klik "Simpan Laporan" pada tanggal terkait.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {allSavedReports.map((rep, idx) => (
              <div
                key={`page-card-${rep.work_date}`}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  rep.work_date === selectedDate
                    ? 'bg-amber-50/70 border-[#F28C28] ring-1 ring-[#F28C28]/30 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* No Urut & Info */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 shadow-2xs ${
                    rep.work_date === selectedDate ? 'bg-[#F28C28] text-white' : 'bg-[#142B4A] text-white'
                  }`}>
                    <span className="text-[8px] text-amber-300 font-bold uppercase leading-none">NO</span>
                    <span className="text-xs font-mono font-bold leading-none mt-0.5">{idx + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#142B4A] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {formatDateIndo(rep.work_date)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({getDayNameIndo(rep.work_date)})
                      </span>
                      {rep.work_date === selectedDate && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                          Sedang Aktif Dipilih
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Hari Ke-{allSavedReports.length - idx}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      <strong>Pekerjaan:</strong> {rep.pekerjaan || '-'} | <strong>Deviasi:</strong> {rep.deviasi_m6 || '-'}
                    </p>
                  </div>
                </div>

                {/* Tombol Edit, Hapus, dan View */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Tombol Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      onDateChange(rep.work_date);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      addToast('info', `Laporan harian tanggal ${formatDateIndo(rep.work_date)} siap diedit.`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    title={`Edit laporan tanggal ${formatDateIndo(rep.work_date)}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Tombol Hapus */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteArchivedReport(rep.work_date, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors border border-rose-200 text-xs font-bold shadow-2xs cursor-pointer"
                    title={`Hapus arsip laporan tanggal ${formatDateIndo(rep.work_date)}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>

                  {/* Tombol View */}
                  <button
                    type="button"
                    onClick={() => {
                      setViewingReportModal(rep);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                    title={`Lihat pratinjau lengkap laporan tanggal ${formatDateIndo(rep.work_date)}`}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Modal / Drawer for All Previous Reports */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold">Arsip Riwayat Laporan Harian Sebelumnya</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black">
                      {allSavedReports.length} Hari Laporan
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Daftar lengkap laporan harian yang tersimpan ({allSavedReports.length} hari terdata untuk proyek ini).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50">
              {allSavedReports.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Belum ada laporan harian yang tersimpan di arsip. Klik "Simpan Laporan" pada tanggal terkait.
                </div>
              ) : (
                allSavedReports.map((rep, idx) => (
                  <div
                    key={rep.work_date}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {/* Nomor Urut */}
                      <div className="w-8 h-8 rounded-lg bg-[#142B4A] text-white flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="text-[8px] text-amber-300 font-bold uppercase leading-none">NO</span>
                        <span className="text-xs font-mono font-bold leading-none mt-0.5">{idx + 1}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#142B4A] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {formatDateIndo(rep.work_date)}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({getDayNameIndo(rep.work_date)})
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Hari Ke-{allSavedReports.length - idx}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          <strong>Pekerjaan:</strong> {rep.pekerjaan || '-'} | <strong>Deviasi:</strong> {rep.deviasi_m6 || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Tombol Edit, Hapus, dan View */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          onDateChange(rep.work_date);
                          setShowHistoryModal(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          addToast('info', `Laporan harian tanggal ${formatDateIndo(rep.work_date)} siap diedit.`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                        title={`Edit laporan tanggal ${formatDateIndo(rep.work_date)}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteArchivedReport(rep.work_date, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors border border-rose-200 text-xs font-bold shadow-2xs cursor-pointer"
                        title={`Hapus arsip laporan tanggal ${formatDateIndo(rep.work_date)}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewingReportModal(rep);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                        title={`Lihat pratinjau lengkap laporan tanggal ${formatDateIndo(rep.work_date)}`}
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-slate-600 font-semibold">
                Total Tersimpan: <span className="font-bold text-[#F28C28]">{allSavedReports.length}</span> Hari Laporan
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Arsip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report View Shape Modal (Pratinjau Bentuk Laporan saat Buka & Edit / Lihat View diklik) */}
      {viewingReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-700">
            <div className="bg-slate-800 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-amber-400">
                    Pratinjau Bentuk Laporan — {formatDateIndo(viewingReportModal.work_date)}
                  </h3>
                  <p className="text-xs text-slate-300">Format resmi uraian laporan harian siap kirim WhatsApp.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReportModal(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950">
              <pre className="whitespace-pre-wrap text-xs font-mono text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800 shadow-inner">
                {getReportTextForNarrative(viewingReportModal)}
              </pre>

              {modalCopied && (
                <div className="mt-3 p-2.5 bg-emerald-900/80 border border-emerald-500/40 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Berhasil disalin ke clipboard!</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const text = getReportTextForNarrative(viewingReportModal);
                    navigator.clipboard.writeText(text);
                    setModalCopied(true);
                    addToast('success', 'Uraian laporan berhasil disalin!');
                    setTimeout(() => setModalCopied(false), 2500);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-md"
                >
                  <Copy className="w-4 h-4" />
                  <span>Salin Teks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = getReportTextForNarrative(viewingReportModal);
                    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(waUrl, '_blank');
                    addToast('success', 'Membuka WhatsApp untuk mengirim laporan!');
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim ke WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportPDF(viewingReportModal, viewingReportModal.work_date)}
                  disabled={isExportingPDF}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                  title="Unduh Laporan Harian versi PDF Resmi (Teks & Foto)"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingPDF ? 'Membuat PDF...' : 'Unduh PDF'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDeleteArchivedReport(viewingReportModal.work_date)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white text-xs font-bold transition-colors border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
                  title="Hapus laporan ini dari arsip"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hapus</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDateChange(viewingReportModal.work_date);
                    setViewingReportModal(null);
                    setShowHistoryModal(false);
                    addToast('info', `Tanggal ${formatDateIndo(viewingReportModal.work_date)} dimuat ke editor utama.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#142B4A] hover:bg-slate-800 text-white text-xs font-bold transition-colors border border-slate-700"
                >
                  Muat ke Editor & Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReportModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Tutup View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Laporan Harian (In-App Modal) */}
      {reportToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus Arsip Laporan Harian?</h3>
                <p className="text-xs text-slate-500">
                  Tanggal: <strong className="text-slate-700">{formatDateIndo(reportToDelete)}</strong> ({getDayNameIndo(reportToDelete)})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Apakah Anda yakin ingin menghapus data laporan harian ini dari riwayat arsip? Data yang telah dihapus tidak dapat dipulihkan kembali.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteArchivedReport(reportToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Foto Dokumentasi (In-App Modal) */}
      {photoToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus Foto Dokumentasi?</h3>
                <p className="text-xs text-slate-500">Foto akan dihapus dari daftar tanggal ini.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => confirmDeletePhoto(photoToDelete)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
