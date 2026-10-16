import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, Clock, Heart, CloudRain, Wind, Music, Sparkles } from 'lucide-react';
import { soundSynthesizer, SoundType } from '../lib/soundSynthesizer';

const SOUNDS: { type: SoundType; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  {
    type: 'heartbeat',
    label: 'Útero & Coração',
    desc: 'Batimento suave do ventre materno',
    icon: Heart,
  },
  {
    type: 'rain',
    label: 'Chuva Suave',
    desc: 'Gotículas calmas para relaxar',
    icon: CloudRain,
  },
  {
    type: 'pink',
    label: 'Secador & Ruído Rosa',
    desc: 'Frequências abafadas para sono profundo',
    icon: Wind,
  },
  {
    type: 'lullaby',
    label: 'Cantiga de Ninar',
    desc: 'Notas delicadas de caixinha de música',
    icon: Music,
  },
];

export const BabySoundsPlayer: React.FC = () => {
  const [selectedSound, setSelectedSound] = useState<SoundType>('heartbeat');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    let interval: any;
    if (isPlaying && remainingSeconds !== null && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsPlaying(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, remainingSeconds]);

  const handleTogglePlay = (soundToPlay: SoundType = selectedSound) => {
    if (isPlaying && selectedSound === soundToPlay) {
      soundSynthesizer.stop();
      setIsPlaying(false);
      setRemainingSeconds(null);
    } else {
      setSelectedSound(soundToPlay);
      soundSynthesizer.play(soundToPlay, volume, timerMinutes);
      setIsPlaying(true);
      if (timerMinutes > 0) {
        setRemainingSeconds(timerMinutes * 60);
      } else {
        setRemainingSeconds(null);
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundSynthesizer.setVolume(newVol);
  };

  const handleTimerChange = (mins: number) => {
    setTimerMinutes(mins);
    if (isPlaying) {
      soundSynthesizer.play(selectedSound, volume, mins);
      setRemainingSeconds(mins > 0 ? mins * 60 : null);
    }
  };

  // Format remaining time mm:ss
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Player Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#8C4A3C] to-[#A65D4F] text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Sons para Acalmar</h3>
              <p className="text-[11px] text-white/80">
                100% sintetizado offline • Sem consumo de dados
              </p>
            </div>
          </div>
          {isPlaying && remainingSeconds !== null && (
            <div className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{formatCountdown(remainingSeconds)}</span>
            </div>
          )}
        </div>

        {/* Big Play / Pause action for active sound */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">
              Som Selecionado
            </span>
            <h4 className="font-serif font-bold text-base">
              {SOUNDS.find((s) => s.type === selectedSound)?.label}
            </h4>
          </div>

          <button
            onClick={() => handleTogglePlay(selectedSound)}
            className="w-14 h-14 rounded-full bg-white text-[#8C4A3C] flex items-center justify-center shadow-lg active:scale-95 hover:scale-105 transition"
            aria-label={isPlaying ? 'Pausar som' : 'Tocar som'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Volume slider */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-white/80" />
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-white h-1.5 bg-white/30 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold w-9 text-right text-white/90">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* 4 Sound Selection Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {SOUNDS.map((item) => {
          const Icon = item.icon;
          const isThisPlaying = isPlaying && selectedSound === item.type;
          const isThisSelected = selectedSound === item.type;

          return (
            <div
              key={item.type}
              onClick={() => handleTogglePlay(item.type)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-auto select-none ${
                isThisPlaying
                  ? 'bg-[#EEF3EA] dark:bg-[#1E281C] border-[#6F7F62] shadow-sm'
                  : isThisSelected
                  ? 'bg-white dark:bg-[#251E1C] border-[#8C4A3C] shadow-xs'
                  : 'bg-white dark:bg-[#251E1C] border-[#F3D6CB]/80 dark:border-[#382C29]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isThisPlaying
                      ? 'bg-[#6F7F62] text-white animate-pulse'
                      : isThisSelected
                      ? 'bg-[#8C4A3C] text-white'
                      : 'bg-[#FBF3EF] text-[#8C4A3C] dark:bg-[#342421]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isThisPlaying && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>

              <div>
                <h5 className="font-serif font-bold text-xs text-[#3D3230] dark:text-[#F8ECE8]">
                  {item.label}
                </h5>
                <p className="text-[10px] text-[#3D3230]/65 dark:text-[#A79895] leading-tight mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto Shut-off Timer Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#3D3230]/70 dark:text-[#A79895]">
            Timer de Desligamento Automático
          </span>
          {timerMinutes > 0 && (
            <span className="text-[11px] font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">
              Desliga em {timerMinutes} min
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[15, 30, 45, 60, 0].map((mins) => (
            <button
              key={mins}
              onClick={() => handleTimerChange(mins)}
              className={`py-2 rounded-xl text-xs font-bold border transition ${
                timerMinutes === mins
                  ? 'border-[#8C4A3C] bg-[#8C4A3C] text-white shadow-xs'
                  : 'border-[#F3D6CB]/70 text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-[#FBF3EF]'
              }`}
            >
              {mins === 0 ? 'Sem fim' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
