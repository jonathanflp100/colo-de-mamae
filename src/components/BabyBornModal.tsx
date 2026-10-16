import React, { useState } from 'react';
import { Sparkles, Heart, Baby, Calendar, X, PartyPopper } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { dataService } from '../data/dataService';
import { formatFriendlyDate } from '../lib/dateUtils';

interface BabyBornModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BabyBornModal: React.FC<BabyBornModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile, refreshProfile } = useAuth();
  const { locale } = useI18n();

  const todayStr = new Date().toISOString().split('T')[0];
  const [birthDate, setBirthDate] = useState<string>(todayStr);
  const [babyName, setBabyName] = useState<string>(profile?.baby_name || '');
  const [birthType, setBirthType] = useState<string>('Normal / Humanizado');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!birthDate) {
      setError('Por favor, informe a data de nascimento do bebê.');
      return;
    }

    if (!babyName.trim()) {
      setError('Por favor, informe o nome do seu bebê.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Determine turma according to birth date
      const newTurma = await dataService.getOrCreateTurmaForDate(birthDate, profile.locale || 'pt');

      // Update profile
      await dataService.updateProfile(user.id, {
        phase: 'mae',
        baby_birth_date: birthDate,
        baby_name: babyName.trim(),
        turma_id: newTurma.id,
      });

      // Post celebration automatically to turma
      try {
        const formattedDate = formatFriendlyDate(birthDate, locale);
        const birthNote = notes.trim() ? ` — ${notes.trim()}` : '';
        const body = `O meu bebê ${babyName.trim()} nasceu no dia ${formattedDate}! 🤍✨ Parto: ${birthType}${birthNote}. Obrigada por todo o apoio da nossa turma!`;

        await dataService.createPost({
          turma_id: newTurma.id,
          author_id: user.id,
          author_nickname: profile.nickname || 'Mamãe',
          body,
          topic: 'conquista',
        });
      } catch (err) {
        console.warn('Could not publish auto post to turma:', err);
      }

      await refreshProfile();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#251E1C] rounded-3xl p-6 shadow-2xl border border-[#F3D6CB]/80 dark:border-[#382C29] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#3D3230]/50 hover:text-[#3D3230] dark:text-[#E8DCD8]/60 dark:hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#8C4A3C] to-[#E59886] flex items-center justify-center shadow-lg text-white">
            <Baby className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF3EA] dark:bg-[#1E281C] text-[#435139] dark:text-[#C5D6BF] text-xs font-semibold mb-2">
            <PartyPopper className="w-3.5 h-3.5" />
            <span>Momento Sagrado</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#3D3230] dark:text-[#F8ECE8]">
            Meu bebê nasceu! 🌸
          </h2>
          <p className="text-xs text-[#3D3230]/75 dark:text-[#D1C2BE] mt-1 max-w-xs mx-auto">
            Parabéns, mamãe! Que bênção este novo ciclo. Seu aplicativo agora se transformará para cuidar da rotina do seu bebê.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3230]/70 dark:text-[#A79895] mb-1.5">
              Nome do Bebê *
            </label>
            <input
              type="text"
              required
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="Ex: Maya, Gabriel, Helena..."
              className="w-full px-4 py-3 rounded-2xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-[#3D3230] dark:text-[#F8ECE8] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8C4A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3230]/70 dark:text-[#A79895] mb-1.5">
              Data de Nascimento *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                max={todayStr}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-[#3D3230] dark:text-[#F8ECE8] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8C4A3C]"
              />
              <Calendar className="w-4 h-4 text-[#8C4A3C] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3230]/70 dark:text-[#A79895] mb-1.5">
              Como foi o parto? (Opcional)
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                'Normal / Humanizado',
                'Cesárea planejada',
                'Cesárea de emergência',
                'Parto na água',
              ].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setBirthType(type)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition ${
                    birthType === type
                      ? 'border-[#8C4A3C] bg-[#8C4A3C]/10 dark:bg-[#8C4A3C]/20 text-[#8C4A3C] dark:text-[#F3D6CB] font-bold'
                      : 'border-[#F3D6CB]/70 dark:border-[#382C29] text-[#3D3230]/75 dark:text-[#D1C2BE]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conte brevemente como foi esse dia especial (opcional)..."
              rows={2}
              maxLength={250}
              className="w-full px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-[#3D3230] dark:text-[#F8ECE8] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#8C4A3C]"
            />
          </div>

          {/* Turma update notice */}
          <div className="p-3.5 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29] flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-[#8C4A3C] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#3D3230]/80 dark:text-[#D1C2BE] leading-relaxed">
              Ao confirmar, sua turma será sincronizada com o mês de nascimento e suas companheiras receberão uma linda notificação de comemoração!
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl border border-[#F3D6CB] dark:border-[#382C29] text-xs font-bold text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-black/5"
            >
              Depois
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-2 py-3 rounded-2xl bg-[#8C4A3C] hover:bg-[#773E32] text-white text-xs font-bold shadow-md shadow-[#8C4A3C]/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {saving ? (
                <span>Salvando momento...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Comemorar & Iniciar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
