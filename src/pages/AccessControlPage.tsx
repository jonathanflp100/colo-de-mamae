import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, ShoppingBag, AlertCircle, LogOut, HeartHandshake } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { SALES_URL } from '../config/constants';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';

export const AccessControlPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAccessExpired, refreshProfile, signOut, isDemoMode } = useAuth();
  const { t } = useI18n();
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleCheckAgain = async () => {
    setChecking(true);
    setFeedback('');
    try {
      await refreshProfile();
      // If access is now active, navigate to app
      const now = new Date().getTime();
      const accessTime = profile?.access_until ? new Date(profile.access_until).getTime() : 0;
      if (accessTime > now) {
        navigate('/');
      } else {
        setFeedback('Seu pagamento ainda está sendo processado. Aguarde mais alguns minutinhos ou entre em contato.');
      }
    } catch {
      setFeedback('Não foi possível verificar no momento. Tente novamente em instantes.');
    } finally {
      setChecking(false);
    }
  };

  const handleOpenSales = () => {
    window.location.href = SALES_URL;
  };

  const title = isAccessExpired ? t('access.title_expired') : t('access.title_pending');

  return (
    <div className="min-h-screen bg-[#F0E6E1] dark:bg-[#0F0C0B] flex justify-center selection:bg-[#F3D6CB] selection:text-[#8C4A3C]">
      <div className="w-full max-w-md min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col justify-between p-6 shadow-2xl border-x border-[#F3D6CB]/30 dark:border-[#2C2321] relative overflow-y-auto">
        {/* Top header */}
        <div className="flex items-center justify-between pt-2">
          <AppLogo size="sm" />
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] text-xs text-[#3D3230]/70 dark:text-[#A79895] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>

        {/* Center illustration & copy */}
        <div className="my-auto py-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-[#FBEFEA] dark:bg-[#2A1E1B] border border-[#F3D6CB] dark:border-[#422C28] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center mb-6 shadow-inner">
            <Clock className="w-10 h-10 animate-pulse text-[#8C4A3C]" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-3">
            {title}
          </h1>

          <div className="p-4 mb-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] text-left space-y-2">
            <p className="font-medium text-[#3D3230] dark:text-[#F8ECE8]">
              E-mail conectado: <strong className="text-[#8C4A3C] dark:text-[#F3D6CB]">{user?.email}</strong>
            </p>
            <p className="leading-relaxed">
              {t('access.desc')}
            </p>
          </div>

          {feedback && (
            <div className="mb-4 p-3 rounded-xl bg-[#FBEFEA] dark:bg-[#2F211D] border border-[#F3D6CB] text-[#8C4A3C] dark:text-[#F3D6CB] text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {isDemoMode && (
            <p className="text-[11px] text-[#6F7F62] dark:text-[#A7B69B] font-medium">
              💡 {t('access.demo_unlock_notice')}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          <button
            onClick={handleCheckAgain}
            disabled={checking}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-sm shadow-md transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[50px] disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? t('access.checking') : t('access.check_again_btn')}</span>
          </button>

          <button
            onClick={handleOpenSales}
            className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#251E1C] hover:bg-[#FBEFEA] dark:hover:bg-[#2F2320] text-[#8C4A3C] dark:text-[#F3D6CB] border border-[#F3D6CB] dark:border-[#422C28] font-medium text-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[50px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('access.get_access_btn')}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-[#3D3230]/60 dark:text-[#A79895]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#6F7F62]" />
            <span>{t('access.support_contact')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
