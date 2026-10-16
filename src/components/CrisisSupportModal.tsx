import React from 'react';
import { Heart, PhoneCall, ShieldCheck, X } from 'lucide-react';

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const CrisisSupportModal: React.FC<CrisisSupportModalProps> = ({
  isOpen,
  onClose,
  onProceed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border-2 border-[#8C4A3C]/40 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Empathy Heart Badge */}
        <div className="w-16 h-16 rounded-3xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Heart className="w-8 h-8 fill-[#8C4A3C] text-[#8C4A3C] animate-pulse" />
        </div>

        <h3 className="font-serif font-bold text-xl text-[#8C4A3C] dark:text-[#F3D6CB] mb-2">
          Você não está sozinha
        </h3>

        <p className="text-xs sm:text-sm text-[#3D3230]/85 dark:text-[#E0D0CC] leading-relaxed mb-6">
          Sentir-se sobrecarregada, exausta ou triste na maternidade é mais comum do que parece. Se estiver passando por um momento difícil ou angustiante, fale agora com o <strong>CVV (Centro de Valorização da Vida)</strong>, um canal gratuito, confidencial e disponível 24 horas por dia.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5 mb-4">
          <a
            href="tel:188"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Ligar para o CVV (188) — Gratuito</span>
          </a>

          <a
            href="tel:192"
            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#B03622] text-[#B03622] text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergência médica: SAMU (192)</span>
          </a>
        </div>

        <button
          type="button"
          onClick={onProceed}
          className="text-xs text-[#3D3230]/65 dark:text-[#A79895] hover:text-[#8C4A3C] underline transition cursor-pointer py-1"
        >
          Continuar com o envio da mensagem
        </button>
      </div>
    </div>
  );
};
