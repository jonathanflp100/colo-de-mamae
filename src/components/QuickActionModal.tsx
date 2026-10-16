import React, { useState } from 'react';
import { X, Sparkles, Clock, Volume2, VolumeX, Play, Pause, Heart } from 'lucide-react';

export interface QuickActionData {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isSoothingBaby?: boolean;
}

interface QuickActionModalProps {
  action: QuickActionData | null;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ action, onClose }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundType, setSoundType] = useState<'shhh' | 'heartbeat' | 'rain'>('shhh');

  if (!action) return null;

  const Icon = action.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3EA] dark:bg-[#1E271B] text-[#435139] dark:text-[#C5D6BF] text-[10px] font-bold uppercase tracking-wider">
              {action.isSoothingBaby ? 'Aconchego' : 'Em breve • Parte 4'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Central Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-serif font-bold text-center text-[#8C4A3C] dark:text-[#F3D6CB] mb-2">
          {action.title}
        </h3>

        <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] text-center leading-relaxed mb-4">
          {action.description}
        </p>

        {/* Interactive sound player for "Acalmar o bebê" */}
        {action.isSoothingBaby && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#382C29] mb-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">
              <span>Sons suaves para ninar</span>
              <Heart className="w-4 h-4 fill-[#F3D6CB] text-[#8C4A3C]" />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'shhh', label: 'Ruído Branco' },
                { id: 'heartbeat', label: 'Coração' },
                { id: 'rain', label: 'Chuva Mansa' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSoundType(s.id as any)}
                  className={`py-2 px-1 text-[11px] font-medium rounded-xl border transition cursor-pointer text-center ${
                    soundType === s.id
                      ? 'bg-[#8C4A3C] text-white border-[#8C4A3C]'
                      : 'bg-[#FBF3EF] dark:bg-[#251E1C] border-[#F3D6CB]/60 dark:border-[#382C29] text-[#3D3230] dark:text-[#D1C2BE]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-full py-2.5 rounded-xl bg-[#FBEFEA] dark:bg-[#2F211D] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#F3D6CB]/60 transition cursor-pointer"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 text-[#8C4A3C]" />
                  <span>Tocando som suave ({soundType})</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#8C4A3C]" />
                  <span>Ouvir som acolhedor</span>
                </>
              )}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
