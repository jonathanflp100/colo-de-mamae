import React, { useState } from 'react';
import { Sparkles, Baby, Timer, Calendar, PackageCheck, FileHeart, Milk, Moon, Volume2, Heart, PartyPopper } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { calculateWeeksPregnant, calculateBabyAge, formatFriendlyDate } from '../lib/dateUtils';
import { ContractionTimerSection } from '../components/ContractionTimerSection';
import { AppointmentsSection } from '../components/AppointmentsSection';
import { MaternityBagChecklist } from '../components/MaternityBagChecklist';
import { BirthPlanSection } from '../components/BirthPlanSection';
import { BabyTrackerSection } from '../components/BabyTrackerSection';
import { BabySoundsPlayer } from '../components/BabySoundsPlayer';
import { BabyBornModal } from '../components/BabyBornModal';

type PregnancyToolTab = 'contractions' | 'appointments' | 'checklist' | 'birth_plan';
type BabyToolTab = 'tracker' | 'sounds' | 'pediatric_visits';

export const JourneyPage: React.FC = () => {
  const { profile } = useAuth();
  const { t, locale } = useI18n();

  const isMother = profile?.phase === 'mae';

  // Active sub-tab
  const [pregnancyTab, setPregnancyTab] = useState<PregnancyToolTab>('contractions');
  const [babyTab, setBabyTab] = useState<BabyToolTab>('tracker');

  // Modal
  const [isBabyBornModalOpen, setIsBabyBornModalOpen] = useState(false);

  // Calculations
  const weeksPregnant = calculateWeeksPregnant(profile?.due_date, profile?.last_period_date);
  const babyAge = calculateBabyAge(profile?.baby_birth_date);
  const dueFormatted = profile?.due_date ? formatFriendlyDate(profile.due_date, locale) : 'A definir';

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      {/* If Gestante, show subtle top celebration banner */}
      {!isMother && (
        <div
          onClick={() => setIsBabyBornModalOpen(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FBEFEA] to-[#F3D6CB]/60 dark:from-[#322320] dark:to-[#251E1C] border border-[#8C4A3C]/30 flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:border-[#8C4A3C] transition active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8C4A3C] text-white flex items-center justify-center shrink-0 shadow-xs">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8C4A3C] dark:text-[#F3D6CB]">
                Seu bebê já nasceu?
              </p>
              <p className="text-[11px] text-[#3D3230]/75 dark:text-[#D1C2BE]">
                Clique aqui para comemorar e abrir o diário do recém-nascido
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-[#8C4A3C] text-white text-[11px] font-bold shrink-0">
            Comemorar
          </span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#8C4A3C] to-[#A65D4F] text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            {isMother ? <Baby className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              {isMother ? `Cuidados com ${profile?.baby_name || 'meu bebê'}` : `Semana ${weeksPregnant} da Gestação`}
            </h2>
            <p className="text-xs text-white/85 mt-0.5">
              {isMother
                ? `${babyAge.label} • Rotina sincronizada com a família`
                : `Data provável do parto: ${dueFormatted}`}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      {!isMother ? (
        // Pregnancy Tabs
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29]">
          <button
            onClick={() => setPregnancyTab('contractions')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition ${
              pregnancyTab === 'contractions'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span className="truncate max-w-[70px]">Contrações</span>
          </button>

          <button
            onClick={() => setPregnancyTab('appointments')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition ${
              pregnancyTab === 'appointments'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="truncate max-w-[70px]">Consultas</span>
          </button>

          <button
            onClick={() => setPregnancyTab('checklist')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition ${
              pregnancyTab === 'checklist'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span className="truncate max-w-[70px]">Mala Parto</span>
          </button>

          <button
            onClick={() => setPregnancyTab('birth_plan')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition ${
              pregnancyTab === 'birth_plan'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            <FileHeart className="w-4 h-4" />
            <span className="truncate max-w-[70px]">Plano Parto</span>
          </button>
        </div>
      ) : (
        // Mother / Baby Tabs
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29]">
          <button
            onClick={() => setBabyTab('tracker')}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              babyTab === 'tracker'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>Diário do Bebê</span>
          </button>

          <button
            onClick={() => setBabyTab('sounds')}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              babyTab === 'sounds'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Sons / Acalmar</span>
          </button>

          <button
            onClick={() => setBabyTab('pediatric_visits')}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              babyTab === 'pediatric_visits'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Pediatra & Vacinas</span>
          </button>
        </div>
      )}

      {/* Render Active View */}
      {!isMother ? (
        <div>
          {pregnancyTab === 'contractions' && <ContractionTimerSection />}
          {pregnancyTab === 'appointments' && <AppointmentsSection />}
          {pregnancyTab === 'checklist' && <MaternityBagChecklist />}
          {pregnancyTab === 'birth_plan' && <BirthPlanSection />}
        </div>
      ) : (
        <div>
          {babyTab === 'tracker' && <BabyTrackerSection />}
          {babyTab === 'sounds' && <BabySoundsPlayer />}
          {babyTab === 'pediatric_visits' && <AppointmentsSection />}
        </div>
      )}

      {/* Transition Modal */}
      <BabyBornModal
        isOpen={isBabyBornModalOpen}
        onClose={() => setIsBabyBornModalOpen(false)}
      />
    </div>
  );
};
