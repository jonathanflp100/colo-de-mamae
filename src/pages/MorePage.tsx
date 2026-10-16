import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Globe,
  Moon,
  Sun,
  Shield,
  FileText,
  LogOut,
  Trash2,
  Edit3,
  Calendar,
  Users,
  Check,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  Baby,
  BookOpen,
  PartyPopper,
  ShieldAlert,
  LayoutDashboard,
} from 'lucide-react';
import { dataService } from '../data/dataService';
import { LocaleType, PhaseType } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { useI18n } from '../i18n';
import { formatFriendlyDate } from '../lib/dateUtils';
import { validateNickname } from '../lib/nicknameUtils';
import { TERMS_OF_USE, PRIVACY_POLICY } from '../content/legalContent';
import { EbookReaderModal, EbookItem } from '../components/EbookReaderModal';
import { BabyBornModal } from '../components/BabyBornModal';

export const MorePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, turma, signOut, deleteAccount, refreshProfile } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { isDark, toggle: toggleDark } = useDarkMode();

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBabyBornModal, setShowBabyBornModal] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

  // Delete account double-confirmation state
  // Step 0: none, Step 1: first warning modal, Step 2: typing 'EXCLUIR' final modal
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EbookItem | null>(null);

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

  // Edit profile form state
  const [editNickname, setEditNickname] = useState(profile?.nickname || '');
  const [editPhase, setEditPhase] = useState<PhaseType>(profile?.phase || 'gestante');
  const [editDueDate, setEditDueDate] = useState(profile?.due_date || '');
  const [editBabyBirthDate, setEditBabyBirthDate] = useState(profile?.baby_birth_date || '');
  const [editBabyName, setEditBabyName] = useState(profile?.baby_name || '');
  const [editError, setEditError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Open edit modal
  const handleOpenEdit = () => {
    setEditNickname(profile?.nickname || '');
    setEditPhase(profile?.phase || 'gestante');
    setEditDueDate(profile?.due_date || '');
    setEditBabyBirthDate(profile?.baby_birth_date || '');
    setEditBabyName(profile?.baby_name || '');
    setEditError('');
    setShowEditModal(true);
  };

  // Save edited profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const valResult = validateNickname(editNickname);
    if (!valResult.isValid) {
      setEditError(t(valResult.errorKey || 'onboarding.nickname_invalid'));
      return;
    }

    setIsSavingProfile(true);
    setEditError('');

    try {
      // Check availability if changed
      if (editNickname.trim().toLowerCase() !== profile?.nickname.toLowerCase()) {
        const available = await dataService.checkNicknameAvailable(editNickname, user.id);
        if (!available) {
          setEditError(t('onboarding.nickname_taken'));
          setIsSavingProfile(false);
          return;
        }
      }

      // Check if dates require changing Turma
      const targetDate = editPhase === 'gestante' ? editDueDate : editBabyBirthDate;
      let newTurmaId = profile?.turma_id;
      if (targetDate) {
        const newTurma = await dataService.getOrCreateTurmaForDate(targetDate, locale);
        newTurmaId = newTurma.id;
      }

      await dataService.updateProfile(user.id, {
        nickname: editNickname.trim(),
        phase: editPhase,
        due_date: editPhase === 'gestante' ? editDueDate : null,
        baby_birth_date: editPhase === 'mae' ? editBabyBirthDate : null,
        baby_name: editPhase === 'mae' ? editBabyName.trim() : null,
        turma_id: newTurmaId,
      });

      await refreshProfile();
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err?.message || t('common.error'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Execute account deletion after step 2 confirmation
  const handleFinalDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setIsDeleting(false);
    }
  };

  const isMother = profile?.phase === 'mae';
  const displayDate = isMother
    ? formatFriendlyDate(profile?.baby_birth_date || '', locale)
    : formatFriendlyDate(profile?.due_date || '', locale);

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-300">
      {/* Profile Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8C4A3C] to-[#73392E] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              {profile?.nickname ? profile.nickname.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#3D3230] dark:text-[#F8ECE8]">
                {profile?.nickname || 'Mamãe'}
              </h2>
              <span className="text-xs text-[#6F7F62] dark:text-[#A7B69B] font-medium flex items-center gap-1">
                {isMother ? <Baby className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isMother ? 'Mãe com bebê no ninho' : 'Gestante em espera'}
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FBEFEA] dark:bg-[#322320] text-[#8C4A3C] dark:text-[#F3D6CB] border border-[#F3D6CB] dark:border-[#422C28] text-xs font-semibold hover:bg-[#F3D6CB]/60 transition cursor-pointer min-h-[38px]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('more.edit_profile')}</span>
          </button>
        </div>

        <div className="space-y-2 pt-3 border-t border-[#F3D6CB]/40 dark:border-[#382C29] text-xs">
          <div className="flex items-center justify-between text-[#3D3230]/80 dark:text-[#D1C2BE]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8C4A3C]" />
              <span>{isMother ? t('more.birth_date') : t('more.due_date')}</span>
            </span>
            <span className="font-semibold text-[#3D3230] dark:text-[#F8ECE8]">
              {displayDate || 'Não definida'}
            </span>
          </div>

          {isMother && profile?.baby_name && (
            <div className="flex items-center justify-between text-[#3D3230]/80 dark:text-[#D1C2BE]">
              <span className="flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-[#8C4A3C]" />
                <span>{t('more.baby_name')}</span>
              </span>
              <span className="font-semibold text-[#3D3230] dark:text-[#F8ECE8]">
                {profile.baby_name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[#3D3230]/80 dark:text-[#D1C2BE]">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#6F7F62]" />
              <span>{t('more.turma')}</span>
            </span>
            <span className="font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">
              {turma?.label || 'Aguardando alocação'}
            </span>
          </div>

          {!isMother && (
            <div className="pt-2 border-t border-[#F3D6CB]/40 dark:border-[#382C29]">
              <button
                onClick={() => setShowBabyBornModal(true)}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#FBEFEA] to-[#F3D6CB]/60 dark:from-[#322320] dark:to-[#251E1C] border border-[#8C4A3C]/30 text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-bold flex items-center justify-center gap-2 hover:border-[#8C4A3C] transition shadow-xs active:scale-98"
              >
                <PartyPopper className="w-4 h-4 text-[#8C4A3C]" />
                <span>Meu bebê já nasceu! Clique aqui para atualizar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Panel Entry (visible only for admin or demo mode) */}
      {(profile?.is_admin || dataService.isDemoMode) && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#8C4A3C]/10 via-[#F3D6CB]/40 to-[#6F7F62]/10 dark:from-[#382622] dark:via-[#2A1D1A] dark:to-[#222B1F] border-2 border-[#8C4A3C]/40 dark:border-[#8C4A3C]/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8C4A3C] text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#3D3230] dark:text-[#F8ECE8]">
                    Painel
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#8C4A3C] text-white text-[10px] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#3D3230]/70 dark:text-[#D1C2BE]">
                  Moderação da comunidade, acolhimento de risco e suporte a mães
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="w-full py-3 px-4 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Acessar Painel de Administração</span>
          </button>
        </div>
      )}

      {/* App Preferences */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB] uppercase tracking-wider">
          {t('more.preferences_section')}
        </h3>

        {/* Language selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#8C4A3C] dark:text-[#F3D6CB]" />
            <div>
              <p className="text-sm font-semibold text-[#3D3230] dark:text-[#F8ECE8]">
                {t('more.language')}
              </p>
              <p className="text-[11px] text-[#3D3230]/60 dark:text-[#A79895]">
                {locale === 'pt' ? 'Português' : locale === 'es' ? 'Español' : 'English'}
              </p>
            </div>
          </div>

          <div className="flex gap-1 bg-[#FBF3EF] dark:bg-[#1A1514] p-1 rounded-2xl border border-[#F3D6CB] dark:border-[#382C29]">
            {(['pt', 'es', 'en'] as LocaleType[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition cursor-pointer ${
                  locale === loc
                    ? 'bg-[#8C4A3C] text-white shadow-xs'
                    : 'text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Dark mode toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F3D6CB]/40 dark:border-[#382C29]">
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Moon className="w-5 h-5 text-[#F3D6CB]" />
            ) : (
              <Sun className="w-5 h-5 text-[#8C4A3C]" />
            )}
            <div>
              <p className="text-sm font-semibold text-[#3D3230] dark:text-[#F8ECE8]">
                {t('more.dark_mode')}
              </p>
              <p className="text-[11px] text-[#3D3230]/60 dark:text-[#A79895]">
                {t('more.dark_mode_desc')}
              </p>
            </div>
          </div>

          <button
            onClick={toggleDark}
            aria-label={t('more.dark_mode')}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              isDark ? 'bg-[#8C4A3C]' : 'bg-[#F3D6CB]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Meus Guias & E-books Section */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8C4A3C] dark:text-[#F3D6CB]" />
            <h3 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB] uppercase tracking-wider">
              Meus Guias & E-books
            </h3>
          </div>
          <span className="text-[10px] text-[#6F7F62] dark:text-[#A7B69B] font-bold uppercase">
            Inclusos
          </span>
        </div>

        <div className="space-y-2">
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              onClick={() => setSelectedEbook(ebook)}
              className="p-3 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/50 dark:border-[#382C29] flex items-center justify-between hover:border-[#8C4A3C]/40 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-11 rounded-lg ${ebook.gradient} flex items-center justify-center text-white text-[9px] font-bold shadow-xs shrink-0`}>
                  PDF
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#3D3230] dark:text-[#F8ECE8]">
                    {ebook.title}
                  </h4>
                  <p className="text-[10px] text-[#3D3230]/65 dark:text-[#D1C2BE]">
                    {ebook.subtitle} • {ebook.pages} págs
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold underline underline-offset-2">
                Abrir
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Legal */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-3">
        <h3 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB] uppercase tracking-wider mb-2">
          {t('more.security_section')}
        </h3>

        <button
          onClick={() => setLegalModalType('terms')}
          className="w-full flex items-center justify-between py-2 text-left cursor-pointer hover:opacity-80 transition"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#8C4A3C]" />
            <span className="text-xs sm:text-sm font-medium text-[#3D3230] dark:text-[#F8ECE8]">
              {t('more.terms_of_use')}
            </span>
          </div>
          <span className="text-xs text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold">Visualizar</span>
        </button>

        <button
          onClick={() => setLegalModalType('privacy')}
          className="w-full flex items-center justify-between py-2 text-left cursor-pointer hover:opacity-80 transition border-t border-[#F3D6CB]/30 dark:border-[#382C29]"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#6F7F62]" />
            <span className="text-xs sm:text-sm font-medium text-[#3D3230] dark:text-[#F8ECE8]">
              {t('more.privacy_policy')}
            </span>
          </div>
          <span className="text-xs text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold">Visualizar</span>
        </button>
      </div>

      {/* Account Actions */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-3">
        <button
          onClick={() => signOut().then(() => navigate('/'))}
          className="w-full py-3 px-4 rounded-2xl bg-[#FBEFEA] dark:bg-[#2F211D] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#F3D6CB]/60 transition active:scale-[0.98] cursor-pointer min-h-[46px]"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('more.sign_out')}</span>
        </button>

        <button
          onClick={() => setDeleteStep(1)}
          className="w-full py-3 px-4 rounded-2xl bg-[#B03622]/10 dark:bg-[#3A1E1A] text-[#B03622] dark:text-[#F29486] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#B03622]/20 transition active:scale-[0.98] cursor-pointer min-h-[46px]"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t('more.delete_account')}</span>
        </button>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#8C4A3C] dark:text-[#F3D6CB]">
                {t('more.edit_profile')}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 dark:text-[#D1C2BE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-[#B03622]/10 border border-[#B03622]/30 text-[#B03622] text-xs">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                  {t('more.anonymous_name')}
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                  {t('more.current_phase')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPhase('gestante')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      editPhase === 'gestante'
                        ? 'bg-[#8C4A3C] text-white border-[#8C4A3C]'
                        : 'bg-white dark:bg-[#1E1817] border-[#F3D6CB] dark:border-[#382C29] text-[#3D3230] dark:text-[#D1C2BE]'
                    }`}
                  >
                    Estou Grávida
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPhase('mae')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      editPhase === 'mae'
                        ? 'bg-[#8C4A3C] text-white border-[#8C4A3C]'
                        : 'bg-white dark:bg-[#1E1817] border-[#F3D6CB] dark:border-[#382C29] text-[#3D3230] dark:text-[#D1C2BE]'
                    }`}
                  >
                    Meu Bebê Já Nasceu
                  </button>
                </div>
              </div>

              {editPhase === 'gestante' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                    {t('more.due_date')}
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-sm text-[#3D3230] dark:text-[#F8ECE8]"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                      {t('more.birth_date')}
                    </label>
                    <input
                      type="date"
                      value={editBabyBirthDate}
                      onChange={(e) => setEditBabyBirthDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-sm text-[#3D3230] dark:text-[#F8ECE8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                      {t('more.baby_name')}
                    </label>
                    <input
                      type="text"
                      value={editBabyName}
                      onChange={(e) => setEditBabyName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-sm text-[#3D3230] dark:text-[#F8ECE8]"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#3E2B27] text-xs font-semibold text-[#3D3230] dark:text-[#D1C2BE] cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isSavingProfile ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEGAL MODAL */}
      {legalModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[85vh] rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] flex flex-col overflow-hidden">
            <h3 className="text-lg font-serif font-bold text-[#8C4A3C] dark:text-[#F3D6CB] mb-3">
              {legalModalType === 'terms' ? TERMS_OF_USE.title : PRIVACY_POLICY.title}
            </h3>
            <div className="overflow-y-auto space-y-4 pr-1 text-xs text-[#3D3230] dark:text-[#E0D0CC] flex-1">
              {(legalModalType === 'terms' ? TERMS_OF_USE.sections : PRIVACY_POLICY.sections).map((sec, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-[#1E1817] rounded-xl border border-[#F3D6CB]/60 dark:border-[#382C29]">
                  <h4 className="font-semibold text-[#8C4A3C] dark:text-[#F3D6CB] mb-1">{sec.title}</h4>
                  <p className="leading-relaxed">{sec.content}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLegalModalType(null)}
              className="mt-4 w-full py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-semibold hover:bg-[#73392E] transition cursor-pointer min-h-[44px]"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION MODAL - STEP 1 */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
            <div className="w-12 h-12 rounded-2xl bg-[#B03622]/15 text-[#B03622] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-center text-[#B03622] mb-2">
              {t('more.delete_confirm_title')} (1/2)
            </h3>
            <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] text-center leading-relaxed mb-6">
              {t('more.delete_confirm_desc')}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setDeleteStep(2)}
                className="w-full py-3 rounded-2xl bg-[#B03622] hover:bg-[#8F2B1A] text-white text-xs font-semibold transition cursor-pointer min-h-[44px]"
              >
                Prosseguir para confirmação definitiva
              </button>
              <button
                onClick={() => setDeleteStep(0)}
                className="w-full py-3 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#382C29] text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] hover:bg-black/5 cursor-pointer min-h-[44px]"
              >
                {t('more.delete_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION MODAL - STEP 2 */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#B03622]/30">
            <div className="w-12 h-12 rounded-2xl bg-[#B03622] text-white flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-center text-[#B03622] mb-2">
              Confirmação Final (2/2)
            </h3>
            <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] text-center mb-4">
              Para confirmar a exclusão irreversível, digite a palavra <strong>EXCLUIR</strong> abaixo:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
              placeholder="EXCLUIR"
              className="w-full px-4 py-3 bg-white dark:bg-[#1E1817] border border-[#B03622]/40 rounded-xl text-center text-sm font-bold tracking-widest text-[#B03622] mb-4 focus:outline-none focus:ring-2 focus:ring-[#B03622]"
            />

            <div className="space-y-2">
              <button
                disabled={deleteConfirmText !== 'EXCLUIR' || isDeleting}
                onClick={handleFinalDelete}
                className="w-full py-3 rounded-2xl bg-[#B03622] hover:bg-[#8F2B1A] text-white text-xs font-semibold transition cursor-pointer min-h-[44px] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{t('more.delete_confirm_btn')}</span>
                )}
              </button>
              <button
                disabled={isDeleting}
                onClick={() => {
                  setDeleteStep(0);
                  setDeleteConfirmText('');
                }}
                className="w-full py-3 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#382C29] text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] hover:bg-black/5 cursor-pointer min-h-[44px]"
              >
                {t('more.delete_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EBOOK READER MODAL */}
      <EbookReaderModal
        ebook={selectedEbook}
        onClose={() => setSelectedEbook(null)}
      />

      {/* BABY BORN MODAL */}
      <BabyBornModal
        isOpen={showBabyBornModal}
        onClose={() => setShowBabyBornModal(false)}
        onSuccess={() => navigate('/jornada')}
      />
    </div>
  );
};
