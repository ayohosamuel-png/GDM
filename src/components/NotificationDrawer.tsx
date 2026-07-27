import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Info, Check } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Centre de Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                title="Tout marquer comme lu"
              >
                <Check className="w-3.5 h-3.5" />
                Tout lire
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Aucune notification pour le moment.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border text-xs transition ${
                    n.type === 'SUCCESS'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : n.type === 'DANGER'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span className="flex items-center gap-1.5">
                      {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {n.type === 'DANGER' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      {n.type === 'INFO' && <Info className="w-4 h-4 text-indigo-400" />}
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300 font-normal leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

