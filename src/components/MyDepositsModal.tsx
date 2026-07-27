import React from 'react';
import { X, FileText, Clock, CheckCircle2, AlertTriangle, Download, Plus } from 'lucide-react';
import { Thesis } from '../types';

interface MyDepositsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theses: Thesis[];
  onOpenDeposit: () => void;
  onDownload: (thesisId: string) => void;
}

export const MyDepositsModal: React.FC<MyDepositsModalProps> = ({
  isOpen,
  onClose,
  theses,
  onOpenDeposit,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30">
              <FileText className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Mes Dépôts de Mémoires</h3>
              <p className="text-xs text-indigo-200">Suivi des travaux soumis et état de validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Nombre total soumis : <strong className="text-white">{theses.length}</strong>
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenDeposit();
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Nouveau Dépôt
            </button>
          </div>

          {theses.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">Aucun mémoire déposé pour le moment.</p>
              <p className="text-xs text-slate-500 mt-1">
                Soumettez votre travail de fin d'études au format PDF pour examen par le comité.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {theses.map((t) => (
                <div key={t.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                        {t.filiere}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{t.title}</h4>
                    </div>

                    {t.status === 'VALIDE' && (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validé & Publié
                      </span>
                    )}

                    {t.status === 'EN_ATTENTE' && (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        En cours de révision
                      </span>
                    )}

                    {t.status === 'REJETE' && (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Non retenu
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap gap-4 pt-1 border-t border-slate-800/60">
                    <span>Directeur : {t.director}</span>
                    <span>Année : {t.year}</span>
                    <span>Fichier : {t.fileName} ({t.fileSize})</span>
                  </div>

                  {t.rejectionReason && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                      <strong>Motif de rejet :</strong> {t.rejectionReason}
                    </div>
                  )}

                  {t.status === 'VALIDE' && (
                    <div className="pt-2 text-right">
                      <button
                        onClick={() => onDownload(t.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Télécharger Fichier PDF
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

