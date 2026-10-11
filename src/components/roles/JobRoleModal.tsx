import React, { useState, useEffect } from 'react';
import { X, Users2, Save } from 'lucide-react';
import { JobRole } from '../../types';
import { validateJobRole } from '../../lib/validation';

interface JobRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: { name: string; sort_order: number; is_active: boolean }) => Promise<boolean>;
  initialRole?: JobRole | null;
  existingRoles: JobRole[];
}

export const JobRoleModal: React.FC<JobRoleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRole,
  existingRoles,
}) => {
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialRole) {
      setName(initialRole.name);
      setSortOrder(initialRole.sort_order);
      setIsActive(initialRole.is_active);
    } else {
      setName('');
      // Suggest next sort order
      const maxOrder = existingRoles.reduce((max, r) => Math.max(max, r.sort_order), 0);
      setSortOrder(maxOrder + 1);
      setIsActive(true);
    }
    setErrorMessage('');
  }, [initialRole, isOpen, existingRoles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const val = validateJobRole(name);
    if (!val.isValid) {
      setErrorMessage(val.error || 'Nama jabatan tidak valid.');
      return;
    }

    // Check duplicate name in same project
    const isDuplicate = existingRoles.some(
      (r) => r.name.toLowerCase().trim() === name.toLowerCase().trim() && r.id !== initialRole?.id
    );
    if (isDuplicate) {
      setErrorMessage('Jabatan dengan nama ini sudah terdaftar pada proyek ini.');
      return;
    }

    setIsSubmitting(true);
    const success = await onSave({
      name: name.trim(),
      sort_order: sortOrder,
      is_active: isActive,
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-[#142B4A] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F28C28] flex items-center justify-center text-white">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialRole ? 'Edit Master Jabatan' : 'Tambah Jabatan / Keahlian Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                Data master keahlian tenaga kerja proyek
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Jabatan / Keahlian *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mekanik Alat Berat"
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden min-h-[44px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor Urut Tampilan (Sort Order) *
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-200 focus:outline-hidden min-h-[44px]"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Menentukan urutan baris jabatan pada tabel monitoring dan ekspor.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded text-[#F28C28] focus:ring-orange-400 shrink-0"
              />
              <span className="text-xs font-semibold text-slate-800">
                Jabatan Aktif (Tampil di formulir pencatatan harian)
              </span>
            </label>
            <p className="text-[11px] text-slate-500 mt-1 pl-7">
              Jika dinonaktifkan, jabatan tidak muncul di input harian baru namun riwayat data lama tetap tersimpan utuh.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#F28C28] hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
