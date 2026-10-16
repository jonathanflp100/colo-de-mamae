import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { APP_NAME, APP_TAGLINE } from '../config/constants';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#F0E6E1] dark:bg-[#0F0C0B] flex justify-center selection:bg-[#F3D6CB] selection:text-[#8C4A3C]">
      <div className="w-full max-w-md min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col justify-between p-6 relative overflow-hidden shadow-2xl border-x border-[#F3D6CB]/30 dark:border-[#2C2321]">
        {/* Decorative soft organic background circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#F3D6CB]/40 dark:bg-[#322320]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#EEF3EA]/70 dark:bg-[#20291D]/30 blur-3xl pointer-events-none" />

        {/* Demo Mode Notice Badge */}
        {isDemoMode && (
          <div className="relative z-10 self-center px-3 py-1 rounded-full bg-[#EEF3EA] dark:bg-[#20291D] border border-[#6F7F62]/20 text-[#435139] dark:text-[#C5D6BF] text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#6F7F62] animate-pulse" />
            <span>{t('app.demo_mode')}</span>
          </div>
        )}

        {/* Center Hero */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center px-2 py-8">
          <div className="mb-6 scale-110">
            <AppLogo size="lg" showText={false} />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] tracking-tight mb-3">
            {APP_NAME}
          </h1>

          <p className="text-base sm:text-lg text-[#3D3230]/85 dark:text-[#E0D0CC] max-w-xs font-normal leading-relaxed mb-8">
            {APP_TAGLINE}
          </p>

          {/* Core Values Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] text-xs font-medium text-[#3D3230] dark:text-[#F3D6CB] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6F7F62]" />
              <span>100% Anônimo</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] text-xs font-medium text-[#3D3230] dark:text-[#F3D6CB] shadow-xs">
              <HeartHandshake className="w-3.5 h-3.5 text-[#8C4A3C]" />
              <span>Sem Julgamentos</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] text-xs font-medium text-[#3D3230] dark:text-[#F3D6CB] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8C4A3C]" />
              <span>Mães do Mesmo Mês</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col gap-3 pb-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 px-6 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-base shadow-md shadow-[#8C4A3C]/20 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
          >
            <span>{t('auth.sign_in')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/register')}
            className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-[#251E1C] hover:bg-[#FBEFEA] dark:hover:bg-[#2D2421] text-[#8C4A3C] dark:text-[#F3D6CB] border border-[#F3D6CB] dark:border-[#4A3732] font-medium text-base shadow-xs transition active:scale-[0.98] cursor-pointer min-h-[52px]"
          >
            {t('auth.sign_up')}
          </button>

          <p className="text-center text-[12px] text-[#3D3230]/60 dark:text-[#A79895] pt-2">
            Um refúgio para gestantes e mães puérperas
          </p>
        </div>
      </div>
    </div>
  );
};
