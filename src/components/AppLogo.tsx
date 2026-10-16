import React from 'react';
import { APP_NAME } from '../config/constants';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', circle: 'w-8 h-8' },
    md: { icon: 'w-12 h-12', text: 'text-2xl', circle: 'w-12 h-12' },
    lg: { icon: 'w-20 h-20', text: 'text-3xl', circle: 'w-20 h-20' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Gentle organic terracotta badge */}
      <div
        className={`${currentSize.circle} rounded-2xl bg-gradient-to-br from-[#8C4A3C] to-[#73392E] p-1.5 shadow-md flex items-center justify-center shrink-0 text-[#FBF3EF] relative overflow-hidden`}
      >
        {/* Soft backdrop glow */}
        <div className="absolute inset-0 bg-[#F3D6CB]/15 rounded-2xl" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-full h-full relative z-10"
        >
          {/* Stylized mother & infant silhouette / heart embrace */}
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#F3D6CB"
            fillOpacity="0.85"
            stroke="#8C4A3C"
            strokeWidth="0.5"
          />
          {/* Leaf sprig signifying growth */}
          <path
            d="M12 12c1.5-3 4-4 7-4 0 3-1 5.5-4 7"
            stroke="#6F7F62"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif font-bold text-[#8C4A3C] dark:text-[#F3D6CB] tracking-tight ${currentSize.text}`}>
            {APP_NAME}
          </span>
          {size === 'lg' && (
            <span className="text-xs text-[#6F7F62] dark:text-[#A7B69B] font-medium tracking-wide">
              Companhia & Comunidade
            </span>
          )}
        </div>
      )}
    </div>
  );
};
