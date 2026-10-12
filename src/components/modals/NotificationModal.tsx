import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  Plus,
  CheckCheck,
  Calendar,
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onAddNotification: (notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => void;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onAddNotification,
  addToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'reminder' | 'warning' | 'info' | 'success'>('reminder');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0] + ' 09:00');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      addToast('error', 'Judul dan pesan pengingat harus diisi');
      return;
    }
    onAddNotification({
      title: newTitle.trim(),
      message: newMessage.trim(),
      type: newType,
      date: newDate,
    });
    setNewTitle('');
    setNewMessage('');
    setShowAddForm(false);
    addToast('success', 'Pengingat baru berhasil ditambahkan');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#142B4A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#F28C28]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Pusat Notifikasi & Pengingat</h2>
              <p className="text-xs text-slate-300">
                {unreadCount > 0 ? `${unreadCount} pengingat belum dibaca` : 'Semua pengingat telah dibaca'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-xs font-bold bg-[#F28C28] hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Pengingat</span>
            </button>
          </div>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="p-4 bg-orange-50/60 border-b border-orange-200 space-y-3 shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F28C28]" />
                Buat Pengingat Baru
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Batal
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Judul Pengingat</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Cth: Cek Material Semen"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                  >
                    <option value="reminder">Pengingat</option>
                    <option value="warning">Peringatan K3</option>
                    <option value="info">Informasi</option>
                    <option value="success">Sukses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="2026-10-12 10:00"
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pesan Lengkap</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis detail pengingat atau instruksi pekerjaan di sini..."
                rows={2}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#142B4A] hover:bg-[#1c3a63] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Simpan & Pasang Pengingat
              </button>
            </div>
          </form>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Tidak ada notifikasi atau pengingat</p>
              <p className="text-xs text-slate-400 mt-0.5">Semua pesan dan pengingat Anda bersih</p>
            </div>
          ) : (
            filtered.map((notif) => {
              const typeStyles = {
                reminder: { bg: 'bg-blue-50/80 border-blue-200 text-blue-800', icon: <Clock className="w-4 h-4 text-blue-600 mt-0.5" /> },
                warning: { bg: 'bg-amber-50/80 border-amber-200 text-amber-800', icon: <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" /> },
                info: { bg: 'bg-slate-50/80 border-slate-200 text-slate-800', icon: <Info className="w-4 h-4 text-slate-600 mt-0.5" /> },
                success: { bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-800', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> },
              }[notif.type] || { bg: 'bg-slate-50 border-slate-200 text-slate-800', icon: <Info className="w-4 h-4 text-slate-500" /> };

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${typeStyles.bg} ${
                    !notif.is_read ? 'ring-2 ring-orange-400/40 font-medium shadow-xs' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">{typeStyles.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{notif.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {notif.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{notif.message}</p>
                      
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60">
                        <div className="flex items-center gap-2">
                          {!notif.is_read && (
                            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          )}
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                            {notif.type === 'reminder' ? 'Pengingat' : notif.type === 'warning' ? 'Peringatan' : 'Informasi'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notif.is_read && (
                            <button
                              onClick={() => onMarkAsRead(notif.id)}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                            >
                              Tandai Dibaca
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteNotification(notif.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Hapus Notifikasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#142B4A] hover:bg-[#1c3a63] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
