import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Edit,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { JobRole, Project, UserProfile } from '../types';
import { JobRoleModal } from '../components/roles/JobRoleModal';

interface JobRolesPageProps {
  project: Project;
  jobRoles: JobRole[];
  onSaveRole: (roleData: { id?: string; name: string; sort_order: number; is_active: boolean }) => Promise<boolean>;
  onToggleRoleActive: (roleId: string, isActive: boolean) => Promise<boolean>;
  currentUser: UserProfile;
}

export const JobRolesPage: React.FC<JobRolesPageProps> = ({
  project,
  jobRoles,
  onSaveRole,
  onToggleRoleActive,
  currentUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'project_manager';
  const sortedRoles = [...jobRoles].sort((a, b) => a.sort_order - b.sort_order);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: JobRole) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (data: { name: string; sort_order: number; is_active: boolean }) => {
    return await onSaveRole({
      id: editingRole ? editingRole.id : undefined,
      ...data,
    });
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F28C28]"></span>
            <h2 className="text-lg font-bold text-[#142B4A]">
              Master Jabatan & Keahlian Tenaga Kerja
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi klasifikasi tenaga kerja untuk proyek{' '}
            <span className="font-semibold text-slate-700">{project.name}</span>
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 min-h-[44px] w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jabatan Baru</span>
          </button>
        )}
      </div>

      {/* Info Notice about Historical Data Preservation */}
      <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-blue-950">Prinsip Integritas Data Historis:</div>
          <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
            Menonaktifkan jabatan hanya menyembunyikannya dari formulir input tanggal berikutnya. Seluruh riwayat catatan harian yang telah diisi sebelumnya untuk jabatan tersebut tetap tersimpan utuh dan tetap diperhitungkan dalam rekapitulasi laporan terdahulu.
          </p>
        </div>
      </div>

      {/* Job Roles Container (Mobile Cards + Desktop Table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Daftar Jabatan Terdaftar ({sortedRoles.length})
          </span>
        </div>

        {/* MOBILE VIEW: Touch-friendly cards for 320px–639px */}
        <div className="sm:hidden divide-y divide-slate-100">
          {sortedRoles.map((role) => (
            <div
              key={role.id}
              className={`p-3.5 space-y-2.5 ${!role.is_active ? 'bg-slate-50/70 opacity-75' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {role.sort_order}
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{role.name}</div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    role.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {role.is_active ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-slate-500" />
                      <span>Non-Aktif</span>
                    </>
                  )}
                </span>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(role)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 min-h-[44px]"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onToggleRoleActive(role.id, !role.is_active)}
                    className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold min-h-[44px] border ${
                      role.is_active
                        ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <span>{role.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: Clean Table for >= 640px */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#142B4A] text-white">
              <tr>
                <th className="py-3 px-4 font-bold text-center w-16">Urutan</th>
                <th className="py-3 px-4 font-bold">Nama Jabatan / Keahlian</th>
                <th className="py-3 px-4 font-bold text-center w-32">Status</th>
                <th className="py-3 px-4 font-bold text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRoles.map((role) => (
                <tr
                  key={role.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    !role.is_active ? 'opacity-60 bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">
                    {role.sort_order}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 text-sm">
                    {role.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        role.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {role.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-500" />
                          <span>Non-Aktif</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {canEdit ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(role)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Jabatan & Urutan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onToggleRoleActive(role.id, !role.is_active)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                              role.is_active
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {role.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400">Hanya Lihat</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      <JobRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialRole={editingRole}
        existingRoles={jobRoles}
      />
    </div>
  );
};
