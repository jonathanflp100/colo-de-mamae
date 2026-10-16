import React, { useState, useEffect, useRef } from 'react';
import { Milk, Baby, Moon, Clock, Plus, Trash2, Check, AlertCircle, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { dataService } from '../data/dataService';
import { Feeding, Diaper, Sleep, FeedingSide, DiaperKind, DiaperColor } from '../data/types';
import { useAuth } from '../hooks/useAuth';

export const BabyTrackerSection: React.FC = () => {
  const { user, profile } = useAuth();
  const familyId = profile?.family_id || 'fam-demo';

  // Data
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [diapers, setDiapers] = useState<Diaper[]>([]);
  const [sleeps, setSleeps] = useState<Sleep[]>([]);

  // Modals / active drawers
  const [activeModal, setActiveModal] = useState<'feeding' | 'diaper' | 'sleep' | null>(null);

  // Feeding State
  const [feedingMode, setFeedingMode] = useState<'breast' | 'bottle'>('breast');
  const [feedingSide, setFeedingSide] = useState<FeedingSide>('esquerdo');
  const [isFeedingTimerActive, setIsFeedingTimerActive] = useState(false);
  const [feedingElapsed, setFeedingElapsed] = useState(0);
  const [feedingStartTime, setFeedingStartTime] = useState<number | null>(null);
  const [bottleMl, setBottleMl] = useState<number>(90);

  // Diaper State
  const [diaperKind, setDiaperKind] = useState<DiaperKind>('xixi');
  const [diaperColor, setDiaperColor] = useState<DiaperColor | null>(null);

  // Sleep State
  const [isSleepTimerActive, setIsSleepTimerActive] = useState(false);
  const [sleepElapsed, setSleepElapsed] = useState(0);
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);

  const feedingTimerRef = useRef<any>(null);
  const sleepTimerRef = useRef<any>(null);

  // Load 24h data
  const loadData = async () => {
    const [f, d, s] = await Promise.all([
      dataService.getFeedings(familyId),
      dataService.getDiapers(familyId),
      dataService.getSleeps(familyId),
    ]);
    setFeedings(f);
    setDiapers(d);
    setSleeps(s);
  };

  useEffect(() => {
    loadData();
  }, [familyId]);

  // Feeding timer effect
  useEffect(() => {
    if (isFeedingTimerActive && feedingStartTime) {
      feedingTimerRef.current = setInterval(() => {
        setFeedingElapsed(Math.floor((Date.now() - feedingStartTime) / 1000));
      }, 500);
    } else {
      if (feedingTimerRef.current) clearInterval(feedingTimerRef.current);
    }
    return () => {
      if (feedingTimerRef.current) clearInterval(feedingTimerRef.current);
    };
  }, [isFeedingTimerActive, feedingStartTime]);

  // Sleep timer effect
  useEffect(() => {
    if (isSleepTimerActive && sleepStartTime) {
      sleepTimerRef.current = setInterval(() => {
        setSleepElapsed(Math.floor((Date.now() - sleepStartTime) / 1000));
      }, 500);
    } else {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    }
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [isSleepTimerActive, sleepStartTime]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Handlers ---
  const handleSaveFeeding = async () => {
    if (!user) return;
    const now = new Date();
    const duration = feedingElapsed > 0 ? feedingElapsed * 1000 : 15 * 60 * 1000;
    const start = feedingStartTime ? new Date(feedingStartTime) : new Date(now.getTime() - duration);

    await dataService.saveFeeding({
      family_id: familyId,
      side: feedingMode === 'bottle' ? 'mamadeira' : feedingSide,
      started_at: start.toISOString(),
      ended_at: now.toISOString(),
      amount_ml: feedingMode === 'bottle' ? bottleMl : null,
      created_by: user.id,
    });

    setIsFeedingTimerActive(false);
    setFeedingElapsed(0);
    setFeedingStartTime(null);
    setActiveModal(null);
    await loadData();
  };

  const handleSaveDiaper = async () => {
    if (!user) return;
    await dataService.saveDiaper({
      family_id: familyId,
      kind: diaperKind,
      color: diaperKind !== 'xixi' ? diaperColor : null,
      at: new Date().toISOString(),
      created_by: user.id,
    });
    setDiaperColor(null);
    setActiveModal(null);
    await loadData();
  };

  const handleToggleSleep = async () => {
    if (!user) return;
    if (!isSleepTimerActive) {
      setSleepStartTime(Date.now());
      setIsSleepTimerActive(true);
    } else {
      const end = new Date();
      const start = sleepStartTime ? new Date(sleepStartTime) : new Date(end.getTime() - sleepElapsed * 1000);

      await dataService.saveSleep({
        family_id: familyId,
        started_at: start.toISOString(),
        ended_at: end.toISOString(),
        created_by: user.id,
      });

      setIsSleepTimerActive(false);
      setSleepElapsed(0);
      setSleepStartTime(null);
      setActiveModal(null);
      await loadData();
    }
  };

  // --- Metrics across last 24 hours ---
  const nowMs = Date.now();
  const last24hMs = nowMs - 24 * 3600 * 1000;

  const recentDiapers = diapers.filter((d) => new Date(d.at).getTime() >= last24hMs);
  const xixiCount = recentDiapers.filter((d) => d.kind === 'xixi' || d.kind === 'ambos').length;
  const cocoCount = recentDiapers.filter((d) => d.kind === 'coco' || d.kind === 'ambos').length;

  const recentFeedings = feedings.filter((f) => new Date(f.started_at).getTime() >= last24hMs);
  const totalFeedingDurationSecs = recentFeedings.reduce((acc, f) => {
    if (!f.ended_at) return acc + 15 * 60;
    return acc + (new Date(f.ended_at).getTime() - new Date(f.started_at).getTime()) / 1000;
  }, 0);
  const totalFeedingHours = (totalFeedingDurationSecs / 3600).toFixed(1);

  const recentSleeps = sleeps.filter((s) => new Date(s.started_at).getTime() >= last24hMs);
  const totalSleepSecs = recentSleeps.reduce((acc, s) => {
    if (!s.ended_at) return acc;
    return acc + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000;
  }, 0);
  const totalSleepHours = (totalSleepSecs / 3600).toFixed(1);

  // Consolidated timeline
  interface TimelineItem {
    id: string;
    type: 'feeding' | 'diaper' | 'sleep';
    time: string;
    dateObj: Date;
    title: string;
    subtitle: string;
  }

  const timelineItems: TimelineItem[] = [
    ...recentFeedings.map((f) => ({
      id: f.id,
      type: 'feeding' as const,
      time: new Date(f.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateObj: new Date(f.started_at),
      title: f.side === 'mamadeira' ? `Mamadeira ${f.amount_ml || 90} ml` : `Mamada (${f.side})`,
      subtitle: f.ended_at
        ? `${Math.round((new Date(f.ended_at).getTime() - new Date(f.started_at).getTime()) / 60000)} min`
        : 'Em andamento',
    })),
    ...recentDiapers.map((d) => ({
      id: d.id,
      type: 'diaper' as const,
      time: new Date(d.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateObj: new Date(d.at),
      title: d.kind === 'xixi' ? 'Fralda de Xixi 💧' : d.kind === 'coco' ? 'Fralda de Cocô 💩' : 'Xixi e Cocô 💧💩',
      subtitle: d.color ? `Cor: ${d.color.replace('_', '/')}` : 'Limpa e sequinha',
    })),
    ...recentSleeps.map((s) => {
      const durMins = s.ended_at
        ? Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000)
        : 0;
      return {
        id: s.id,
        type: 'sleep' as const,
        time: new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateObj: new Date(s.started_at),
        title: 'Soneca do bebê 🌙',
        subtitle: s.ended_at ? `${Math.floor(durMins / 60)}h ${durMins % 60}m de descanso` : 'Dormindo agora...',
      };
    }),
  ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  // Diaper alert condition
  const isDiaperWarning = diaperColor === 'branco_cinza' || diaperColor === 'com_sangue';

  return (
    <div className="space-y-4">
      {/* Three Big Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Feeding Button */}
        <button
          onClick={() => setActiveModal('feeding')}
          className="p-3.5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/80 dark:border-[#382C29] flex flex-col items-center justify-center text-center shadow-xs hover:border-[#8C4A3C] active:scale-95 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center mb-1.5 shadow-xs">
            <Milk className="w-6 h-6" />
          </div>
          <span className="font-serif font-bold text-xs text-[#3D3230] dark:text-[#F8ECE8]">
            Amamentar
          </span>
          <span className="text-[10px] text-[#3D3230]/60 dark:text-[#A79895]">
            Peito ou Frasco
          </span>
        </button>

        {/* Diaper Button */}
        <button
          onClick={() => setActiveModal('diaper')}
          className="p-3.5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/80 dark:border-[#382C29] flex flex-col items-center justify-center text-center shadow-xs hover:border-[#8C4A3C] active:scale-95 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EEF3EA] dark:bg-[#1E281C] text-[#435139] dark:text-[#C5D6BF] flex items-center justify-center mb-1.5 shadow-xs">
            <Baby className="w-6 h-6" />
          </div>
          <span className="font-serif font-bold text-xs text-[#3D3230] dark:text-[#F8ECE8]">
            Fralda
          </span>
          <span className="text-[10px] text-[#3D3230]/60 dark:text-[#A79895]">
            Xixi & Cocô
          </span>
        </button>

        {/* Sleep Button */}
        <button
          onClick={() => setActiveModal('sleep')}
          className="p-3.5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/80 dark:border-[#382C29] flex flex-col items-center justify-center text-center shadow-xs hover:border-[#8C4A3C] active:scale-95 transition"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 shadow-xs transition ${
              isSleepTimerActive
                ? 'bg-[#8C4A3C] text-white animate-pulse'
                : 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
            }`}
          >
            <Moon className="w-6 h-6" />
          </div>
          <span className="font-serif font-bold text-xs text-[#3D3230] dark:text-[#F8ECE8]">
            {isSleepTimerActive ? formatTimer(sleepElapsed) : 'Sono'}
          </span>
          <span className="text-[10px] text-[#3D3230]/60 dark:text-[#A79895]">
            {isSleepTimerActive ? 'Dormindo...' : 'Registrar'}
          </span>
        </button>
      </div>

      {/* 24-Hour Summary Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FBF3EF] to-[#F5E6DF] dark:from-[#251E1C] dark:to-[#1E1817] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
        <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#8C4A3C] dark:text-[#F3D6CB] mb-1.5">
          Resumo das Últimas 24h
        </h4>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#3D3230] dark:text-[#F8ECE8]">
          <span>
            🍼 <strong>{recentFeedings.length}</strong> mamadas ({totalFeedingHours}h)
          </span>
          <span className="opacity-40">•</span>
          <span>
            👶 <strong>{recentDiapers.length}</strong> fraldas ({xixiCount} xixi, {cocoCount} cocô)
          </span>
          <span className="opacity-40">•</span>
          <span>
            🌙 <strong>{totalSleepHours}h</strong> de sono
          </span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
            Linha do Tempo de Hoje
          </h4>
          <span className="text-[11px] text-[#3D3230]/60 dark:text-[#A79895]">
            Sincronizado com a família
          </span>
        </div>

        {timelineItems.length === 0 ? (
          <p className="text-xs text-[#3D3230]/50 dark:text-[#A79895] text-center py-6 italic">
            Nenhum registro ainda hoje. Toque nos botões acima para registrar a rotina do seu bebê!
          </p>
        ) : (
          <div className="space-y-2">
            {timelineItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#FBF3EF]/50 dark:bg-[#1E1817] border border-[#F3D6CB]/40 dark:border-[#382C29] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'feeding'
                        ? 'bg-[#FBEFEA] text-[#8C4A3C]'
                        : item.type === 'diaper'
                        ? 'bg-[#EEF3EA] text-[#435139]'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {item.type === 'feeding' && <Milk className="w-4 h-4" />}
                    {item.type === 'diaper' && <Baby className="w-4 h-4" />}
                    {item.type === 'sleep' && <Moon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#3D3230] dark:text-[#F8ECE8]">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-[#3D3230]/70 dark:text-[#A79895]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Feeding Drawer / Modal --- */}
      {activeModal === 'feeding' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#251E1C] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#3D3230] dark:text-[#F8ECE8] text-center">
              Registrar Alimentação
            </h3>

            {/* Toggle breast vs bottle */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817]">
              <button
                type="button"
                onClick={() => setFeedingMode('breast')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  feedingMode === 'breast'
                    ? 'bg-[#8C4A3C] text-white shadow-xs'
                    : 'text-[#3D3230]/70 dark:text-[#A79895]'
                }`}
              >
                Peito (Amamentação)
              </button>
              <button
                type="button"
                onClick={() => setFeedingMode('bottle')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  feedingMode === 'bottle'
                    ? 'bg-[#8C4A3C] text-white shadow-xs'
                    : 'text-[#3D3230]/70 dark:text-[#A79895]'
                }`}
              >
                Mamadeira
              </button>
            </div>

            {feedingMode === 'breast' ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedingSide('esquerdo')}
                    className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold transition ${
                      feedingSide === 'esquerdo'
                        ? 'border-[#8C4A3C] bg-[#8C4A3C]/10 text-[#8C4A3C] dark:text-[#F3D6CB]'
                        : 'border-[#F3D6CB] text-[#3D3230]/70'
                    }`}
                  >
                    Peito Esquerdo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedingSide('direito')}
                    className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold transition ${
                      feedingSide === 'direito'
                        ? 'border-[#8C4A3C] bg-[#8C4A3C]/10 text-[#8C4A3C] dark:text-[#F3D6CB]'
                        : 'border-[#F3D6CB] text-[#3D3230]/70'
                    }`}
                  >
                    Peito Direito
                  </button>
                </div>

                {/* Stopwatch display */}
                <div className="py-2">
                  <span className="font-serif text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB]">
                    {formatTimer(feedingElapsed)}
                  </span>
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isFeedingTimerActive) {
                          setFeedingStartTime(Date.now() - feedingElapsed * 1000);
                          setIsFeedingTimerActive(true);
                        } else {
                          setIsFeedingTimerActive(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#8C4A3C] text-white text-xs font-bold shadow-xs"
                    >
                      {isFeedingTimerActive ? 'Pausar' : 'Iniciar Cronômetro'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895]">
                  Quantidade em ML: {bottleMl} ml
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120, 150, 180, 210, 240].map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => setBottleMl(ml)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        bottleMl === ml
                          ? 'border-[#8C4A3C] bg-[#8C4A3C] text-white'
                          : 'border-[#F3D6CB] text-[#3D3230]/70'
                      }`}
                    >
                      {ml} ml
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFeedingTimerActive(false);
                  setActiveModal(null);
                }}
                className="flex-1 py-3 rounded-2xl border border-[#F3D6CB] text-xs font-bold text-[#3D3230]/70"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFeeding}
                className="flex-1 py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Diaper Drawer / Modal --- */}
      {activeModal === 'diaper' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#251E1C] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#3D3230] dark:text-[#F8ECE8] text-center">
              Troca de Fralda
            </h3>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { kind: 'xixi' as DiaperKind, label: 'Xixi 💧' },
                { kind: 'coco' as DiaperKind, label: 'Cocô 💩' },
                { kind: 'ambos' as DiaperKind, label: 'Ambos 💧💩' },
              ].map((opt) => (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => setDiaperKind(opt.kind)}
                  className={`py-3 rounded-2xl border text-xs font-bold transition ${
                    diaperKind === opt.kind
                      ? 'border-[#8C4A3C] bg-[#8C4A3C] text-white'
                      : 'border-[#F3D6CB] text-[#3D3230]/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Visual Color Picker for stool */}
            {diaperKind !== 'xixi' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895]">
                  Cor do Cocô
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { color: 'amarelo' as DiaperColor, label: 'Amarelo Mostarda', bg: 'bg-amber-400' },
                    { color: 'verde' as DiaperColor, label: 'Esverdeado', bg: 'bg-emerald-600' },
                    { color: 'marrom' as DiaperColor, label: 'Acastanhado', bg: 'bg-amber-800' },
                    { color: 'preto' as DiaperColor, label: 'Preto (Mecônio)', bg: 'bg-stone-900' },
                    { color: 'branco_cinza' as DiaperColor, label: 'Branco / Cinza 🚨', bg: 'bg-stone-200' },
                    { color: 'com_sangue' as DiaperColor, label: 'Com Sangue 🚨', bg: 'bg-rose-600' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setDiaperColor(c.color)}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center gap-2 transition ${
                        diaperColor === c.color
                          ? 'border-[#8C4A3C] bg-[#8C4A3C]/10 text-[#8C4A3C] dark:text-[#F3D6CB]'
                          : 'border-[#F3D6CB]/70 text-[#3D3230]/70'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${c.bg} border border-black/10`} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pediatric Health Warning */}
            {isDiaperWarning && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Atenção e carinho:</span>
                </div>
                <p>
                  Fezes esbranquiçadas, cinzas ou com traços de sangue merecem avaliação do pediatra. Recomendamos tirar uma foto da fralda e mostrar ao médico na próxima consulta ou pronto-socorro infantil.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-2xl border border-[#F3D6CB] text-xs font-bold text-[#3D3230]/70"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDiaper}
                className="flex-1 py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md"
              >
                Salvar Fralda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Sleep Modal --- */}
      {activeModal === 'sleep' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#251E1C] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] space-y-4 text-center">
            <h3 className="font-serif font-bold text-lg text-[#3D3230] dark:text-[#F8ECE8]">
              Controle do Sono do Bebê
            </h3>

            <div className="py-4">
              <span className="font-serif text-4xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB]">
                {formatTimer(sleepElapsed)}
              </span>
              <p className="text-xs text-[#3D3230]/60 dark:text-[#A79895] mt-1">
                {isSleepTimerActive ? 'Bebê descansando...' : 'Pronto para iniciar'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-2xl border border-[#F3D6CB] text-xs font-bold text-[#3D3230]/70"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleToggleSleep}
                className="flex-1 py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md"
              >
                {isSleepTimerActive ? 'Acordou! Salvar Soneca' : 'Iniciar Soneca'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
