import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Sparkles, Baby, BookHeart, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';

export const BottomNav: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useI18n();

  const isMother = profile?.phase === 'mae';
  const journeyLabel = isMother ? t('nav.baby') : t('nav.pregnancy');
  const JourneyIcon = isMother ? Baby : Sparkles;

  const navItems = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/turma', label: t('nav.turma'), icon: Users },
    { to: '/jornada', label: journeyLabel, icon: JourneyIcon },
    { to: '/memorias', label: t('nav.memories'), icon: BookHeart },
    { to: '/mais', label: t('nav.more'), icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF3EF]/95 dark:bg-[#1A1514]/95 backdrop-blur-md border-t border-[#F3D6CB]/60 dark:border-[#382C29] safe-bottom shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-200 select-none ${
                isActive
                  ? 'text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold scale-105'
                  : 'text-[#3D3230]/65 dark:text-[#A79895] hover:text-[#8C4A3C] dark:hover:text-[#F3D6CB]'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <div
                    className={`relative p-1 rounded-xl transition ${
                      isActive ? 'bg-[#F3D6CB]/50 dark:bg-[#342421]' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 transition-transform duration-200" />
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8C4A3C] dark:bg-[#F3D6CB]" />
                    )}
                  </div>
                  <span className="text-[11px] tracking-tight mt-0.5 truncate max-w-[64px]">
                    {item.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
