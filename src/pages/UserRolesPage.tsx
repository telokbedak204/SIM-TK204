import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  UserPlus,
  Trash2,
  KeyRound,
  Building2,
  AlertTriangle,
  BadgeCheck,
  Edit3,
  Key,
  Eye,
  EyeOff,
  LogOut,
  LogIn,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { DataService } from '../services/dataService';

interface UserRolesPageProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
  onUpdateCurrentUser?: (user: UserProfile) => void;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  password?: string;
  is_active: boolean;
}

const KEY_SYSTEM_USERS = 'sim_tk204_system_users';

const INITIAL_SYSTEM_USERS: SystemUser[] = [
  { id: 'usr-1', name: 'Super Admin', email: 'telokbedak204@gmail.com', role: 'admin', company: 'PT. Bahtera Karya Anambas', password: 'qweasd123', is_active: true },
  { id: 'usr-2', name: 'Rian Pratama, ST', email: 'rian.site@simtk204.id', role: 'project_manager', company: 'PT. Teknik Eksakta', password: 'password123', is_active: true },
  { id: 'usr-3', name: 'Ahmad Faisal', email: 'faisal.admin@simtk204.id', role: 'editor', company: 'PT. Teknik Eksakta', password: 'password123', is_active: true },
  { id: 'usr-4', name: 'Dedi Kurniawan, ST', email: 'dedi.mk@simtk204.id', role: 'viewer', company: 'PT. Arcansia Dwitama Konsultan', password: 'password123', is_active: true },
  { id: 'usr-5', name: 'Guntur, ST', email: 'tukangpipa672@gmail.com', role: 'editor', company: 'PT. Arcansia Dwitama Konsultan KSO PT. Teknik Eksakta', password: 'Loka123', is_active: true },
];

