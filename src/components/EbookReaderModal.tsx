import React from 'react';
import { X, Download, BookOpen, AlertCircle } from 'lucide-react';

export interface EbookItem {
  id: string;
  title: string;
  subtitle: string;
  pages: number;
  pdfUrl: string;
  gradient: string;
  accent: string;
}

interface EbookReaderModalProps {
  ebook: EbookItem | null;
  onClose: () => void;
}

export const EbookReaderModal: React.FC<EbookReaderModalProps> = ({ ebook, onClose }) => {
  if (!ebook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-[88vh] sm:max-w-2xl bg-[#FBF3EF] dark:bg-[#1E1817] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-white dark:bg-[#251E1C] border-b border-[#F3D6CB]/70 dark:border-[#382C29] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl ${ebook.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#3D3230] dark:text-[#F8ECE8] truncate">
                {ebook.title}
              </h3>
              <p className="text-xs text-[#3D3230]/65 dark:text-[#D1C2BE]">
                {ebook.pages} páginas • Guia oficial Colo de Mãe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={ebook.pdfUrl}
              download={`${ebook.title}.pdf`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </a>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 dark:text-[#D1C2BE] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Body / Preview */}
        <div className="flex-1 bg-neutral-100 dark:bg-[#151110] relative flex flex-col">
          <iframe
            src={`${ebook.pdfUrl}#toolbar=0&navpanes=0`}
            title={ebook.title}
            className="w-full flex-1 border-0"
          />

          {/* Fallback bar if browser restricts inline PDF rendering on mobile */}
          <div className="p-3 bg-white/90 dark:bg-[#251E1C]/90 border-t border-[#F3D6CB]/40 dark:border-[#382C29] text-xs flex items-center justify-between gap-2">
            <span className="text-[#3D3230]/80 dark:text-[#D1C2BE] text-[11px] truncate">
              Abriu no navegador ou deseja salvar no celular?
            </span>
            <a
              href={ebook.pdfUrl}
              download={`${ebook.title}.pdf`}
              className="text-[#8C4A3C] dark:text-[#F3D6CB] font-bold text-xs underline underline-offset-2 shrink-0"
            >
              Baixar PDF ({ebook.pages} págs)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
