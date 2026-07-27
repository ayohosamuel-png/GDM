import React, { useState } from 'react';
import { X, CreditCard, Smartphone, CheckCircle2, ShieldCheck, Download, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { Thesis, PaymentMethod, PaymentTransaction } from '../types';

interface PaymentModalProps {
  thesis: Thesis | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (payload: {
    thesisId: string;
    paymentMethod: PaymentMethod;
    phoneNumber?: string;
    cardNumber?: string;
  }) => Promise<PaymentTransaction>;
  onDownload: (thesisId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  thesis,
  isOpen,
  onClose,
  onConfirmPayment,
  onDownload,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentTransaction | null>(null);

  if (!isOpen || !thesis) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method !== 'VISA_CARD' && (!phoneNumber || phoneNumber.trim().length < 8)) {
      setError('Veuillez saisir un numéro de téléphone Mobile Money valide.');
      return;
    }

    if (method === 'VISA_CARD' && (!cardNumber || cardNumber.trim().length < 12)) {
      setError('Veuillez saisir un numéro de carte bancaire Visa valide.');
      return;
    }

    setLoading(true);

    try {
      const tx = await onConfirmPayment({
        thesisId: thesis.id,
        paymentMethod: method,
        phoneNumber,
        cardNumber,
      });
      setReceipt(tx);
    } catch (err: any) {
      setError(err.message || 'Paiement échoué. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setReceipt(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/30 rounded-xl border border-emerald-400/30">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Guichet de Paiement Sécurisé</h3>
              <p className="text-xs text-emerald-200">Accès et Téléchargement de Mémoire Académique</p>
            </div>
          </div>
          <button
            onClick={resetState}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          /* RECEIPT / SUCCESS SCREEN */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-white">Paiement Validé avec Succès !</h4>
              <p className="text-xs text-slate-400 mt-1">
                Référence de transaction : <strong className="text-emerald-300">{receipt.transactionRef}</strong>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Document :</span>
                <span className="text-white font-medium text-right truncate max-w-[220px]">
                  {thesis.title}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Montant payé :</span>
                <span className="text-emerald-400 font-bold">{receipt.amountFcfa} FCFA</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Mode de paiement :</span>
                <span className="text-slate-200 font-semibold">{receipt.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Statut :</span>
                <span className="text-emerald-400 font-bold uppercase">PAYÉ / ACCÈS ACTIVÉ</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  onDownload(thesis.id);
                  resetState();
                }}
                className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Fichier PDF</span>
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT METHOD SELECTION FORM */
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* Thesis Item Summary */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  Document sélectionné
                </span>
                <h4 className="text-xs font-bold text-white truncate max-w-[260px]">{thesis.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Par : {thesis.author}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase">Total</span>
                <div className="text-lg font-extrabold text-indigo-400">5 000 FCFA</div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            {/* Operator Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Choisissez votre Mode de Paiement <span className="text-rose-400">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* MTN MoMo */}
                <button
                  type="button"
                  onClick={() => setMethod('MTN_MOMO')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    method === 'MTN_MOMO'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                    MTN
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">MTN MoMo</div>
                    <div className="text-[10px] text-slate-400">Mobile Money</div>
                  </div>
                </button>

                {/* Moov Money */}
                <button
                  type="button"
                  onClick={() => setMethod('MOOV_MONEY')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    method === 'MOOV_MONEY'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    MOOV
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Moov Money</div>
                    <div className="text-[10px] text-slate-400">Mobile Money</div>
                  </div>
                </button>

                {/* Celtis Cash */}
                <button
                  type="button"
                  onClick={() => setMethod('CELTIS_CASH')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    method === 'CELTIS_CASH'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    CELTIS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Celtis Cash</div>
                    <div className="text-[10px] text-slate-400">Mobile Cash</div>
                  </div>
                </button>

                {/* Visa Card */}
                <button
                  type="button"
                  onClick={() => setMethod('VISA_CARD')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    method === 'VISA_CARD'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    VISA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Carte Visa</div>
                    <div className="text-[10px] text-slate-400">Carte bancaire</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Input Details */}
            {method !== 'VISA_CARD' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Numéro de Téléphone {method.replace('_', ' ')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Une notification USSD sera envoyée sur votre mobile pour approuver la transaction.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Numéro de Carte Visa <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Expiration (MM/AA)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Code CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validation du paiement par le réseau...</span>
                </>
              ) : (
                <>
                  <span>Payer 5 000 FCFA & Télécharger</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
