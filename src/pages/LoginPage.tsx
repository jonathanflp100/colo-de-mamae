import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { dataService } from '../data/dataService';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile, isDemoMode } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { user, error } = await dataService.signInWithEmail(email, password);
      if (error || !user) {
        setErrorMsg(error?.message || t('auth.invalid_credentials'));
        setLoading(false);
        return;
      }

      await refreshProfile();
      // Navigation will be automatically resolved by Router guard or direct check
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err?.message || t('common.error'));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await dataService.signInWithGoogle();
      await refreshProfile();
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err?.message || t('common.error'));
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('senha123');
  };

  const handleSendReset = async () => {
    if (!email) {
      setErrorMsg('Informe seu e-mail para receber o link.');
      return;
    }
    await dataService.resetPassword(email);
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F0E6E1] dark:bg-[#0F0C0B] flex justify-center selection:bg-[#F3D6CB] selection:text-[#8C4A3C]">
      <div className="w-full max-w-md min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col p-6 shadow-2xl border-x border-[#F3D6CB]/30 dark:border-[#2C2321] relative overflow-y-auto">
        {/* Top bar with back button */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] flex items-center justify-center text-[#8C4A3C] dark:text-[#F3D6CB] hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer shadow-xs"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <AppLogo size="sm" />
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-1">
            {t('auth.sign_in')}
          </h2>
          <p className="text-sm text-[#3D3230]/75 dark:text-[#D1C2BE]">
            {t('auth.welcome')}
          </p>
        </div>

        {/* Purchase Email Warning Banner */}
        <div className="p-3.5 mb-6 rounded-2xl bg-[#FBEFEA] dark:bg-[#2B1F1C] border border-[#F3D6CB] dark:border-[#422C28] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#8C4A3C] shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-[#8C4A3C] dark:text-[#F3D6CB] leading-relaxed">
            {t('auth.purchase_email_warning')}
          </p>
        </div>

        {/* Demo Mode Quick Pick */}
        {isDemoMode && (
          <div className="mb-5 p-3 rounded-2xl bg-[#EEF3EA] dark:bg-[#1E271B] border border-[#6F7F62]/20 text-xs text-[#435139] dark:text-[#C5D6BF]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#6F7F62]" />
                Modo Demonstração
              </span>
              <span className="text-[10px] opacity-75">Qualquer e-mail funciona</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('mariana.gestante@exemplo.com')}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#251E1C] border border-[#6F7F62]/30 text-[11px] font-medium text-[#435139] dark:text-[#C5D6BF] hover:bg-[#EEF3EA] cursor-pointer"
              >
                Preencher Mariana (Gestante)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('clara.mae@exemplo.com')}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#251E1C] border border-[#6F7F62]/30 text-[11px] font-medium text-[#435139] dark:text-[#C5D6BF] hover:bg-[#EEF3EA] cursor-pointer"
              >
                Preencher Clara (Mãe)
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#B03622]/10 border border-[#B03622]/30 text-[#B03622] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1.5">
              {t('auth.email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3D3230]/40 dark:text-[#A79895]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC]">
                {t('auth.password')}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-[#8C4A3C] dark:text-[#F3D6CB] hover:underline cursor-pointer"
              >
                {t('auth.forgot_password')}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3D3230]/40 dark:text-[#A79895]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password_placeholder')}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[48px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-base shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[50px] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{t('auth.sign_in')}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-[#F3D6CB] dark:border-[#382C29] w-full" />
          <span className="bg-[#FBF3EF] dark:bg-[#1A1514] px-3 text-xs text-[#3D3230]/50 dark:text-[#A79895] uppercase tracking-wider absolute">
            {t('auth.or')}
          </span>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#251E1C] hover:bg-[#FBEFEA] dark:hover:bg-[#2F2422] text-[#3D3230] dark:text-[#F8ECE8] border border-[#F3D6CB] dark:border-[#3E2B27] font-medium text-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('auth.continue_with_google')}</span>
        </button>

        {/* Footer sign up link */}
        <div className="mt-auto pt-6 text-center text-xs text-[#3D3230]/75 dark:text-[#D1C2BE]">
          <span>{t('auth.dont_have_account')} </span>
          <Link
            to="/register"
            className="font-semibold text-[#8C4A3C] dark:text-[#F3D6CB] hover:underline cursor-pointer"
          >
            {t('auth.sign_up')}
          </Link>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
              <h3 className="text-lg font-serif font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-2">
                {t('auth.forgot_password')}
              </h3>
              <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] mb-4">
                Digite o e-mail cadastrado na compra para receber o link de redefinição de senha.
              </p>

              {resetSent ? (
                <div className="p-3 mb-4 rounded-xl bg-[#EEF3EA] dark:bg-[#20291D] text-[#435139] dark:text-[#C5D6BF] text-xs">
                  {t('auth.reset_link_sent')}
                </div>
              ) : (
                <div className="mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.email_placeholder')}
                    className="w-full px-4 py-3 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#422C28] text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] hover:bg-black/5 cursor-pointer"
                >
                  {t('common.close')}
                </button>
                {!resetSent && (
                  <button
                    type="button"
                    onClick={handleSendReset}
                    className="flex-1 py-2.5 rounded-xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    {t('auth.send_reset_link')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
