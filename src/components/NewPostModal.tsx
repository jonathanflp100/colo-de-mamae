import React, { useState } from 'react';
import { X, Send, AlertCircle, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { PostTopic } from '../data/types';
import { checkSafety, checkPostRateLimit, recordPostSent } from '../lib/safety';
import { dataService } from '../data/dataService';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: { body: string; topic: PostTopic }) => Promise<void>;
  onTriggerCrisisModal?: () => void;
}

const TOPICS: { id: PostTopic; label: string; icon: string }[] = [
  { id: 'duvida', label: 'Dúvida', icon: '❓' },
  { id: 'desabafo', label: 'Desabafo', icon: '🫂' },
  { id: 'conquista', label: 'Conquista', icon: '🎉' },
  { id: 'dica', label: 'Dica', icon: '💡' },
];

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onTriggerCrisisModal,
}) => {
  const [topic, setTopic] = useState<PostTopic>('duvida');
  const [body, setBody] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    // 1. Rate limit check (max 1 post every 2 mins)
    const rate = checkPostRateLimit();
    if (!rate.allowed) {
      setErrorMsg(`Aguarde ${rate.waitSeconds}s antes de enviar outra postagem.`);
      return;
    }

    // 2. Safety filter check
    const safety = checkSafety(body);
    if (safety.blocked) {
      setErrorMsg(safety.blockReason || 'Conteúdo não permitido.');
      return;
    }

    if (safety.hasRiskWords) {
      dataService.recordRiskAlert({
        text: body.trim(),
        matched_word: safety.matchedRiskWord || 'palavra de risco',
      });
      onTriggerCrisisModal?.();
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await onSubmit({ body: body.trim(), topic });
      recordPostSent();
      setBody('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  const charsLeft = 1000 - body.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-5 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
            Compartilhar com a Turma
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1.5">
              Escolha o assunto:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {TOPICS.map((top) => (
                <button
                  key={top.id}
                  type="button"
                  onClick={() => setTopic(top.id)}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-xl border transition cursor-pointer text-center flex flex-col items-center gap-0.5 ${
                    topic === top.id
                      ? 'bg-[#8C4A3C] text-white border-[#8C4A3C] shadow-xs'
                      : 'bg-white dark:bg-[#1E1817] border-[#F3D6CB]/60 dark:border-[#382C29] text-[#3D3230] dark:text-[#D1C2BE]'
                  }`}
                >
                  <span className="text-xs">{top.icon}</span>
                  <span>{top.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#3D3230] dark:text-[#E0D0CC]">
                Sua mensagem (só texto):
              </label>
              <span className={`text-[10px] ${charsLeft < 50 ? 'text-[#B03622]' : 'text-[#3D3230]/50 dark:text-[#A79895]'}`}>
                {charsLeft} caracteres
              </span>
            </div>
            <textarea
              required
              maxLength={1000}
              rows={5}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Pergunte uma dúvida, faça um desabafo ou compartilhe um momento com as mães do mesmo mês..."
              className="w-full p-3.5 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#382C29] rounded-2xl text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 leading-relaxed resize-none"
            />
          </div>

          {/* Privacy Warning */}
          <div className="p-3 rounded-2xl bg-[#FBEFEA] dark:bg-[#2C1F1C] border border-[#F3D6CB] dark:border-[#422C28] flex items-start gap-2 text-[11px] text-[#8C4A3C] dark:text-[#F3D6CB] leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Você aparece só pelo seu apelido anônimo. Nunca compartilhe nome completo, endereço, telefone ou fotos.
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-[#B03622]/10 border border-[#B03622]/30 text-[#B03622] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] text-xs font-semibold text-[#3D3230] dark:text-[#D1C2BE] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="flex-1 py-3 rounded-xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publicar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
