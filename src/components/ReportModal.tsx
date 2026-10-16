import React, { useState } from 'react';
import { Flag, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ReportTargetType } from '../data/types';
import { dataService } from '../data/dataService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  reporterId: string;
  targetAuthorNickname?: string;
}

const REPORT_REASONS = [
  'Desrespeito ou julgamento materno',
  'Tentativa de venda, anúncio ou golpe',
  'Informação perigosa de saúde / automedicação',
  'Compartilhamento de contatos, WhatsApp ou Pix',
  'Conteúdo impróprio ou ofensivo',
  'Outro motivo',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  reporterId,
  targetAuthorNickname,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullReason = details.trim() ? `${selectedReason}: ${details.trim()}` : selectedReason;
      await dataService.reportContent({
        reporter_id: reporterId,
        target_type: targetType,
        target_id: targetId,
        reason: fullReason,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#B03622]/15 text-[#B03622] flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
              Denunciar Conteúdo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#6F7F62] mx-auto" />
            <h4 className="font-serif font-bold text-base text-[#3D3230] dark:text-[#F8ECE8]">
              Denúncia Recebida
            </h4>
            <p className="text-xs text-[#3D3230]/75 dark:text-[#D1C2BE] leading-relaxed">
              Agradecemos por cuidar da segurança do ninho. Nossa equipe de moderação avaliará a mensagem com prioridade.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#8C4A3C] text-white text-xs font-semibold cursor-pointer"
            >
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE]">
              {targetAuthorNickname
                ? `Qual o motivo da denúncia contra a mensagem de "${targetAuthorNickname}"?`
                : 'Selecione o motivo da denúncia para proteger a comunidade:'}
            </p>

            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedReason === reason
                      ? 'bg-white dark:bg-[#1E1817] border-[#8C4A3C] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold'
                      : 'border-[#F3D6CB]/60 dark:border-[#382C29] text-[#3D3230] dark:text-[#E0D0CC]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-[#8C4A3C]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#3D3230]/75 dark:text-[#D1C2BE] mb-1">
                Detalhes adicionais (opcional):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="Explique brevemente o ocorrido..."
                className="w-full px-3 py-2 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#382C29] rounded-xl text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-1 focus:ring-[#8C4A3C]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] text-xs font-semibold text-[#3D3230] dark:text-[#D1C2BE] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#B03622] hover:bg-[#8F2B1A] text-white text-xs font-semibold shadow-xs cursor-pointer transition disabled:opacity-50"
              >
                Enviar denúncia
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
