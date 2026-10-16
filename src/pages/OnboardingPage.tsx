import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Sparkles,
  Calendar,
  UserCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Wand2,
  AlertCircle,
  Loader2,
  Users,
  Heart,
  FileText,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { AppLogo } from '../components/AppLogo';
import { dataService } from '../data/dataService';
import { PhaseType, Turma } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import {
  calculateDueDateFromLMP,
  formatFriendlyDate,
  getTurmaDetailsFromDate,
  validateDueDate,
  validateBabyBirthDate,
} from '../lib/dateUtils';
import { generateSuggestedNickname, validateNickname } from '../lib/nicknameUtils';
import { TERMS_OF_USE, PRIVACY_POLICY } from '../content/legalContent';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, isDemoMode } = useAuth();
  const { t, locale } = useI18n();

  // Wizard Steps: 1 -> 2 -> 3 -> 4 -> 5 (Celebration)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [phase, setPhase] = useState<PhaseType>('gestante');

  // Step 2 (Dates)
  const [dueDate, setDueDate] = useState<string>('');
  const [useLMP, setUseLMP] = useState<boolean>(false);
  const [lmpDate, setLmpDate] = useState<string>('');
  const [babyBirthDate, setBabyBirthDate] = useState<string>('');
  const [babyName, setBabyName] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  // Step 3 (Nickname)
  const [nickname, setNickname] = useState<string>('');
  const [nicknameError, setNicknameError] = useState<string>('');
  const [isCheckingNickname, setIsCheckingNickname] = useState<boolean>(false);

  // Step 4 (Terms checkboxes)
  const [adultChecked, setAdultChecked] = useState<boolean>(false);
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [healthChecked, setHealthChecked] = useState<boolean>(false);

  // Modals for Terms & Privacy
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Step 5 (Final Turma info)
  const [assignedTurma, setAssignedTurma] = useState<Turma | null>(null);
  const [mothersCount, setMothersCount] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Handle LMP auto calculation of DPP
  const handleLmpChange = (val: string) => {
    setLmpDate(val);
    const calculated = calculateDueDateFromLMP(val);
    if (calculated) {
      setDueDate(calculated);
    }
  };

  // Step 2 Proceed with friendly validation
  const handleProceedFromDates = () => {
    setDateError('');
    if (phase === 'gestante') {
      if (!dueDate) {
        setDateError('Por favor, informe a data provável do parto.');
        return;
      }
      const val = validateDueDate(dueDate);
      if (!val.isValid) {
        setDateError(val.error || 'Data provável do parto fora do período permitido.');
        return;
      }
    } else {
      if (!babyBirthDate) {
        setDateError('Por favor, informe a data de nascimento do bebê.');
        return;
      }
      const val = validateBabyBirthDate(babyBirthDate);
      if (!val.isValid) {
        setDateError(val.error || 'Data de nascimento fora do período permitido.');
        return;
      }
    }
    setStep(3);
  };

  // Suggest nickname button
  const handleSuggestNickname = () => {
    const suggested = generateSuggestedNickname();
    setNickname(suggested);
    setNicknameError('');
  };

  // Step 3 Next validation
  const validateAndProceedFromNickname = async () => {
    const valResult = validateNickname(nickname);
    if (!valResult.isValid) {
      setNicknameError(t(valResult.errorKey || 'onboarding.nickname_invalid'));
      return;
    }

    setIsCheckingNickname(true);
    setNicknameError('');
    try {
      const isAvailable = await dataService.checkNicknameAvailable(nickname, user?.id);
      if (!isAvailable) {
        setNicknameError(t('onboarding.nickname_taken'));
        setIsCheckingNickname(false);
        return;
      }
      setIsCheckingNickname(false);
      setStep(4);
    } catch {
      setNicknameError('Erro ao verificar apelido. Tente novamente.');
      setIsCheckingNickname(false);
    }
  };

  // Submit and create profile + find/create turma
  const handleCompleteOnboarding = async () => {
    if (!adultChecked || !termsChecked || !healthChecked) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const targetDate = phase === 'gestante' ? (dueDate || new Date().toISOString().split('T')[0]) : (babyBirthDate || new Date().toISOString().split('T')[0]);
      const turma = await dataService.getOrCreateTurmaForDate(targetDate, locale);
      const count = await dataService.getTurmaMemberCount(turma.id);

      const nowIso = new Date().toISOString();
      const updatedProfile = await dataService.createProfile({
        id: user.id,
        email: user.email,
        nickname: nickname.trim(),
        phase,
        due_date: phase === 'gestante' ? dueDate : null,
        last_period_date: phase === 'gestante' && useLMP ? lmpDate : null,
        baby_birth_date: phase === 'mae' ? babyBirthDate : null,
        baby_name: phase === 'mae' ? babyName.trim() : null,
        turma_id: turma.id,
        locale,
        is_admin: false,
        is_adult_confirmed: true,
        accepted_terms_at: nowIso,
        health_consent_at: nowIso,
        created_at: profile?.created_at || nowIso,
      });

      setAssignedTurma(turma);
      setMothersCount(count);
      await refreshProfile();
      setStep(5);
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = Math.min((step / 4) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F0E6E1] dark:bg-[#0F0C0B] flex justify-center selection:bg-[#F3D6CB] selection:text-[#8C4A3C]">
      <div className="w-full max-w-md min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col justify-between p-6 shadow-2xl border-x border-[#F3D6CB]/30 dark:border-[#2C2321] relative overflow-y-auto">
        {/* Top Header & Progress Bar */}
        {step < 5 && (
          <div className="pt-2 mb-6">
            <div className="flex items-center justify-between mb-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] flex items-center justify-center text-[#8C4A3C] dark:text-[#F3D6CB] hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-9 h-9" />
              )}
              <AppLogo size="sm" showText={false} />
              <span className="text-xs font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">
                {t('onboarding.step_progress', { current: step, total: 4 })}
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-[#F3D6CB]/40 dark:bg-[#342421] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8C4A3C] dark:bg-[#F3D6CB] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Phase selection */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="my-auto py-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-2 leading-tight">
                {t('onboarding.step1_title')}
              </h2>
              <p className="text-sm text-[#3D3230]/75 dark:text-[#D1C2BE] mb-6">
                {t('onboarding.step1_desc')}
              </p>

              <div className="space-y-4">
                {/* Option Pregnant */}
                <button
                  type="button"
                  onClick={() => setPhase('gestante')}
                  className={`w-full p-5 rounded-3xl border-2 text-left transition-all duration-200 cursor-pointer shadow-xs flex items-center gap-4 ${
                    phase === 'gestante'
                      ? 'border-[#8C4A3C] bg-white dark:bg-[#261E1C] ring-2 ring-[#8C4A3C]/20'
                      : 'border-[#F3D6CB]/70 dark:border-[#382C29] bg-white/60 dark:bg-[#1E1817] hover:border-[#8C4A3C]/50'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      phase === 'gestante'
                        ? 'bg-[#8C4A3C] text-white shadow-sm'
                        : 'bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB]'
                    }`}
                  >
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif font-bold text-base text-[#3D3230] dark:text-[#F8ECE8]">
                        {t('onboarding.option_pregnant')}
                      </h3>
                      {phase === 'gestante' && (
                        <div className="w-6 h-6 rounded-full bg-[#8C4A3C] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#3D3230]/70 dark:text-[#BFAFAD] leading-relaxed">
                      {t('onboarding.option_pregnant_sub')}
                    </p>
                  </div>
                </button>

                {/* Option Mother */}
                <button
                  type="button"
                  onClick={() => setPhase('mae')}
                  className={`w-full p-5 rounded-3xl border-2 text-left transition-all duration-200 cursor-pointer shadow-xs flex items-center gap-4 ${
                    phase === 'mae'
                      ? 'border-[#8C4A3C] bg-white dark:bg-[#261E1C] ring-2 ring-[#8C4A3C]/20'
                      : 'border-[#F3D6CB]/70 dark:border-[#382C29] bg-white/60 dark:bg-[#1E1817] hover:border-[#8C4A3C]/50'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                      phase === 'mae'
                        ? 'bg-[#8C4A3C] text-white shadow-sm'
                        : 'bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB]'
                    }`}
                  >
                    <Baby className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif font-bold text-base text-[#3D3230] dark:text-[#F8ECE8]">
                        {t('onboarding.option_mother')}
                      </h3>
                      {phase === 'mae' && (
                        <div className="w-6 h-6 rounded-full bg-[#8C4A3C] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#3D3230]/70 dark:text-[#BFAFAD] leading-relaxed">
                      {t('onboarding.option_mother_sub')}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 px-6 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-base shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
              >
                <span>{t('onboarding.next_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Dates (DPP or Birth date) */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="my-auto py-4">
              {phase === 'gestante' ? (
                <>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-2 leading-tight">
                    {t('onboarding.step2_due_title')}
                  </h2>
                  <p className="text-sm text-[#3D3230]/75 dark:text-[#D1C2BE] mb-6">
                    {t('onboarding.step2_due_desc')}
                  </p>

                  <div className="space-y-4">
                    {!useLMP ? (
                      <div>
                        <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1.5">
                          Data provável do parto (DPP)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C4A3C]">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-base text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[50px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] space-y-3">
                        <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC]">
                          {t('onboarding.step2_dum_label')}
                        </label>
                        <input
                          type="date"
                          value={lmpDate}
                          onChange={(e) => handleLmpChange(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FBF3EF] dark:bg-[#1A1514] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-base text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[48px]"
                        />
                        {dueDate && (
                          <div className="p-2.5 rounded-xl bg-[#EEF3EA] dark:bg-[#1E271B] text-[#435139] dark:text-[#C5D6BF] text-xs font-medium flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-[#6F7F62]" />
                            <span>
                              {t('onboarding.step2_calculated_dpp', {
                                date: formatFriendlyDate(dueDate, locale),
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle between DPP and LMP */}
                    <button
                      type="button"
                      onClick={() => setUseLMP(!useLMP)}
                      className="text-xs text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold underline underline-offset-2 hover:opacity-80 transition cursor-pointer"
                    >
                      {useLMP
                        ? 'Já sei a DPP, quero informar a data prevista direto'
                        : t('onboarding.step2_dum_toggle')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-2 leading-tight">
                    {t('onboarding.step2_baby_title')}
                  </h2>
                  <p className="text-sm text-[#3D3230]/75 dark:text-[#D1C2BE] mb-6">
                    Para conectarmos você à turma que compartilha este mesmo mês.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1.5">
                        {t('onboarding.step2_baby_date_label')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C4A3C]">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <input
                          type="date"
                          value={babyBirthDate}
                          onChange={(e) => setBabyBirthDate(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-base text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[50px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1.5">
                        {t('onboarding.step2_baby_name_label')}
                      </label>
                      <input
                        type="text"
                        value={babyName}
                        onChange={(e) => setBabyName(e.target.value)}
                        placeholder={t('onboarding.step2_baby_name_placeholder')}
                        className="w-full px-4 py-3.5 bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[50px]"
                      />
                    </div>
                  </div>
                </>
              )}

              {dateError && (
                <div className="mt-4 p-3 rounded-2xl bg-[#B03622]/10 border border-[#B03622]/30 text-[#B03622] text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{dateError}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleProceedFromDates}
                className="w-full py-4 px-6 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-base shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
              >
                <span>{t('onboarding.next_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Anonymous Nickname */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="my-auto py-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-2 leading-tight">
                {t('onboarding.step3_nickname_title')}
              </h2>
              <p className="text-sm text-[#3D3230]/75 dark:text-[#D1C2BE] mb-6">
                {t('onboarding.step3_nickname_desc')}
              </p>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC]">
                  {t('onboarding.nickname_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C4A3C]">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameError('');
                    }}
                    placeholder={t('onboarding.nickname_placeholder')}
                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-base text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[50px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleSuggestNickname}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FBEFEA] dark:bg-[#2C201D] text-[#8C4A3C] dark:text-[#F3D6CB] border border-[#F3D6CB] dark:border-[#422C28] text-xs font-semibold hover:bg-[#F3D6CB]/60 transition cursor-pointer min-h-[40px]"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{t('onboarding.suggest_btn')}</span>
                  </button>

                  <span className="text-[11px] text-[#3D3230]/50 dark:text-[#A79895]">
                    {nickname.length}/20
                  </span>
                </div>

                <p className="text-[11px] text-[#3D3230]/65 dark:text-[#A79895] leading-relaxed">
                  💡 {t('onboarding.nickname_rules')}
                </p>

                {nicknameError && (
                  <div className="p-3 rounded-xl bg-[#B03622]/10 border border-[#B03622]/30 text-[#B03622] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{nicknameError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={isCheckingNickname || !nickname.trim()}
                onClick={validateAndProceedFromNickname}
                className="w-full py-4 px-6 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-base shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-50"
              >
                {isCheckingNickname ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{t('onboarding.next_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Terms & Health Consent */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="my-auto py-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-2 leading-tight">
                {t('onboarding.step4_terms_title')}
              </h2>
              <p className="text-sm text-[#3D3230]/75 dark:text-[#D1C2BE] mb-6">
                {t('onboarding.step4_terms_desc')}
              </p>

              <div className="space-y-4">
                {/* Box 1: 18+ */}
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] cursor-pointer hover:border-[#8C4A3C]/40 transition">
                  <input
                    type="checkbox"
                    checked={adultChecked}
                    onChange={(e) => setAdultChecked(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded-md accent-[#8C4A3C] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-medium text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed">
                    {t('onboarding.term_adult')}
                  </span>
                </label>

                {/* Box 2: Terms of Use & Privacy */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsChecked}
                      onChange={(e) => setTermsChecked(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded-md accent-[#8C4A3C] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-medium text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed">
                      {t('onboarding.term_rules')}
                    </span>
                  </label>
                  <div className="flex items-center gap-3 mt-2 pl-8 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveLegalModal('terms')}
                      className="text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{t('onboarding.view_terms')}</span>
                    </button>
                    <span className="text-[#3D3230]/30 dark:text-[#A79895]">•</span>
                    <button
                      type="button"
                      onClick={() => setActiveLegalModal('privacy')}
                      className="text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                    >
                      <Shield className="w-3 h-3" />
                      <span>{t('onboarding.view_privacy')}</span>
                    </button>
                  </div>
                </div>

                {/* Box 3: Health Data Consent (LGPD) */}
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] cursor-pointer hover:border-[#8C4A3C]/40 transition">
                  <input
                    type="checkbox"
                    checked={healthChecked}
                    onChange={(e) => setHealthChecked(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded-md accent-[#8C4A3C] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-medium text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed">
                    {t('onboarding.term_health')}
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={submitting || !adultChecked || !termsChecked || !healthChecked}
                onClick={handleCompleteOnboarding}
                className="w-full py-4 px-6 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-base shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{t('onboarding.finish_btn')}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Final Animated Celebration Screen */}
        {step === 5 && assignedTurma && (
          <div className="flex-1 flex flex-col justify-between py-6 animate-in fade-in duration-500">
            {/* Soft celebratory floating graphics */}
            <div className="my-auto flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#8C4A3C] to-[#F3D6CB] flex items-center justify-center text-white shadow-xl animate-bounce">
                  <Heart className="w-12 h-12 fill-white/90 text-white" />
                </div>
                {/* Floating sparkles */}
                <Sparkles className="w-6 h-6 text-[#8C4A3C] dark:text-[#F3D6CB] absolute -top-1 -right-2 animate-pulse" />
                <Sparkles className="w-5 h-5 text-[#6F7F62] absolute -bottom-1 -left-2 animate-pulse" />
              </div>

              <h2 className="font-serif text-3xl font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-3">
                {t('onboarding.step5_welcome')}
              </h2>

              {/* Turma badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FBEFEA] dark:bg-[#2E221E] border border-[#F3D6CB] dark:border-[#422C28] text-base font-serif font-bold text-[#8C4A3C] dark:text-[#F3D6CB] shadow-sm mb-4">
                <Users className="w-5 h-5 text-[#8C4A3C] dark:text-[#F3D6CB]" />
                <span>{assignedTurma.label}</span>
              </div>

              {/* Mothers count notice */}
              <div className="p-4 mb-6 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] max-w-xs shadow-xs">
                <p className="text-sm font-semibold text-[#3D3230] dark:text-[#F8ECE8] mb-1">
                  {t('onboarding.step5_mothers_count', { count: mothersCount })}
                </p>
                <p className="text-xs text-[#3D3230]/70 dark:text-[#BFAFAD] leading-relaxed">
                  {t('onboarding.step5_ready_text')}
                </p>
              </div>

              <div className="text-xs text-[#6F7F62] dark:text-[#A7B69B] font-medium">
                Seu apelido anônimo: <strong>{nickname}</strong>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-4 px-6 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white font-medium text-base shadow-md shadow-[#8C4A3C]/20 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
              >
                <span>{t('onboarding.step5_enter_app')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Legal Modal (Terms or Privacy) */}
        {activeLegalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md max-h-[85vh] rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] flex flex-col overflow-hidden">
              <h3 className="text-lg font-serif font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-3">
                {activeLegalModal === 'terms' ? TERMS_OF_USE.title : PRIVACY_POLICY.title}
              </h3>
              <div className="overflow-y-auto space-y-4 pr-1 text-xs text-[#3D3230] dark:text-[#E0D0CC] flex-1">
                {(activeLegalModal === 'terms' ? TERMS_OF_USE.sections : PRIVACY_POLICY.sections).map((sec, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-[#1E1817] rounded-xl border border-[#F3D6CB]/60 dark:border-[#382C29]">
                    <h4 className="font-semibold text-[#8C4A3C] dark:text-[#F3D6CB] mb-1">{sec.title}</h4>
                    <p className="leading-relaxed">{sec.content}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="mt-4 w-full py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-semibold hover:bg-[#73392E] transition cursor-pointer min-h-[44px]"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
