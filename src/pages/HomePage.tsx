import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Baby,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  HeartHandshake,
  Sun,
  Moon,
  CloudSun,
  Utensils,
  MoonStar,
  Activity,
  Briefcase,
  Music,
} from 'lucide-react';
import { parseISO, isValid } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { parseDateParts } from '../lib/dateUtils';
import { StoryCardModal } from '../components/StoryCardModal';
import { EbookReaderModal, EbookItem } from '../components/EbookReaderModal';
import { QuickActionModal, QuickActionData } from '../components/QuickActionModal';

// Content imports
import weeksDataPt from '../content/weeks.pt.json';
import babyWeeksDataPt from '../content/babyWeeks.pt.json';
import dailyCarePt from '../content/dailyCare.pt.json';

const FAVORITES_STORAGE = 'colodemae_favorite_affirmations';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, turma } = useAuth();
  const { t, locale } = useI18n();

  const isMother = profile?.phase === 'mae';

  const today = useMemo(() => new Date(), []);

  // 1. Calculate dynamic current week and days (timezone-safe via manual parse)
  const { calculatedWeek, daysRemaining, isOverdueAndPast40, babyAgeDays, babyAgeWeeks, babyAgeExtraDays } = useMemo(() => {
    if (!isMother) {
      if (profile?.due_date) {
        const parts = parseDateParts(profile.due_date);
        if (parts) {
          const now = new Date();
          const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
          const dueMid = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
          const diffDays = Math.round((dueMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
          const passedDays = 280 - diffDays;
          const rawWeek = Math.floor(passedDays / 7) + 1;
          const isPast40 = rawWeek > 40 || diffDays <= 0;
          const week = Math.max(1, Math.min(40, rawWeek));
          return {
            calculatedWeek: week,
            daysRemaining: Math.max(0, diffDays),
            isOverdueAndPast40: isPast40,
            babyAgeDays: 0,
            babyAgeWeeks: 0,
            babyAgeExtraDays: 0,
          };
        }
      }
      return {
        calculatedWeek: 20, // default mid-pregnancy demo
        daysRemaining: 140,
        isOverdueAndPast40: false,
        babyAgeDays: 0,
        babyAgeWeeks: 0,
        babyAgeExtraDays: 0,
      };
    } else {
      if (profile?.baby_birth_date) {
        const parts = parseDateParts(profile.baby_birth_date);
        if (parts) {
          const now = new Date();
          const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
          const birthMid = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
          const diffDays = Math.max(0, Math.round((todayMid.getTime() - birthMid.getTime()) / (1000 * 60 * 60 * 24)));
          const weeks = Math.min(52, Math.floor(diffDays / 7));
          const extra = diffDays % 7;
          return {
            calculatedWeek: weeks,
            daysRemaining: 0,
            isOverdueAndPast40: false,
            babyAgeDays: diffDays,
            babyAgeWeeks: weeks,
            babyAgeExtraDays: extra,
          };
        }
      }
      return {
        calculatedWeek: 4, // default 1 month demo
        daysRemaining: 0,
        isOverdueAndPast40: false,
        babyAgeDays: 28,
        babyAgeWeeks: 4,
        babyAgeExtraDays: 0,
      };
    }
  }, [isMother, profile?.due_date, profile?.baby_birth_date]);

  // Selected week for browsing (< and > arrows)
  const [selectedWeek, setSelectedWeek] = useState<number>(calculatedWeek);

  // Expandable sections state
  const [isBabySectionOpen, setIsBabySectionOpen] = useState(true);
  const [isMotherSectionOpen, setIsMotherSectionOpen] = useState(true);

  // Modals state
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EbookItem | null>(null);
  const [selectedQuickAction, setSelectedQuickAction] = useState<QuickActionData | null>(null);

  // Favorites state for Daily Care
  const [favoriteMessages, setFavoriteMessages] = useState<string[]>(() => {
    const raw = localStorage.getItem(FAVORITES_STORAGE);
    return raw ? JSON.parse(raw) : [];
  });

  // Greeting by hour of day (bom dia / boa tarde / boa noite)
  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, [today]);

  // Greeting icon
  const GreetingIcon = useMemo(() => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) return Sun;
    if (hour >= 12 && hour < 18) return CloudSun;
    return Moon;
  }, [today]);

  // Deterministic daily care message (same all day)
  const dailyAffirmation = useMemo(() => {
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const index = Math.abs(dayOfYear) % dailyCarePt.length;
    return dailyCarePt[index] || 'Você é forte, acolhedora e está fazendo um trabalho admirável.';
  }, [today]);

  const isFavorite = favoriteMessages.includes(dailyAffirmation);

  const toggleFavorite = () => {
    let updated: string[];
    if (isFavorite) {
      updated = favoriteMessages.filter((m) => m !== dailyAffirmation);
    } else {
      updated = [...favoriteMessages, dailyAffirmation];
    }
    setFavoriteMessages(updated);
    localStorage.setItem(FAVORITES_STORAGE, JSON.stringify(updated));
  };

  // Get active week data from JSON
  const currentWeekPregnancy = useMemo(() => {
    const found = weeksDataPt.find((w) => w.week === selectedWeek);
    const item = found || {
      week: selectedWeek,
      fruit: 'Fruta Nutritiva',
      emoji: '🌱',
      size: '12 cm',
      baby: 'Seu bebê segue desenvolvendo seus sentidos e crescendo em harmonia.',
      mother: 'Seu corpo se adapta suavemente a cada nova semana de gestação.',
      tip: 'Descanse e mantenha a hidratação em dia.',
    };
    const emoji = (!item.emoji || item.emoji === '✨') ? '🌱' : item.emoji;
    return {
      ...item,
      emoji,
    };
  }, [selectedWeek]);

  const currentWeekBaby = useMemo(() => {
    const found = babyWeeksDataPt.find((w) => w.week === selectedWeek);
    return (
      found || {
        week: selectedWeek,
        title: `Semana ${selectedWeek} de Vida`,
        development: 'O bebê interage com os olhares e descobre sons e sensações com serenidade.',
        tip: 'Aproveite os momentos de vigília calma para conversar de pertinho.',
      }
    );
  }, [selectedWeek]);

  // Circular progress ring calculation (0 to 40 weeks)
  const progressRatio = Math.min(Math.max(selectedWeek / 40, 0.05), 1);
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - progressRatio * ringCircumference;

  // Ebooks list
  const ebooks: EbookItem[] = [
    {
      id: 'ebook1',
      title: 'Gestação Semana a Semana',
      subtitle: 'Guia ilustrado de cada fase',
      pages: 36,
      pdfUrl: '/ebooks/ebook1.pdf',
      gradient: 'bg-gradient-to-br from-[#8C4A3C] to-[#A65D4F]',
      accent: '#8C4A3C',
    },
    {
      id: 'ebook2',
      title: 'Os Primeiros 90 Dias',
      subtitle: 'Manual acolhedor do puerpério',
      pages: 32,
      pdfUrl: '/ebooks/ebook2.pdf',
      gradient: 'bg-gradient-to-br from-[#6F7F62] to-[#4A5B40]',
      accent: '#6F7F62',
    },
    {
      id: 'ebook3',
      title: 'Amamentação Sem Drama',
      subtitle: 'Dicas práticas de pega e conforto',
      pages: 28,
      pdfUrl: '/ebooks/ebook3.pdf',
      gradient: 'bg-gradient-to-br from-[#73392E] to-[#59271E]',
      accent: '#73392E',
    },
  ];

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-300">
      {/* 1. Header greeting & Turma chip */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#FBEFEA] dark:bg-[#2C201D] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center shrink-0 shadow-xs">
            <GreetingIcon className="w-5 h-5 text-[#8C4A3C]" />
          </div>
          <div className="truncate">
            <p className="text-xs text-[#3D3230]/70 dark:text-[#D1C2BE] font-medium leading-none mb-1">
              {greeting},
            </p>
            <h2 className="font-serif font-bold text-lg text-[#3D3230] dark:text-[#F8ECE8] leading-none truncate">
              {profile?.nickname || 'Mamãe'}
            </h2>
          </div>
        </div>

        {/* Turma Chip */}
        <button
          onClick={() => navigate('/turma')}
          className="px-3 py-1.5 rounded-full bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] text-[11px] font-semibold text-[#8C4A3C] dark:text-[#F3D6CB] shadow-xs flex items-center gap-1.5 shrink-0 hover:bg-[#FBEFEA] transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#6F7F62]" />
          <span className="truncate max-w-[130px]">{turma?.label || 'Turma Ativa'}</span>
        </button>
      </div>

      {/* Week Navigator Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#251E1C] rounded-2xl border border-[#F3D6CB]/60 dark:border-[#382C29] shadow-xs text-xs">
        <button
          onClick={() => setSelectedWeek((prev) => Math.max(isMother ? 0 : 1, prev - 1))}
          disabled={selectedWeek <= (isMother ? 0 : 1)}
          className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#8C4A3C] dark:text-[#F3D6CB] disabled:opacity-30 cursor-pointer"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB]">
            Semana {selectedWeek}
          </span>
          {selectedWeek !== calculatedWeek && (
            <button
              onClick={() => setSelectedWeek(calculatedWeek)}
              className="block mx-auto text-[10px] text-[#6F7F62] dark:text-[#A7B69B] underline font-semibold mt-0.5 cursor-pointer"
            >
              Voltar para minha semana ({calculatedWeek})
            </button>
          )}
        </div>

        <button
          onClick={() => setSelectedWeek((prev) => Math.min(isMother ? 52 : 40, prev + 1))}
          disabled={selectedWeek >= (isMother ? 52 : 40)}
          className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#8C4A3C] dark:text-[#F3D6CB] disabled:opacity-30 cursor-pointer"
          aria-label="Próxima semana"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Main Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#F3D6CB] via-[#F8E5DE] to-[#FBEFEA] dark:from-[#2C211F] dark:via-[#261C1A] dark:to-[#1E1716] border border-[#F3D6CB] dark:border-[#3E2D29] text-[#3D3230] dark:text-[#F8ECE8] shadow-sm relative overflow-hidden">
        {/* Soft decorative glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/40 dark:bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {!isMother ? (
          // Pregnancy Main Card
          <div className="flex flex-col items-center text-center">
            {/* Chip Gestação em curso em sálvia clara #EEF3EA com texto sálvia #6F7F62 */}
            <span className="px-3 py-1 rounded-full bg-[#EEF3EA] dark:bg-[#1E271B] text-[#6F7F62] dark:text-[#A7B69B] font-semibold text-xs tracking-wider uppercase mb-3 shadow-2xs">
              Gestação em curso
            </span>

            {/* Circular fruit illustration with countdown progress ring: terracota sobre trilho rosé */}
            <div className="relative w-28 h-28 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90">
                {/* Trilho rosé */}
                <circle
                  cx="56"
                  cy="56"
                  r={ringRadius}
                  stroke="#F3D6CB"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Animated progress em terracota */}
                <circle
                  cx="56"
                  cy="56"
                  r={ringRadius}
                  stroke="#8C4A3C"
                  strokeWidth="6"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center Fruit Emblem - Círculo branco com emoji da fruta grande */}
              <div className="absolute w-20 h-20 rounded-full bg-white dark:bg-[#251E1C] flex items-center justify-center shadow-md text-4xl border border-[#F3D6CB]/40 dark:border-[#382C29]">
                <span>{currentWeekPregnancy.emoji}</span>
              </div>
            </div>

            {/* Texto: Semana 40 (ou 40+) em terracota #8C4A3C */}
            <h3 className="font-serif text-3xl font-bold tracking-tight text-[#8C4A3C] dark:text-[#E89280] mt-2">
              {isOverdueAndPast40 ? 'Semana 40+' : `Semana ${currentWeekPregnancy.week}`}
            </h3>

            {/* Demais textos em #3D3230 */}
            <p className="text-sm font-medium text-[#3D3230] dark:text-[#E6D8D5] mt-1 mb-1">
              Seu bebê está do tamanho de <strong className="text-[#3D3230] dark:text-white font-bold">{currentWeekPregnancy.fruit}</strong>
            </p>

            <span className="text-xs text-[#3D3230]/75 dark:text-[#BFAFAD] font-normal">
              Aproximadamente {currentWeekPregnancy.size}
            </span>

            {/* Countdown pill: se passar de 40, mensagem acolhedora */}
            {isOverdueAndPast40 ? (
              <div className="mt-4 px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] text-xs font-semibold text-[#8C4A3C] dark:text-[#E89280] flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#8C4A3C] dark:text-[#E89280]" />
                <span>Seu bebê pode chegar a qualquer momento</span>
              </div>
            ) : (
              <div className="mt-4 px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] text-xs font-semibold text-[#3D3230] dark:text-[#F8ECE8] flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-4 h-4 text-[#8C4A3C]" />
                <span>Faltam {daysRemaining} dias para a DPP</span>
              </div>
            )}
          </div>
        ) : (
          // Mother Main Card
          <div className="flex flex-col items-center text-center">
            <span className="px-3 py-1 rounded-full bg-[#EEF3EA] dark:bg-[#1E271B] text-[#6F7F62] dark:text-[#A7B69B] font-semibold text-xs tracking-wider uppercase mb-3 shadow-2xs">
              Mãe com bebê no ninho
            </span>

            {/* Baby Emblem */}
            <div className="w-24 h-24 rounded-full bg-white dark:bg-[#251E1C] flex items-center justify-center shadow-md text-4xl my-2 border border-[#F3D6CB]/40 dark:border-[#382C29]">
              <span>👶</span>
            </div>

            <h3 className="font-serif text-2xl font-bold tracking-tight text-[#8C4A3C] dark:text-[#E89280] mt-2">
              {profile?.baby_name ? `${profile.baby_name} tem` : 'Seu pequeno tem'}
            </h3>

            <p className="text-base font-serif font-bold text-[#3D3230] dark:text-[#F8ECE8] mt-1 mb-2">
              {babyAgeWeeks} semanas e {babyAgeExtraDays} dias
            </p>

            <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] leading-relaxed max-w-xs">
              {currentWeekBaby.title}: {currentWeekBaby.development}
            </p>
          </div>
        )}

        {/* 3. Compartilhar minha semana button - Terracota sólido com texto branco (único elemento escuro) */}
        <div className="mt-5 pt-4 border-t border-[#F3D6CB] dark:border-[#382C29] flex justify-center">
          <button
            onClick={() => setShowStoryModal(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Compartilhar minha semana</span>
          </button>
        </div>
      </div>

      {/* 4. Expandable Cards: "O bebê esta semana" & "Você esta semana" */}
      <div className="space-y-3">
        {/* Baby Details Card */}
        <div className="rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setIsBabySectionOpen(!isBabySectionOpen)}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#EEF3EA] dark:bg-[#20291D] text-[#6F7F62] flex items-center justify-center">
                {isMother ? <Baby className="w-5 h-5 text-[#6F7F62]" /> : <Sparkles className="w-5 h-5 text-[#6F7F62]" />}
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
                  {isMother ? 'Desenvolvimento do bebê' : 'O bebê esta semana'}
                </h4>
                <p className="text-[11px] text-[#3D3230]/65 dark:text-[#D1C2BE]">
                  {isMother ? currentWeekBaby.title : `Descobertas da Semana ${selectedWeek}`}
                </p>
              </div>
            </div>
            {isBabySectionOpen ? (
              <ChevronUp className="w-5 h-5 text-[#3D3230]/50" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#3D3230]/50" />
            )}
          </button>

          {isBabySectionOpen && (
            <div className="px-4 pb-4 pt-1 text-xs text-[#3D3230]/85 dark:text-[#E0D0CC] leading-relaxed border-t border-[#F3D6CB]/30 dark:border-[#382C29]">
              <p>{isMother ? currentWeekBaby.development : currentWeekPregnancy.baby}</p>
            </div>
          )}
        </div>

        {/* Mother Details Card */}
        <div className="rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setIsMotherSectionOpen(!isMotherSectionOpen)}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#8C4A3C]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
                  {isMother ? 'Dica de cuidado e mãe' : 'Você esta semana'}
                </h4>
                <p className="text-[11px] text-[#3D3230]/65 dark:text-[#D1C2BE]">
                  {isMother ? 'Conforto para o puerpério' : 'Transformações no seu corpo'}
                </p>
              </div>
            </div>
            {isMotherSectionOpen ? (
              <ChevronUp className="w-5 h-5 text-[#3D3230]/50" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#3D3230]/50" />
            )}
          </button>

          {isMotherSectionOpen && (
            <div className="px-4 pb-4 pt-1 text-xs text-[#3D3230]/85 dark:text-[#E0D0CC] leading-relaxed border-t border-[#F3D6CB]/30 dark:border-[#382C29] space-y-2">
              <p>{isMother ? currentWeekBaby.tip : currentWeekPregnancy.mother}</p>
              {!isMother && currentWeekPregnancy.tip && (
                <div className="p-3 rounded-xl bg-[#EEF3EA] dark:bg-[#1E271B] text-[#435139] dark:text-[#C5D6BF] font-medium text-[11px]">
                  💡 <strong>Dica da semana:</strong> {currentWeekPregnancy.tip}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Carinho do dia (Daily message with heart button) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FBEFEA] to-[#F3D6CB]/40 dark:from-[#2B1F1C] dark:to-[#382925] border border-[#F3D6CB] dark:border-[#422C28] shadow-xs relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Carinho do Dia
          </span>

          {/* Heart button for favorites */}
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label="Salvar nos favoritos"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isFavorite
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'bg-white dark:bg-[#251E1C] text-[#8C4A3C] dark:text-[#F3D6CB] hover:bg-[#F3D6CB]/40'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : ''}`} />
          </button>
        </div>

        <p className="font-serif italic text-sm sm:text-base text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed pr-6">
          "{dailyAffirmation}"
        </p>

        {isFavorite && (
          <span className="inline-block mt-2 text-[10px] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold">
            ❤️ Guardado nas suas mensagens favoritas
          </span>
        )}
      </div>

      {/* 6. Agora na sua turma (Preview of 2 questions with link to Turma) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#8C4A3C] dark:text-[#F3D6CB]" />
            <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
              Agora na sua turma
            </h4>
          </div>
          <button
            onClick={() => navigate('/turma')}
            className="text-xs font-semibold text-[#8C4A3C] dark:text-[#F3D6CB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {/* Question 1 */}
          <div
            onClick={() => navigate('/turma')}
            className="p-3 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/50 dark:border-[#382C29] hover:border-[#8C4A3C]/40 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] text-[#3D3230]/60 dark:text-[#A79895] mb-1">
              <span className="font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">Lua Serena 14</span>
              <span>há 2 horas</span>
            </div>
            <p className="font-medium text-[#3D3230] dark:text-[#F8ECE8] line-clamp-1">
              "Mais alguém com dificuldade para achar posição de dormir nesta semana?"
            </p>
            <span className="text-[10px] text-[#6F7F62] dark:text-[#A7B69B] mt-1 inline-block font-semibold">
              💬 8 respostas acolhedoras
            </span>
          </div>

          {/* Question 2 */}
          <div
            onClick={() => navigate('/turma')}
            className="p-3 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/50 dark:border-[#382C29] hover:border-[#8C4A3C]/40 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] text-[#3D3230]/60 dark:text-[#A79895] mb-1">
              <span className="font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">Girassol Manso 32</span>
              <span>há 4 horas</span>
            </div>
            <p className="font-medium text-[#3D3230] dark:text-[#F8ECE8] line-clamp-1">
              "Qual o chá ou lanchinho que tem salvado vocês no final da tarde?"
            </p>
            <span className="text-[10px] text-[#6F7F62] dark:text-[#A7B69B] mt-1 inline-block font-semibold">
              💬 12 mães comentaram
            </span>
          </div>
        </div>
      </div>

      {/* 7. Quick shortcuts grid (Large touch-friendly icons) */}
      <div className="space-y-2">
        <h4 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB] uppercase tracking-wider px-1">
          Atalhos Rápidos
        </h4>

        <div className="grid grid-cols-4 gap-2">
          {!isMother ? (
            // Pregnant Shortcuts
            <>
              <button
                type="button"
                onClick={() => navigate('/jornada')}
                className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex flex-col items-center justify-center text-center hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer min-h-[76px] shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center mb-1">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#3D3230] dark:text-[#E0D0CC] leading-tight">
                  Contrações
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/jornada')}
                className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex flex-col items-center justify-center text-center hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer min-h-[76px] shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EEF3EA] dark:bg-[#20291D] text-[#6F7F62] flex items-center justify-center mb-1">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#3D3230] dark:text-[#E0D0CC] leading-tight">
                  Consultas
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/jornada')}
                className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex flex-col items-center justify-center text-center hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer min-h-[76px] shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center mb-1">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#3D3230] dark:text-[#E0D0CC] leading-tight">
                  Mala
                </span>
              </button>
            </>
          ) : (
            // Mother Shortcuts
            <>
              <button
                type="button"
                onClick={() => navigate('/jornada')}
                className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex flex-col items-center justify-center text-center hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer min-h-[76px] shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center mb-1">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#3D3230] dark:text-[#E0D0CC] leading-tight">
                  Mamada
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/jornada')}
                className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex flex-col items-center justify-center text-center hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer min-h-[76px] shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EEF3EA] dark:bg-[#20291D] text-[#6F7F62] flex items-center justify-center mb-1">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#3D3230] dark:text-[#E0D0CC] leading-tight">
                  Fralda
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/jornada')}
                className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex flex-col items-center justify-center text-center hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer min-h-[76px] shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center mb-1">
                  <MoonStar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#3D3230] dark:text-[#E0D0CC] leading-tight">
                  Sono
                </span>
              </button>
            </>
          )}

          {/* 4th Shortcut: "Acalmar o bebê" (both phases) */}
          <button
            type="button"
            onClick={() => navigate('/jornada')}
            className="p-3 rounded-2xl bg-[#EEF3EA] dark:bg-[#1E281C] border border-[#6F7F62]/40 flex flex-col items-center justify-center text-center hover:bg-[#6F7F62]/20 transition active:scale-95 cursor-pointer min-h-[76px] shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#6F7F62] text-white flex items-center justify-center mb-1 shadow-xs">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#435139] dark:text-[#C5D6BF] leading-tight">
              Acalmar
            </span>
          </button>
        </div>
      </div>

      {/* 8. Biblioteca / Meus Guias (CSS-drawn covers + PDF viewer) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8C4A3C] dark:text-[#F3D6CB]" />
            <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
              Meus Guias & E-books
            </h4>
          </div>
          <span className="text-[11px] text-[#6F7F62] dark:text-[#A7B69B] font-semibold">
            Inclusos no acesso
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              onClick={() => setSelectedEbook(ebook)}
              className="group rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] p-2.5 flex flex-col justify-between shadow-xs hover:border-[#8C4A3C]/50 hover:shadow-sm transition cursor-pointer"
            >
              {/* CSS Book Cover Mockup */}
              <div
                className={`w-full aspect-[3/4] rounded-xl ${ebook.gradient} p-2 text-white flex flex-col justify-between shadow-sm relative overflow-hidden group-hover:scale-[1.02] transition`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-md" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/80">
                  COLO DE MÃE
                </span>
                <p className="font-serif text-[11px] font-bold leading-tight">
                  {ebook.title}
                </p>
                <span className="text-[9px] text-white/70">
                  {ebook.pages} págs
                </span>
              </div>

              <div className="mt-2 text-center">
                <p className="text-[11px] font-bold text-[#3D3230] dark:text-[#F8ECE8] leading-tight truncate">
                  {ebook.title}
                </p>
                <span className="text-[10px] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold">
                  Ler agora
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <StoryCardModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        isMother={isMother}
        week={selectedWeek}
        fruit={currentWeekPregnancy.fruit}
        emoji={currentWeekPregnancy.emoji}
        size={currentWeekPregnancy.size}
        daysRemaining={daysRemaining}
        babyName={profile?.baby_name || ''}
        babyMilestone={currentWeekBaby.title}
      />

      <EbookReaderModal
        ebook={selectedEbook}
        onClose={() => setSelectedEbook(null)}
      />

      <QuickActionModal
        action={selectedQuickAction}
        onClose={() => setSelectedQuickAction(null)}
      />
    </div>
  );
};
