import React, { useState, useEffect, useRef } from 'react';
import { Timer, AlertTriangle, ShieldAlert, RotateCcw, Activity, Info, CheckCircle2 } from 'lucide-react';
import { dataService } from '../data/dataService';
import { Contraction } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { calculateWeeksPregnant } from '../lib/dateUtils';

export const ContractionTimerSection: React.FC = () => {
  const { user, profile } = useAuth();
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // Load existing contractions
  useEffect(() => {
    if (!user) return;
    dataService.getContractions(user.id).then((items) => {
      setContractions(items);
    });
  }, [user]);

  // Handle Screen Wake Lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      }
    } catch (err) {
      console.log('Wake Lock error or not permitted:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
      } catch (err) {
        // ignore
      }
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  // Timer ticker
  useEffect(() => {
    if (isActive && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
      requestWakeLock();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsedSeconds(0);
      releaseWakeLock();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseWakeLock();
    };
  }, [isActive, startTime]);

  const handleToggle = async () => {
    if (!user) return;

    if (!isActive) {
      // Start contraction
      setStartTime(Date.now());
      setIsActive(true);
    } else {
      // End contraction
      const end = Date.now();
      const start = startTime || end - 1000;
      setIsActive(false);

      const newContraction: Omit<Contraction, 'id'> = {
        user_id: user.id,
        started_at: new Date(start).toISOString(),
        ended_at: new Date(end).toISOString(),
      };

      const saved = await dataService.saveContraction(newContraction);
      setContractions((prev) => [saved, ...prev]);
      setStartTime(null);
    }
  };

  const handleClear = async () => {
    if (!user) return;
    if (window.confirm('Deseja limpar todo o histórico de contrações?')) {
      await dataService.clearContractions(user.id);
      setContractions([]);
    }
  };

  // Helper formatting mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate 1-hour metrics
  const now = Date.now();
  const oneHourAgo = now - 3600 * 1000;
  const recentContractions = contractions.filter(
    (c) => new Date(c.started_at).getTime() > oneHourAgo
  );

  let avgDurationSecs = 0;
  let avgIntervalSecs = 0;

  if (recentContractions.length > 0) {
    const totalDuration = recentContractions.reduce((acc, c) => {
      const dur = (new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()) / 1000;
      return acc + dur;
    }, 0);
    avgDurationSecs = Math.round(totalDuration / recentContractions.length);

    if (recentContractions.length > 1) {
      // intervals between consecutive starts
      let totalInterval = 0;
      for (let i = 0; i < recentContractions.length - 1; i++) {
        const diff =
          (new Date(recentContractions[i].started_at).getTime() -
            new Date(recentContractions[i + 1].started_at).getTime()) /
          1000;
        totalInterval += diff;
      }
      avgIntervalSecs = Math.round(totalInterval / (recentContractions.length - 1));
    }
  }

  // Clinical rules
  // Rule 5-1-1: ~every 5 min or less, duration ~1 min (45s+), for 1 hour (at least 6-8 contractions in the hour)
  const isLaborLikely =
    recentContractions.length >= 5 &&
    avgIntervalSecs > 0 &&
    avgIntervalSecs <= 360 && // <= 6 mins
    avgDurationSecs >= 45; // ~1 minute

  // Preterm rule (< 37 weeks)
  const weeksPregnant = profile?.due_date
    ? calculateWeeksPregnant(profile.due_date)
    : profile?.last_period_date
    ? calculateWeeksPregnant(undefined, profile.last_period_date)
    : 38;

  const isPretermWarning =
    weeksPregnant < 37 && recentContractions.length >= 3 && avgIntervalSecs > 0 && avgIntervalSecs <= 600;

  return (
    <div className="space-y-4">
      {/* Wake lock indicator */}
      {wakeLockActive && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6F7F62] dark:text-[#A7B69B] font-medium bg-[#EEF3EA] dark:bg-[#1E281C] py-1 px-3 rounded-full mx-auto w-fit">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Tela travada aberta durante a contagem</span>
        </div>
      )}

      {/* Big Circular Timer Button */}
      <div className="py-6 flex flex-col items-center justify-center">
        <button
          onClick={handleToggle}
          className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ${
            isActive
              ? 'bg-gradient-to-br from-[#8C4A3C] to-[#BA3B24] text-white scale-105 ring-8 ring-[#F3D6CB] animate-pulse'
              : 'bg-gradient-to-br from-[#8C4A3C] to-[#A65D4F] text-white hover:brightness-105 hover:shadow-2xl'
          }`}
        >
          <Timer className="w-8 h-8 mb-1 opacity-90" />
          <span className="font-serif text-3xl font-bold tracking-tight">
            {isActive ? formatTime(elapsedSeconds) : 'Começou'}
          </span>
          <span className="text-[11px] font-semibold tracking-wider uppercase mt-1 opacity-80">
            {isActive ? 'Clique para terminar' : 'Toque na contração'}
          </span>
        </button>
      </div>

      {/* Clinical Warning Cards */}
      {isPretermWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Contrações antes de 37 semanas</h4>
              <p className="text-xs leading-relaxed mt-0.5 text-amber-800 dark:text-amber-300">
                Você está com {weeksPregnant} semanas. Contrações regulares nessa fase merecem avaliação imediata da sua equipe médica ou maternidade de referência.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLaborLikely && (
        <div className="p-4 rounded-2xl bg-[#EEF3EA] dark:bg-[#1C261A] border-2 border-[#6F7F62] text-[#2C3823] dark:text-[#D8E6D3] shadow-md animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#6F7F62] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Pode ser hora de ir para a maternidade!</h4>
              <p className="text-xs leading-relaxed mt-0.5 opacity-90">
                Suas contrações estão a cada ~{Math.round(avgIntervalSecs / 60)} min e durando cerca de {avgDurationSecs}s há mais de uma hora. Siga as orientações da sua equipe de parto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Hour Metrics Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#3D3230]/70 dark:text-[#A79895]">
            Médias na última hora ({recentContractions.length} contrações)
          </h4>
          {contractions.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[11px] text-[#8C4A3C] hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#FBF3EF] dark:bg-[#1E1817]">
            <span className="text-[11px] text-[#3D3230]/70 dark:text-[#A79895] block">
              Duração Média
            </span>
            <span className="font-serif text-lg font-bold text-[#8C4A3C] dark:text-[#F3D6CB]">
              {avgDurationSecs > 0 ? `${avgDurationSecs}s` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#FBF3EF] dark:bg-[#1E1817]">
            <span className="text-[11px] text-[#3D3230]/70 dark:text-[#A79895] block">
              Intervalo Médio
            </span>
            <span className="font-serif text-lg font-bold text-[#8C4A3C] dark:text-[#F3D6CB]">
              {avgIntervalSecs > 0
                ? `${Math.floor(avgIntervalSecs / 60)}m ${avgIntervalSecs % 60}s`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Contractions List */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2">
        <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8] mb-1">
          Histórico Recente
        </h4>

        {contractions.length === 0 ? (
          <p className="text-xs text-[#3D3230]/50 dark:text-[#A79895] py-4 text-center italic">
            Nenhuma contração registrada ainda. Quando sentir uma contração endurecer a barriga, toque no botão redondo acima.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {contractions.map((c, index) => {
              const start = new Date(c.started_at);
              const end = new Date(c.ended_at);
              const durationSecs = Math.max(1, Math.round((end.getTime() - start.getTime()) / 1000));

              // Interval since previous in list (which started after this one)
              let intervalStr = '—';
              if (index < contractions.length - 1) {
                const prevStart = new Date(contractions[index + 1].started_at);
                const diffSecs = Math.round((start.getTime() - prevStart.getTime()) / 1000);
                const m = Math.floor(diffSecs / 60);
                const s = diffSecs % 60;
                intervalStr = `${m}m ${s}s`;
              }

              const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#FBF3EF]/60 dark:bg-[#1E1817] flex items-center justify-between text-xs border border-[#F3D6CB]/40 dark:border-[#382C29]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8C4A3C]" />
                    <span className="font-medium text-[#3D3230] dark:text-[#F8ECE8]">{timeStr}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[#3D3230]/80 dark:text-[#D1C2BE]">
                    <span>
                      Duração: <strong className="text-[#8C4A3C]">{durationSecs}s</strong>
                    </span>
                    <span>
                      Intervalo: <strong>{intervalStr}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