export const UserRolesPage: React.FC<UserRolesPageProps> = ({
  currentUser,
  onRoleChange,
  addToast,
  onUpdateCurrentUser,
  onLogout,
  onOpenLogin,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [users, setUsers] = useState<SystemUser[]>(() => {
    if (typeof window === 'undefined') return INITIAL_SYSTEM_USERS;
    try {
      const raw = localStorage.getItem(KEY_SYSTEM_USERS);
      return raw ? JSON.parse(raw) : INITIAL_SYSTEM_USERS;
    } catch {
      return INITIAL_SYSTEM_USERS;
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<SystemUser | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<SystemUser | null>(null);

  // Form states for Add
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('editor');
  const [newCompany, setNewCompany] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Form states for Edit
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('editor');
  const [editCompany, setEditCompany] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Form states for Edit Password Quick Modal
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY_SYSTEM_USERS, JSON.stringify(users));
  }, [users]);

  const roleDetails: Record<UserRole, { label: string; badge: string; desc: string; permissions: string[] }> = {
    admin: {
      label: 'Administrator',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Akses penuh sistem, manajemen password seluruh user, hak akses RBAC, migrasi SQL, dan database.',
      permissions: ['Atur Password & Akun Pengguna', 'Kelola Proyek & Pengaturan Sistem', 'Input & Edit Semua Data Harian', 'Export & Hapus Data Penuh'],
    },
    project_manager: {
      label: 'Project Manager (PM)',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Mengelola jadwal proyek, persetujuan laporan harian dan mingguan, serta pengawasan tenaga kerja.',
      permissions: ['Tambah & Edit Proyek Konstruksi', 'Validasi & Arsip Laporan Harian', 'Export Laporan PDF & Excel', 'Kelola Master Jabatan'],
    },
    site_engineer: {
      label: 'Site Engineer / Ahli Teknik',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      desc: 'Mengawasi teknis pelaksanaan konstruksi, mutu pekerjaan, dan spesifikasi struktur.',
      permissions: ['Input & Review Data Teknis', 'Validasi Laporan Harian', 'Monitoring Kualitas Pekerjaan', 'Export Laporan Lapangan'],
    },
    hse_officer: {
      label: 'Ahli K3 / HSE Officer',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Bertanggung jawab atas Keselamatan dan Kesehatan Kerja (K3) serta APD di lokasi proyek.',
      permissions: ['Catat Catatan & Kendala K3', 'Validasi Penggunaan APD', 'Inspeksi Keselamatan Kerja', 'Laporan Insiden/Saran K3'],
    },
    estimator: {
      label: 'Estimator & Cost Control',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      desc: 'Mengontrol anggaran, volume material masuk, progres finansial, dan deviasi RAB.',
      permissions: ['Monitor Material Masuk', 'Analisis Progres & Deviasi', 'Manajemen Biaya & Anggaran', 'Export Laporan Keuangan/Progress'],
    },
    qa_qc: {
      label: 'Ahli QA / QC',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      desc: 'Quality Assurance & Quality Control untuk pengujian material dan struktur bangunan.',
      permissions: ['Inspeksi Mutu Konstruksi', 'Validasi Pengujian Lapangan', 'Pencatatan Kendala Kualitas', 'Approval Dokumen Mutu'],
    },
    supervisor: {
      label: 'Pengawas Lapangan / Supervisor',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      desc: 'Mengawasi tukang dan mandor di lapangan secara langsung setiap hari.',
      permissions: ['Input Mandor & Pekerja', 'Pencatatan Cuaca & Kendala', 'Monitoring Aktivitas Tukang', 'Input Progres Harian'],
    },
    editor: {
      label: 'Site Editor / Pencatat',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Petugas lapangan yang mencatat jumlah tenaga kerja harian, cuaca, kendala, dan narasi laporan.',
      permissions: ['Input Absensi Tenaga Kerja Harian', 'Input Narasi Laporan Harian', 'Simpan Laporan ke Arsip', 'Lihat Rekapitulasi Mingguan'],
    },
    viewer: {
      label: 'Viewer (Hanya Lihat)',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      desc: 'Pihak pengawas / owner yang hanya dapat memantau dashboard, matriks mingguan, dan mengunduh laporan.',
      permissions: ['Melihat Dashboard Monitoring', 'Melihat Matriks & Arsip Laporan', 'Download PDF / Excel Laporan', 'Tidak dapat mengubah data (Read-only)'],
    },
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('error', 'Hanya Administrator yang berhak menambah akun pengguna.');
      return;
    }
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      addToast('warning', 'Nama, Email, dan Password wajib diisi.');
      return;
    }

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      company: newCompany.trim() || 'PT. Bahtera Karya Anambas',
      password: newPassword.trim(),
      is_active: true,
    };

    setUsers((prev) => [newUser, ...prev]);
    setNewName('');
    setNewEmail('');
    setNewCompany('');
    setNewPassword('');
    setIsAddModalOpen(false);
    addToast('success', `Akun pengguna ${newUser.name} berhasil dibuat!`);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditCompany(user.company || '');
    setEditPassword(user.password || '');
    setShowEditPassword(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('error', 'Hanya Administrator yang berhak mengedit akun pengguna.');
      return;
    }
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      addToast('warning', 'Nama Pengguna dan Email / Username Login wajib diisi.');
      return;
    }
    if (!editPassword.trim()) {
      addToast('warning', 'Password login wajib diisi.');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          name: editName.trim(),
          email: editEmail.trim(),
          company: editCompany.trim() || 'PT. Bahtera Karya Anambas',
          role: editRole,
          password: editPassword.trim(),
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    // If active session matches
    if (currentUser.email === editingUser.email || currentUser.id === editingUser.id) {
      const updatedCurrent: UserProfile = {
        ...currentUser,
        full_name: editName.trim(),
        email: editEmail.trim(),
        company: editCompany.trim() || currentUser.company,
        role: editRole,
      };
      DataService.setCurrentUser(updatedCurrent);
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedCurrent);
      }
    }

    addToast('success', `Perubahan data dan login akun "${editName.trim()}" berhasil disimpan!`);
    setEditingUser(null);
  };

  const handleConfirmDelete = () => {
    if (!isAdmin) {
      addToast('error', 'Hanya Administrator yang berhak menghapus akun.');
      return;
    }
    if (!deleteConfirmUser) return;
    if (users.length <= 1) {
      addToast('warning', 'Minimal harus ada 1 akun dalam sistem.');
      setDeleteConfirmUser(null);
      return;
    }

    const target = deleteConfirmUser;
    setUsers((prev) => prev.filter((u) => u.id !== target.id));
    addToast('info', `Akun ${target.name} (${target.email}) berhasil dihapus.`);
    setDeleteConfirmUser(null);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('error', 'Hanya Administrator yang berhak mengubah password.');
      return;
    }
    if (!passwordModalUser || !resetPasswordVal.trim()) {
      addToast('warning', 'Password baru wajib diisi.');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === passwordModalUser.id ? { ...u, password: resetPasswordVal.trim() } : u))
    );
    addToast('success', `Password untuk ${passwordModalUser.name} berhasil diperbarui.`);
    setPasswordModalUser(null);
    setResetPasswordVal('');
  };

  const handleRoleUpdate = (userId: string, newRoleVal: UserRole) => {
    if (!isAdmin) {
      addToast('error', 'Hanya Administrator yang berhak mengubah role pengguna.');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRoleVal } : u))
    );
    addToast('success', 'Role pengguna berhasil diperbarui.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <h2 className="text-lg font-bold text-[#142B4A]">
              Pengaturan Password & Hak Akses Pengguna (Admin Panel)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administrator memiliki kewenangan penuh untuk membuat akun, mengatur password, dan menetapkan role (*RBAC*) tim
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 w-full sm:w-auto min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Buat Akun Pengguna Baru</span>
          </button>
        ) : (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Anda masuk sebagai {currentUser.role.toUpperCase()}. Fitur edit password dibatasi untuk Administrator.</span>
          </div>
        )}
      </div>

      {/* Active Session & Quick Role Switcher */}
      <div className="bg-gradient-to-r from-slate-900 to-[#142B4A] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#F28C28_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-500/20 text-[#F28C28] border border-orange-500/30">
                Sesi Aktif Anda
              </span>
              <span className="text-xs text-slate-300 font-mono">{currentUser.email}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {currentUser.full_name}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-orange-400" />
              <span>{currentUser.company || 'PT. Bahtera Karya Anambas'}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-300" />
                  <span>Ganti Akun / Masuk Akun Lain</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-300" />
                  <span>Keluar dari Aplikasi</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-2 min-w-[280px]">
            <label className="block text-xs font-bold text-orange-300 uppercase tracking-wider">
              Simulasi Ganti Role Instan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'project_manager', 'site_engineer', 'hse_officer', 'estimator', 'qa_qc', 'supervisor', 'editor', 'viewer'] as UserRole[]).map((r) => {
                const isSelected = currentUser.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      addToast('success', `Role berhasil diubah menjadi: ${roleDetails[r].label}`);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
                      isSelected
                        ? 'bg-[#F28C28] text-white shadow-md ring-2 ring-orange-300'
                        : 'bg-white/15 hover:bg-white/25 text-slate-200'
                    }`}
                  >
                    {isSelected && <BadgeCheck className="w-3.5 h-3.5" />}
                    <span>{roleDetails[r].label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Users & Password Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Manajemen Akun Pengguna & Password Sistem
              </h3>
              <p className="text-xs text-slate-500">
                Admin dapat mengatur password login, mengubah role, serta menambah atau mencabut akses akun
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            {users.length} Akun Terdaftar
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Nama Pengguna & Email</th>
                <th className="p-3">Perusahaan</th>
                <th className="p-3">Role / Hak Akses</th>
                <th className="p-3">Password Keamanan</th>
                <th className="p-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const roleInfo = roleDetails[u.role];
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{u.name}</span>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Nama Pengguna & Login"
                            aria-label={`Edit ${u.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">User:</span>
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{u.company}</td>
                    <td className="p-3">
                      {isAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleUpdate(u.id, e.target.value as UserRole)}
                          className="text-xs px-2 py-1.5 rounded-md border border-slate-300 bg-white font-bold text-slate-800"
                        >
                          <option value="admin">Administrator</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="editor">Site Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleInfo.badge}`}>
                          {roleInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                          {u.password ? '••••••••' : '(Belum diset)'}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setResetPasswordVal(u.password || '');
                            }}
                            className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold flex items-center gap-1 transition-colors border border-purple-200"
                            title="Ubah Password Cepat"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Ganti Password</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1 transition-colors border border-blue-200 text-xs shrink-0"
                            title="Edit Nama Pengguna, User Login & Password"
                            aria-label={`Edit Akun ${u.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0"
                            title="Hapus Akun Pengguna"
                            aria-label={`Hapus ${u.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <span>Matriks Izin & Keamanan Sistem (Role-Based Access Control)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['admin', 'project_manager', 'site_engineer', 'hse_officer', 'estimator', 'qa_qc', 'supervisor', 'editor', 'viewer'] as UserRole[]).map((r) => {
            const role = roleDetails[r];
            const isCurrent = currentUser.role === r;
            return (
              <div
                key={r}
                className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 flex flex-col justify-between transition-all ${
                  isCurrent ? 'border-purple-500 ring-2 ring-purple-100 bg-purple-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md border ${role.badge}`}>
                      {role.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-700 text-white">
                        Peran Anda
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {role.desc}
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Hak Akses Utama:</span>
                    <ul className="space-y-1">
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Kode: {r.toUpperCase()}</span>
                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onRoleChange(r);
                        addToast('success', `Peran aktif beralih ke ${role.label}`);
                      }}
                      className="text-xs font-bold text-purple-700 hover:text-purple-800 underline"
                    >
                      Gunakan Peran Ini
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Buat Akun & Password Pengguna Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ir. Budi Santoso, ST"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Login *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="budi.santoso@simtk204.id"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Akses *</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter password"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 font-mono focus:outline-hidden min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perusahaan / Instansi</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="PT. Teknik Eksakta"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Peran Keamanan (Role) *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white min-h-[42px]"
                >
                  <option value="admin">Administrator (Akses Penuh & Manajemen Password)</option>
                  <option value="project_manager">Project Manager (PM)</option>
                  <option value="site_engineer">Site Engineer / Ahli Teknik</option>
                  <option value="hse_officer">Ahli K3 / HSE Officer</option>
                  <option value="estimator">Estimator & Cost Control</option>
                  <option value="qa_qc">Ahli QA / QC</option>
                  <option value="supervisor">Pengawas Lapangan / Supervisor</option>
                  <option value="editor">Site Editor / Pencatat</option>
                  <option value="viewer">Viewer (Hanya Lihat)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[40px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors min-h-[40px]"
                >
                  Simpan & Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Ubah Password Pengguna</h3>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-xs text-purple-900 space-y-1">
              <div>Pengguna: <strong>{passwordModalUser.name}</strong></div>
              <div className="font-mono text-[11px] text-purple-700">{passwordModalUser.email}</div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru *</label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 pr-10 rounded-lg border border-slate-300 font-mono focus:outline-hidden min-h-[42px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[40px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors min-h-[40px]"
                >
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (Edit Nama Pengguna, User Login, Password, Perusahaan & Role) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Edit Akun Pengguna & Kredensial Login
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur nama pengguna, akun user login, password aplikasi, dan role akses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pengguna (Nama Lengkap & Gelar) *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: Ir. Hendra Wijaya, MT"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 min-h-[42px]"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nama resmi yang tampil di header laporan harian/mingguan dan pengesahan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama User / Email Login Aplikasi *
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="hendra.pm@simtk204.id"
                  className="w-full text-xs sm:text-sm font-mono px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 min-h-[42px]"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan sebagai identitas (User / Email) untuk otentikasi login ke aplikasi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Login Aplikasi *
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Masukkan password login pengguna"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 pr-10 rounded-lg border border-slate-300 font-mono focus:outline-hidden focus:border-blue-500 min-h-[42px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showEditPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Admin dapat melihat dan memperbarui kata sandi pengguna secara langsung di sini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perusahaan / Instansi
                </label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="PT. Bahtera Karya Anambas"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peran Keamanan (Role / Hak Akses) *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 min-h-[42px]"
                >
                  <option value="admin">Administrator (Akses Penuh & Manajemen Password)</option>
                  <option value="project_manager">Project Manager (PM - Validasi & Pengesahan)</option>
                  <option value="site_engineer">Site Engineer / Ahli Teknik</option>
                  <option value="hse_officer">Ahli K3 / HSE Officer</option>
                  <option value="estimator">Estimator & Cost Control</option>
                  <option value="qa_qc">Ahli QA / QC</option>
                  <option value="supervisor">Pengawas Lapangan / Supervisor</option>
                  <option value="editor">Site Editor / Pencatat (Input Lapangan)</option>
                  <option value="viewer">Viewer (Hanya Lihat / Read-Only)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[40px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors min-h-[40px] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Perubahan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Akun Pengguna</h3>
                <p className="text-xs text-slate-500">Konfirmasi pencabutan akses akun pengguna</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus akun berikut dari sistem?
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-rose-200/80 space-y-1">
                <div className="font-bold text-slate-900">{deleteConfirmUser.name}</div>
                <div className="text-[11px] font-mono text-slate-600">User: {deleteConfirmUser.email}</div>
                <div className="text-[11px] text-slate-500">{deleteConfirmUser.company} • Role: {roleDetails[deleteConfirmUser.role].label}</div>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Pengguna ini tidak akan dapat login lagi ke aplikasi setelah akun dihapus.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[40px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors min-h-[40px] flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
