import React from 'react';
import { Siren } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { useI18n } from '../i18n';

interface HeaderProps {
  onOpenWarningSigns: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWarningSigns, title, subtitle }) => {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 bg-[#FBF3EF]/90 dark:bg-[#1A1514]/90 backdrop-blur-md border-b border-[#F3D6CB]/50 dark:border-[#382C29] px-4 py-3 safe-top">
      <div className="flex items-center justify-between gap-3">
        {title ? (
          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-lg text-[#8C4A3C] dark:text-[#F3D6CB] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <span className="text-xs text-[#3D3230]/70 dark:text-[#D1C2BE]">
                {subtitle}
              </span>
            )}
          </div>
        ) : (
          <AppLogo size="sm" />
        )}

        {/* Discreet fixed Warning Signs button */}
        <button
          onClick={onOpenWarningSigns}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#FBEFEA] dark:bg-[#322320] text-[#B03622] dark:text-[#F29486] border border-[#F3D6CB] dark:border-[#4E342F] text-xs font-semibold shadow-xs hover:bg-[#F3D6CB]/60 dark:hover:bg-[#422C28] transition active:scale-95 cursor-pointer min-h-[38px]"
          title={t('warning_signs.btn_label')}
        >
          <Siren className="w-4 h-4 text-[#B03622] dark:text-[#F29486] shrink-0" />
          <span className="text-[12px] whitespace-nowrap">{t('warning_signs.btn_label')}</span>
        </button>
      </div>
    </header>
  );
};
