import React from 'react';
import { X, MessageSquare, ShieldOff, Calendar, Users, Heart, AlertCircle } from 'lucide-react';
import { getAvatarStyle } from '../lib/avatarColor';
import { formatFriendlyDate } from '../lib/dateUtils';
import { useI18n } from '../i18n';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  nickname: string;
  turmaLabel?: string;
  isSameTurma: boolean;
  phase?: 'gestante' | 'mae';
  createdAt?: string;
  currentUserCreatedAt?: string;
  onStartDm: (targetUserId: string, targetNickname: string) => void;
  onBlockUser: (targetUserId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  nickname,
  turmaLabel = 'Turma da Comunidade',
  isSameTurma,
  phase = 'gestante',
  createdAt,
  currentUserCreatedAt,
  onStartDm,
  onBlockUser,
}) => {
  const { locale } = useI18n();

  if (!isOpen) return null;

  const avatar = getAvatarStyle(nickname);

  // Check 3 days account age rule
  const now = new Date().getTime();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  const targetAge = createdAt ? now - new Date(createdAt).getTime() : threeDaysMs + 1000;
  const currentAge = currentUserCreatedAt ? now - new Date(currentUserCreatedAt).getTime() : threeDaysMs + 1000;

  const canDm = isSameTurma && targetAge >= threeDaysMs && currentAge >= threeDaysMs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center font-serif text-2xl font-bold shadow-md"
          style={{ backgroundColor: avatar.bg, color: avatar.text }}
        >
          {avatar.initial}
        </div>

        <h3 className="font-serif font-bold text-xl text-[#3D3230] dark:text-[#F8ECE8] mb-1">
          {nickname}
        </h3>

        <span className="inline-block px-3 py-1 rounded-full bg-[#FBEFEA] dark:bg-[#322320] text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-semibold mb-4">
          {phase === 'mae' ? 'Mãe de Recém-Nascido' : 'Gestante'}
        </span>

        {/* Info card */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29] text-xs space-y-2 mb-6 text-left">
          <div className="flex items-center gap-2 text-[#3D3230]/80 dark:text-[#D1C2BE]">
            <Users className="w-4 h-4 text-[#6F7F62]" />
            <span>{turmaLabel}</span>
          </div>

          <div className="flex items-center gap-2 text-[#3D3230]/80 dark:text-[#D1C2BE]">
            <Calendar className="w-4 h-4 text-[#8C4A3C]" />
            <span>
              Na comunidade desde {createdAt ? formatFriendlyDate(createdAt.split('T')[0], locale) : 'o início da turma'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={!canDm}
            onClick={() => {
              onStartDm(userId, nickname);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enviar mensagem privada</span>
          </button>

          {!canDm && (
            <p className="text-[10px] text-[#3D3230]/60 dark:text-[#A79895] leading-relaxed">
              *Mensagens privadas exigem que ambas as mães sejam da mesma turma e tenham pelo menos 3 dias de cadastro na comunidade.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Deseja bloquear "${nickname}"? Você não verá mais postagens ou mensagens dela.`)) {
                onBlockUser(userId);
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#B03622]/10 dark:bg-[#341F1C] text-[#B03622] hover:bg-[#B03622]/20 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 min-h-[40px]"
          >
            <ShieldOff className="w-4 h-4" />
            <span>Bloquear esta mãe</span>
          </button>
        </div>
      </div>
    </div>
  );
};
