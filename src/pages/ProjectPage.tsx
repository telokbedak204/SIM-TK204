import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle,
  Archive,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Users,
  Check,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { Project, ProjectStatus, UserProfile } from '../types';
import { ProjectModal } from '../components/projects/ProjectModal';
import { formatDateIndo } from '../lib/calculations';

interface ProjectPageProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onSaveProject: (data: Partial<Project>) => Promise<boolean>;
  onArchiveProject: (id: string) => Promise<boolean>;
  currentUser: UserProfile;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onSaveProject,
  onArchiveProject,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedDetailProject, setSelectedDetailProject] = useState<Project | null>(null);
  const [archiveTargetProject, setArchiveTargetProject] = useState<Project | null>(null);
  const [deleteTargetProject, setDeleteTargetProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setIsModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!archiveTargetProject) return;
    await onArchiveProject(archiveTargetProject.id);
    setArchiveTargetProject(null);
  };

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'project_manager';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F28C28]"></span>
            <h2 className="text-lg font-bold text-[#142B4A]">
              Master Pengelolaan Proyek Konstruksi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh paket pekerjaan, kontraktor pelaksana, konsultan MK, dan status proyek
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 w-full md:w-auto min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, kode, lokasi proyek..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#F28C28] min-h-[42px]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden min-h-[42px]"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
            <option value="archived">Diarsipkan</option>
            <option value="paused">Ditunda</option>
          </select>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => {
          const isActive = p.id === activeProjectId;
          const statusColors: Record<ProjectStatus, string> = {
            active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            completed: 'bg-blue-100 text-blue-800 border-blue-200',
            archived: 'bg-slate-100 text-slate-700 border-slate-200',
            paused: 'bg-amber-100 text-amber-800 border-amber-200',
          };

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-[#F28C28] ring-2 ring-orange-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header card with active indicator */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    {p.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${statusColors[p.status]}`}
                    >
                      {p.status}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#F28C28] text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 break-words mb-2">
                  {p.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Kontraktor: <strong>{p.contractor_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">MK: <strong>{p.consultant_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{formatDateIndo(p.start_date)} s/d {formatDateIndo(p.end_date)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons with comfortable touch sizes */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectProject(p.id)}
                  disabled={isActive}
                  className={`text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 min-h-[44px] ${
                    isActive
                      ? 'bg-orange-50 text-[#F28C28] cursor-default'
                      : 'bg-[#142B4A] hover:bg-[#1c3a63] text-white active:bg-slate-900'
                  }`}
                >
                  {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{isActive ? 'Proyek Terpilih' : 'Pilih Proyek Ini'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedDetailProject(p)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Lihat Detail Teknis"
                    aria-label="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {canEdit && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        title="Edit Proyek"
                        aria-label="Edit Proyek"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetProject(p)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Hapus Proyek"
                        aria-label="Hapus Proyek"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {p.status !== 'archived' && (
                        <button
                          onClick={() => setArchiveTargetProject(p)}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Arsipkan Proyek"
                          aria-label="Arsipkan Proyek"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveProject}
        initialProject={editingProject}
      />

      {/* Modal Detail View */}
      {selectedDetailProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#142B4A] border-b pb-2 mb-3">
              Detail Lengkap Proyek: {selectedDetailProject.name}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">ID Proyek:</span>
                <span className="col-span-2 font-mono text-slate-800">{selectedDetailProject.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Kode Proyek:</span>
                <span className="col-span-2 font-bold text-slate-800">{selectedDetailProject.code}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Pemilik Tugas:</span>
                <span className="col-span-2 text-slate-800">{selectedDetailProject.owner_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Kontraktor:</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedDetailProject.contractor_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Konsultan MK:</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedDetailProject.consultant_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Lokasi:</span>
                <span className="col-span-2 text-slate-800">{selectedDetailProject.location}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Periode Kontrak:</span>
                <span className="col-span-2 text-slate-800">
                  {formatDateIndo(selectedDetailProject.start_date)} s/d {formatDateIndo(selectedDetailProject.end_date)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Project Manager:</span>
                <span className="col-span-2 font-semibold text-slate-800">{selectedDetailProject.project_manager}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Site Manager:</span>
                <span className="col-span-2 text-slate-800">{selectedDetailProject.site_manager}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Pencatat Lapangan:</span>
                <span className="col-span-2 text-slate-800">{selectedDetailProject.recorder_name || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Inspector MK:</span>
                <span className="col-span-2 text-slate-800">{selectedDetailProject.inspector_name || '-'}</span>
              </div>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedDetailProject(null)}
                className="px-4 py-1.5 rounded-lg bg-[#142B4A] text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Archive */}
      {archiveTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Arsipkan Proyek Ini?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Apakah Anda yakin ingin mengarsipkan proyek <strong>{archiveTargetProject.name}</strong>?
              Data historis tetap aman dan dapat dilihat pada arsip laporan.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setArchiveTargetProject(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmArchive}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Ya, Arsipkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
