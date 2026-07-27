import React, { useState } from 'react';
import { X, MessageSquare, Plus, CheckCircle2, AlertTriangle, FileText, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { PDFAnnotation, StudentProject } from '../types';
import { api } from '../services/api';

interface PDFAnnotatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: StudentProject | null;
  onUpdateProject: (updated: StudentProject) => void;
}

export const PDFAnnotatorModal: React.FC<PDFAnnotatorModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const currentVersion = project.versions[project.versions.length - 1] || {
    versionNumber: 1,
    fileName: 'Brouillon_Memoire.pdf',
    fileUrl: '/api/sample-pdf/default.pdf',
  };

  const pageAnnotations = project.annotations.filter((a) => a.pageNumber === pageNumber);

  const handleAddAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const updated = await api.addProjectAnnotation(project.id, {
        pageNumber,
        comment: commentText.trim(),
        versionNumber: currentVersion.versionNumber,
      });
      onUpdateProject(updated);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveStage = async () => {
    try {
      const updated = await api.updateSupervisorProject(project.id, {
        status: 'VALIDE_ENCADREUR',
        progressPercentage: 100,
      });
      onUpdateProject(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestCorrections = async () => {
    try {
      const updated = await api.updateSupervisorProject(project.id, {
        status: 'CORRECTIONS_DEMANDEES',
      });
      onUpdateProject(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 h-[85vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full">
                Version {currentVersion.versionNumber}
              </span>
              <h3 className="text-sm font-bold">{project.proposedTheme}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Étudiant : <strong className="text-white">{project.studentName}</strong> ({project.filiere})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestCorrections}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Demander des Corrections
            </button>
            <button
              onClick={handleApproveStage}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approuver l'Étape
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body: Split View PDF Frame + Annotations Panel */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* PDF Frame Viewer */}
          <div className="md:col-span-2 bg-slate-950 p-4 border-r border-slate-800 flex flex-col h-full">
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-200">{currentVersion.fileName}</span>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="font-mono text-slate-300">Page {pageNumber} / 12</span>
                <button
                  onClick={() => setPageNumber((p) => Math.min(12, p + 1))}
                  disabled={pageNumber >= 12}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 rounded-2xl border border-slate-800 overflow-hidden bg-slate-900">
              <iframe
                src={`/api/sample-pdf/${project.id}#page=${pageNumber}`}
                className="w-full h-full border-none"
                title="Visualiseur PDF"
              />
            </div>
          </div>

          {/* Annotations & Feedback Comments Sidebar */}
          <div className="bg-slate-900 p-4 flex flex-col h-full border-t md:border-t-0 border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Annotations (Page {pageNumber})
              </span>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded-md font-mono">
                {pageAnnotations.length}
              </span>
            </h4>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
              {pageAnnotations.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-1 opacity-30" />
                  <p>Aucune annotation sur la page {pageNumber}.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Ajoutez des remarques ci-dessous.</p>
                </div>
              ) : (
                pageAnnotations.map((ann) => (
                  <div key={ann.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-indigo-300">{ann.authorName} ({ann.authorRole})</span>
                      <span>{new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-200">{ann.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* New Annotation Form */}
            <form onSubmit={handleAddAnnotation} className="pt-2 border-t border-slate-800 space-y-2">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Annoter la page ${pageNumber}...`}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Publier l'Annotation (Page {pageNumber})
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

