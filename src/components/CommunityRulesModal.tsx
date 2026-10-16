import React from 'react';
import { ShieldCheck, Heart, AlertOctagon, CheckCircle2, X } from 'lucide-react';

interface CommunityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityRulesModal: React.FC<CommunityRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      title: 'Respeito sempre',
      desc: 'Este é um refúgio acolhedor. Toda mãe merece ser tratada com carinho e consideração.',
    },
    {
      title: 'Sem julgamentos',
      desc: 'Parto normal, cesárea, fórmula, amamentação exclusiva... Cada escolha e cada história é sagrada.',
    },
    {
      title: 'Sem vendas, links ou contatos',
      desc: 'Proibido divulgar grupos de WhatsApp, redes sociais, produtos comerciais ou pedidos de dinheiro/Pix.',
    },
    {
      title: 'Sem fotos ou dados de bebês',
      desc: 'Para proteger a privacidade e segurança dos pequenos, a comunidade é estritamente em texto puro.',
    },
    {
      title: 'Informação de saúde não substitui o médico',
      desc: 'Trocas de vivências são bem-vindas, mas diagnósticos e prescrições devem ser feitos por profissionais.',
    },
    {
      title: 'Denuncie o que for estranho',
      desc: 'Se notar qualquer mensagem desrespeitosa ou suspeita, use o menu de três pontinhos para denunciar.',
    },
    {
      title: 'Em momentos de crise, ligue 188',
      desc: 'Você não está desamparada. O CVV (188) oferece acolhimento gratuito 24 horas por dia.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[88vh] rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3D6CB]/60 dark:border-[#382C29]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#8C4A3C] dark:text-[#F3D6CB]" />
            <h3 className="font-serif font-bold text-lg text-[#8C4A3C] dark:text-[#F3D6CB]">
              Regras da Comunidade
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules List */}
        <div className="overflow-y-auto space-y-3 py-4 pr-1 text-xs text-[#3D3230] dark:text-[#E0D0CC]">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29] flex items-start gap-3 shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#FBEFEA] dark:bg-[#322320] text-[#8C4A3C] dark:text-[#F3D6CB] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#8C4A3C] dark:text-[#F3D6CB] mb-0.5">
                  {rule.title}
                </h4>
                <p className="leading-relaxed text-[#3D3230]/80 dark:text-[#D1C2BE]">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer min-h-[44px]"
        >
          Li e me comprometo com o respeito mútuo
        </button>
      </div>
    </div>
  );
};
