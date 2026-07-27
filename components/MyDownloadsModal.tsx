import React from 'react';
import { X, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { PaymentTransaction } from '../types';

interface MyDownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: PaymentTransaction[];
  onDownload: (thesisId: string) => void;
}

export const MyDownloadsModal: React.FC<MyDownloadsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/30 rounded-xl border border-emerald-400/30">
              <Download className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Mes Mémoires Achetés</h3>
              <p className="text-xs text-emerald-200">Coffre-fort des documents acquittés et prêts à télécharger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Download className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">Aucun téléchargement payé pour l'instant.</p>
              <p className="text-xs text-slate-500 mt-1">
                Lorsque vous réglez les frais de téléchargement (5 000 FCFA), vos fichiers apparaissent ici indéfiniment.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Accès Permanent
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{tx.transactionRef}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{tx.thesisTitle}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    Payé le {new Date(tx.createdAt).toLocaleDateString()} • {tx.amountFcfa} FCFA ({tx.paymentMethod.replace('_', ' ')})
                  </div>
                </div>

                <button
                  onClick={() => onDownload(tx.thesisId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
