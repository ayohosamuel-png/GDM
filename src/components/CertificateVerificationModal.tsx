import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, QrCode, Download, CheckCircle2, Award, ExternalLink, Printer } from 'lucide-react';
import { CertificateData, Thesis } from '../types';
import { buildCertificateForThesis } from '../utils/certificate';
import { api } from '../services/api';

interface CertificateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  thesis?: Thesis | null;
  certificateIdInput?: string;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  isOpen,
  onClose,
  thesis,
  certificateIdInput,
}) => {
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchCertId, setSearchCertId] = useState(certificateIdInput || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (thesis) {
      setCertData(buildCertificateForThesis(thesis));
    } else if (certificateIdInput) {
      fetchCert(certificateIdInput);
    }
  }, [thesis, certificateIdInput]);

  const fetchCert = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyCertificate(id);
      setCertData(data);
    } catch (err: any) {
      setError(err.message || 'Certificat introuvable ou non authentifié.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCertId.trim()) {
      fetchCert(searchCertId.trim());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <Award className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Certificat Numérique d'Authenticité</h3>
              <p className="text-xs text-emerald-200">Vérification de validité institutionnelle & QR Code unique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Search bar if no thesis provided */}
          {!thesis && (
            <form onSubmit={handleSearch} className="flex gap-2 print:hidden">
              <input
                type="text"
                value={searchCertId}
                onChange={(e) => setSearchCertId(e.target.value)}
                placeholder="Entrez le code de vérification (Ex: CERT-2026-001)..."
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                Vérifier
              </button>
            </form>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 text-center">
              {error}
            </div>
          )}

          {certData && (
            <div className="p-6 bg-slate-950 border-2 border-emerald-500/30 rounded-2xl space-y-6 text-center print:border-2 print:border-black print:bg-white print:p-8">
              {/* Institution Seal & Watermark */}
              <div className="border-b border-slate-800 pb-4 print:border-slate-300">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase print:text-black">
                  RÉPUBLIQUE DU BÉNIN • MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR
                </span>
                <h2 className="text-lg font-black text-white mt-1 print:text-black">
                  CERTIFICAT D'AUTHENTICITÉ ACADÉMIQUE
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {certData.university} • {certData.department}
                </p>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold print:border-black print:text-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                MÉMOIRE VALIDÉ & ARCHIVÉ OFFICIELLEMENT
              </div>

              {/* Details */}
              <div className="space-y-3 text-left bg-slate-900/60 p-4 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-300">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block print:text-slate-600">Titre du Mémoire</span>
                  <h4 className="text-sm font-bold text-white print:text-black">{certData.title}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block print:text-slate-600">Auteur / Impétrant</span>
                    <strong className="text-slate-200 print:text-black">{certData.author}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block print:text-slate-600">Directeur de Thèse</span>
                    <strong className="text-slate-200 print:text-black">{certData.director}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block print:text-slate-600">Filière Académique</span>
                    <strong className="text-emerald-300 print:text-black">{certData.filiere}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block print:text-slate-600">Date d'Homologation</span>
                    <strong className="text-slate-200 print:text-black">
                      {new Date(certData.validationDate).toLocaleDateString('fr-FR')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* QR Code & Hash */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800 print:border-slate-300">
                <div className="flex items-center gap-4">
                  <div className="p-1.5 bg-white rounded-xl shadow-md shrink-0">
                    <img src={certData.qrCodeDataUrl} alt="QR Code d'authenticité" className="w-24 h-24" />
                  </div>
                  <div className="text-left text-[11px] space-y-1">
                    <p className="font-mono text-slate-300 print:text-black">
                      ID Certificat : <strong className="text-emerald-400">{certData.certificateId}</strong>
                    </p>
                    <p className="font-mono text-[9px] text-slate-500 break-all print:text-slate-700">
                      Signature Numérique : {certData.digitalSignatureHash}
                    </p>
                    <p className="text-[10px] text-slate-400 print:text-slate-600">
                      Scannez ce QR Code pour vérifier l'authenticité en direct sur les serveurs nationaux.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center print:hidden">
          <span className="text-[10px] text-slate-500">Horodatage d'Authentification Cloudflare Edge</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Imprimer Certificat
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

