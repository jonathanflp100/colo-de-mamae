import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useI18n } from '../i18n';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or dismissed this session, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (isInstallable) {
      await install();
    } else {
      // General instructions modal
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="mx-4 my-2 p-3 bg-gradient-to-r from-[#FBEFEA] to-[#F3D6CB]/40 dark:from-[#2A201E] dark:to-[#382824] rounded-2xl border border-[#F3D6CB] dark:border-[#4A3732] shadow-sm flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#8C4A3C] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="font-semibold text-[#8C4A3C] dark:text-[#F3D6CB] truncate">
              {t('pwa.install_banner_title')}
            </p>
            <p className="text-[11px] text-[#3D3230]/75 dark:text-[#E0D0CC] truncate">
              {t('pwa.install_banner_desc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium rounded-xl text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('pwa.install_btn')}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label={t('pwa.dismiss')}
            className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/60 dark:text-[#E0D0CC]/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS & Browser Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-center text-[#8C4A3C] dark:text-[#F3D6CB] mb-2">
              {isIOS ? 'Instalar no iPhone / iPad' : 'Instalar aplicativo'}
            </h3>

            <div className="space-y-3 my-4 text-xs text-[#3D3230] dark:text-[#E0D0CC]">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E1817]">
                    <span className="w-5 h-5 rounded-full bg-[#8C4A3C] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                      1
                    </span>
                    <span>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra inferior do Safari.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E1817]">
                    <span className="w-5 h-5 rounded-full bg-[#8C4A3C] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                      2
                    </span>
                    <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E1817]">
                    <span className="w-5 h-5 rounded-full bg-[#8C4A3C] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                      3
                    </span>
                    <span>Toque em <strong>"Adicionar"</strong> no canto superior direito.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E1817]">
                    <span className="w-5 h-5 rounded-full bg-[#8C4A3C] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                      1
                    </span>
                    <span>Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior do navegador Chrome.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E1817]">
                    <span className="w-5 h-5 rounded-full bg-[#8C4A3C] text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                      2
                    </span>
                    <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-semibold hover:bg-[#73392E] transition active:scale-95 cursor-pointer min-h-[44px]"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
