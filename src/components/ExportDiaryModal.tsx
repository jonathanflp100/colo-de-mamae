import React, { useState } from 'react';
import { BookMarked, Printer, Copy, Check, X, Heart, Sparkles } from 'lucide-react';
import { Milestone, Letter, Profile, Turma } from '../data/types';
import { formatFriendlyDate } from '../lib/dateUtils';
import { APP_NAME } from '../config/constants';

interface ExportDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  turma: Turma | null;
  milestones: Milestone[];
  letters: Letter[];
}

export const ExportDiaryModal: React.FC<ExportDiaryModalProps> = ({
  isOpen,
  onClose,
  profile,
  turma,
  milestones,
  letters,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const babyTitle = profile?.phase === 'mae'
    ? `${profile.baby_name || 'Meu Bebê'} (Nascido em ${profile.baby_birth_date ? formatFriendlyDate(profile.baby_birth_date, 'pt') : 'Data não informada'})`
    : `Gestação da Mamãe ${profile?.nickname || ''} (DPP: ${profile?.due_date ? formatFriendlyDate(profile.due_date, 'pt') : 'A definir'})`;

  const generateFullText = () => {
    const lines: string[] = [
      `==================================================`,
      `LIVRO DE MEMÓRIAS & RECORDAÇÕES — ${APP_NAME.toUpperCase()}`,
      `==================================================`,
      `Mamãe: ${profile?.nickname || 'Mamãe'}`,
      `Fase: ${profile?.phase === 'mae' ? 'Mãe de Recém-Nascido' : 'Gestante'}`,
      `${babyTitle}`,
      turma ? `Turma: ${turma.label}` : '',
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
      `==================================================`,
      '',
      'MARCOS DO DESENVOLVIMENTO:',
      '--------------------------------------------------',
    ];

    if (milestones.length === 0) {
      lines.push('Nenhum marco registrado ainda.');
    } else {
      milestones.forEach((m, idx) => {
        lines.push(`${idx + 1}. ${m.title}`);
        lines.push(`   Data: ${formatFriendlyDate(m.date, 'pt')} [${m.kind === 'gestacao' ? 'Gestação' : 'Bebê'}]`);
        if (m.note) lines.push(`   Anotação: "${m.note}"`);
        lines.push('');
      });
    }

    lines.push(
      '--------------------------------------------------',
      'CARTAS DE AMOR PARA O MEU BEBÊ:',
      '--------------------------------------------------'
    );

    if (letters.length === 0) {
      lines.push('Nenhuma carta registrada ainda.');
    } else {
      letters.forEach((l, idx) => {
        lines.push(`CARTA ${idx + 1}: ${l.title}`);
        lines.push(`Data: ${formatFriendlyDate(l.created_at.slice(0, 10), 'pt')}`);
        lines.push('');
        lines.push(`"${l.body}"`);
        lines.push('');
        lines.push('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~');
        lines.push('');
      });
    }

    lines.push(
      '',
      `"O colo de mãe é o primeiro e mais eterno lar." — Guardado com carinho no ${APP_NAME}`
    );

    return lines.join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#251E1C] rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3D6CB]/60 dark:border-[#382C29]">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#8C4A3C]" />
            <h3 className="font-serif font-bold text-lg text-[#3D3230] dark:text-[#F8ECE8]">
              Livro de Recordações
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#3D3230]/40 hover:text-[#3D3230]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formatted Content */}
        <div className="my-4 p-5 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29] overflow-y-auto flex-1 font-serif text-xs leading-relaxed text-[#3D3230] dark:text-[#F8ECE8] whitespace-pre-wrap select-all">
          {generateFullText()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-2xl border border-[#8C4A3C] text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#8C4A3C]/10 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
