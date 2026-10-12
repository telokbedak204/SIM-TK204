import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { Project, ProjectStatus } from '../../types';
import { validateProjectData } from '../../lib/validation';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<boolean>;
  initialProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    owner_name: '',
    contractor_name: '',
    consultant_name: '',
    location: '',
    start_date: '2026-10-01',
    end_date: '2026-12-31',
    project_manager: '',
    site_manager: '',
    recorder_name: '',
    inspector_name: '',
    status: 'active' as ProjectStatus,
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialProject) {
      setFormData({
        code: initialProject.code || '',
        name: initialProject.name || '',
        owner_name: initialProject.owner_name || '',
        contractor_name: initialProject.contractor_name || '',
        consultant_name: initialProject.consultant_name || '',
        location: initialProject.location || '',
        start_date: initialProject.start_date || '2026-10-01',
        end_date: initialProject.end_date || '2026-12-31',
        project_manager: initialProject.project_manager || '',
        site_manager: initialProject.site_manager || '',
        recorder_name: initialProject.recorder_name || '',
        inspector_name: initialProject.inspector_name || '',
        status: initialProject.status || 'active',
      });
    } else {
      setFormData({
        code: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        owner_name: '',
        contractor_name: '',
        consultant_name: '',
        location: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        project_manager: '',
        site_manager: '',
        recorder_name: '',
        inspector_name: '',
        status: 'active',
      });
    }
    setErrorMessage('');
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validation = validateProjectData(formData);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Data proyek tidak lengkap.');
      return;
    }

    setIsSubmitting(true);
    const payload: Partial<Project> = {
      ...formData,
      ...(initialProject?.id ? { id: initialProject.id } : {}),
    };
    const success = await onSave(payload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F28C28] flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {initialProject ? 'Edit Data Proyek' : 'Tambah Proyek Konstruksi Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                Lengkapi identitas teknis dan pengawas proyek untuk laporan resmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded-md"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kode & Nama */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Proyek *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Contoh: PRJ-2026-ANB-04"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Pelaksanaan *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden bg-white"
              >
                <option value="active">Aktif (Sedang Berjalan)</option>
                <option value="completed">Selesai (Completed)</option>
                <option value="paused">Ditunda (Paused)</option>
                <option value="archived">Diarsipkan (Archived)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Proyek *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Lanjutan Renovasi Pasar Loka – Kepulauan Anambas"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            {/* Stakeholders */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pemilik / Pemberi Tugas *
              </label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                placeholder="Contoh: Dinas Pekerjaan Umum / Disperindag"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kontraktor Pelaksana *
              </label>
              <input
                type="text"
                value={formData.contractor_name}
                onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                placeholder="Contoh: PT. Bahtera Karya"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Konsultan MK / Pengawas *
              </label>
              <input
                type="text"
                value={formData.consultant_name}
                onChange={(e) => setFormData({ ...formData, consultant_name: e.target.value })}
                placeholder="Contoh: PT. Rekayasa Multi Konsultan MK"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi Proyek *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Contoh: Tarempa, Kab. Kepulauan Anambas"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            {/* Dates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Mulai Kontrak *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Selesai Kontrak *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            {/* Key Personnel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Manager (PM) *
              </label>
              <input
                type="text"
                value={formData.project_manager}
                onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                placeholder="Ir. Hendra Wijaya, MT"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Site Manager (SM) *
              </label>
              <input
                type="text"
                value={formData.site_manager}
                onChange={(e) => setFormData({ ...formData, site_manager: e.target.value })}
                placeholder="Rian Pratama, ST"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Petugas Pencatat Lapangan (Opsional)
              </label>
              <input
                type="text"
                value={formData.recorder_name}
                onChange={(e) => setFormData({ ...formData, recorder_name: e.target.value })}
                placeholder="Ahmad Faisal (Site Admin)"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pemeriksa Laporan MK (Opsional)
              </label>
              <input
                type="text"
                value={formData.inspector_name}
                onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                placeholder="Dedi Kurniawan, ST (Inspector MK)"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Proyek'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
