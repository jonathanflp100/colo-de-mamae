import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  MessageCircle,
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  RefreshCw,
  X,
  Check,
  Eye,
  EyeOff,
  Ban,
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  UserPlus,
  TrendingUp,
  Sparkles,
  HeartHandshake,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../data/dataService';
import {
  AdminSummaryStats,
  AdminReportItem,
  RiskAlert,
  ScheduledQuestion,
  TurmaAdminInfo,
  Profile,
} from '../data/types';
import { getAvatarStyle } from '../lib/avatarColor';

// 30 Ready-made suggested questions for Question of the Day
export const READY_QUESTION_SUGGESTIONS: string[] = [
  'Qual foi o desejo de gravidez mais estranho ou inesperado que você teve até agora?',
  'O que ninguém te contou sobre o puerpério e você gostaria de ter sabido antes?',
  'Qual pequeno instante de paz ou respiração te salvou no dia de hoje?',
  'Qual cheiro ou alimento virou seu pesadelo durante o primeiro trimestre?',
  'Como você e seu parceiro(a) ou rede de apoio têm dividido as madrugadas?',
  'Qual foi o palpite mais sem noção que você já ouviu desde o positivo?',
  'Qual foi o momento em que a ficha finalmente caiu que você é mãe?',
  'O que você mais sente falta de antes da maternidade, sem culpa nenhuma?',
  'Qual item do enxoval você comprou e foi indispensável, e qual foi inútil?',
  'Qual música, som ou truque tem acalmado você ou o seu bebê nos dias difíceis?',
  'Qual foi a primeira roupa que você colocou no bebê ao sair da maternidade?',
  'Como foi a sensação da primeira vez que você sentiu o bebê chutar?',
  'Qual conselho acolhedor você daria para si mesma no dia que descobriu a gravidez?',
  'O que você tem feito para cuidar de você mesma nos últimos dias?',
  'Qual foi o choro mais espontâneo ou engraçado que você teve por bobeira recentemente?',
  'Qual é o apelido carinhoso mais fofo que você já deu para o seu bebê?',
  'Como tem sido a sua relação com o seu corpo nesta fase?',
  'Qual foi a vitória de hoje, mesmo que pareça pequena para o mundo?',
  'O que você mais teme no parto ou no pós-parto e gostaria de desabafar?',
  'Qual comida você está sonhando em comer com calma depois do parto?',
  'Qual foi a surpresa mais linda da amamentação ou da alimentação do bebê?',
  'Como você lida com a sensação de culpa materna quando ela bate na sua porta?',
  'Qual foi o exame de ultrassom mais emocionante até agora?',
  'Se você pudesse pedir apenas um desejo para a sua rede de apoio hoje, qual seria?',
  'Qual hábito ou mania fofa o seu bebê desenvolveu recentemente?',
  'Qual o momento do dia que você mais gosta junto do bebê ou da sua barriga?',
  'Como você escolheu o nome do seu bebê e qual o significado especial para vocês?',
  'O que você faz quando sente que a paciência ou o cansaço chegaram no limite?',
  'Qual o elogio ou palavra de carinho que você mais gostaria de escutar hoje?',
  'Se você pudesse deixar uma mensagem para o seu bebê ler daqui a 20 anos, o que diria?',
];

type AdminTab = 'resumo' | 'moderacao' | 'perguntas' | 'turmas' | 'maes';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Active tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('resumo');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<AdminSummaryStats | null>(null);
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [scheduledQuestions, setScheduledQuestions] = useState<ScheduledQuestion[]>([]);
  const [turmas, setTurmas] = useState<TurmaAdminInfo[]>([]);
  const [mothers, setMothers] = useState<Profile[]>([]);
  const [searchMother, setSearchMother] = useState('');

  // Modals & sub-state
  const [moderationSubTab, setModerationSubTab] = useState<'denuncias' | 'risco'>('denuncias');
  const [banConfirmTarget, setBanConfirmTarget] = useState<AdminReportItem | null>(null);
  const [motherBanConfirm, setMotherBanConfirm] = useState<Profile | null>(null);
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Question scheduling form
  const [newQuestionDate, setNewQuestionDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionTurma, setNewQuestionTurma] = useState<string>('all');
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // Extend access modal / form
  const [selectedMotherForAccess, setSelectedMotherForAccess] = useState<Profile | null>(null);
  const [customAccessDate, setCustomAccessDate] = useState('');

  // Load all initial data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, reps, rAlerts, sqs, ts, ms] = await Promise.all([
        dataService.getAdminSummaryStats(),
        dataService.getAdminReports(),
        dataService.getRiskAlerts(),
        dataService.getScheduledQuestions(),
        dataService.getAdminTurmas(),
        dataService.getAdminMothers(searchMother),
      ]);
      setStats(s);
      setReports(reps);
      setRiskAlerts(rAlerts);
      setScheduledQuestions(sqs);
      setTurmas(ts);
      setMothers(ms);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filter mothers dynamically
  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const ms = await dataService.getAdminMothers(searchMother);
        setMothers(ms);
      } catch (err) {
        console.error('Error searching mothers:', err);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [searchMother]);

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(''), 3500);
  };

  // Moderation actions
  const handleResolveReport = async (
    report: AdminReportItem,
    action: 'ocultar' | 'manter' | 'advertir' | 'banir'
  ) => {
    try {
      await dataService.resolveReport(report.id, action);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setBanConfirmTarget(null);
      if (action === 'ocultar') showToast('Conteúdo ocultado da comunidade com sucesso.');
      if (action === 'manter') showToast('Denúncia resolvida sem alterações.');
      if (action === 'advertir') showToast('Advertência registrada e enviada à usuária.');
      if (action === 'banir') showToast('Mãe banida da comunidade. Registros pessoais continuam seguros.');
      loadAdminData();
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  // Mark risk alert as accompanied
  const handleMarkAccompanied = async (alertId: string) => {
    try {
      await dataService.markRiskAlertAccompanied(alertId);
      setRiskAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'acompanhado' } : a))
      );
      showToast('Alerta de risco marcado como acompanhado pela moderação.');
    } catch (err) {
      console.error('Error updating risk alert:', err);
    }
  };

  // Save new scheduled question
  const handleSaveScheduledQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newQuestionDate) return;

    setIsSavingQuestion(true);
    try {
      const saved = await dataService.saveScheduledQuestion({
        date: newQuestionDate,
        question: newQuestionText.trim(),
        turma_id: newQuestionTurma,
      });
      setScheduledQuestions((prev) => {
        const idx = prev.findIndex((q) => q.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved].sort((a, b) => a.date.localeCompare(b.date));
      });
      setNewQuestionText('');
      showToast(`Pergunta agendada com sucesso para ${newQuestionDate}!`);
    } catch (err) {
      console.error('Error saving scheduled question:', err);
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Delete scheduled question
  const handleDeleteScheduledQuestion = async (id: string) => {
    try {
      await dataService.deleteScheduledQuestion(id);
      setScheduledQuestions((prev) => prev.filter((q) => q.id !== id));
      showToast('Pergunta removida do cronograma.');
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  // Toggle merge turmas
  const handleToggleMergeTurma = async (sourceId: string, targetId?: string) => {
    try {
      await dataService.toggleMergeTurmas(sourceId, targetId);
      const updated = await dataService.getAdminTurmas();
      setTurmas(updated);
      showToast('Configuração de junção de turmas atualizada.');
    } catch (err) {
      console.error('Error toggling merge:', err);
    }
  };

  // Extend access
  const handleExtendAccessDays = async (mother: Profile, days: number) => {
    try {
      const current = mother.access_until ? new Date(mother.access_until) : new Date();
      const baseTime = current.getTime() > Date.now() ? current.getTime() : Date.now();
      const newDate = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();
      const updated = await dataService.extendMotherAccess(mother.id, newDate);
      setMothers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedMotherForAccess(null);
      showToast(`Acesso de ${mother.nickname || mother.email} estendido em +${days} dias!`);
    } catch (err) {
      console.error('Error extending access:', err);
    }
  };

  const handleCustomDateExtend = async (mother: Profile) => {
    if (!customAccessDate) return;
    try {
      const newDate = new Date(customAccessDate + 'T23:59:59').toISOString();
      const updated = await dataService.extendMotherAccess(mother.id, newDate);
      setMothers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedMotherForAccess(null);
      setCustomAccessDate('');
      showToast(`Acesso de ${mother.nickname || mother.email} atualizado para ${customAccessDate}!`);
    } catch (err) {
      console.error('Error extending access:', err);
    }
  };

  // Mother ban / warn directly
  const handleToggleMotherBan = async (mother: Profile, ban: boolean) => {
    try {
      const updated = await dataService.toggleMotherBan(mother.id, ban);
      setMothers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setMotherBanConfirm(null);
      showToast(ban ? 'Mãe suspensa da comunidade.' : 'Participação na comunidade restabelecida.');
    } catch (err) {
      console.error('Error toggling mother ban:', err);
    }
  };

  const handleWarnMother = async (mother: Profile) => {
    try {
      const updated = await dataService.warnMother(mother.id);
      setMothers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      showToast(`Advertência registrada para ${mother.nickname}.`);
    } catch (err) {
      console.error('Error warning mother:', err);
    }
  };

  const openReportsCount = reports.filter((r) => r.status === 'aberta').length;
  const pendingRiskAlertsCount = riskAlerts.filter((a) => a.status === 'pendente').length;

  return (
    <div className="flex-1 flex flex-col pb-24 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-[#6F7F62] text-white text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#251E1C] border-b border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/mais')}
              className="w-9 h-9 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center hover:bg-[#F3D6CB]/40 transition active:scale-95 cursor-pointer"
              title="Voltar para Mais"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-2xl text-[#8C4A3C] dark:text-[#F3D6CB] leading-tight">
                  Painel de Administração
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#8C4A3C] text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                  Moderação
                </span>
              </div>
              <p className="text-xs text-[#3D3230]/70 dark:text-[#D1C2BE]">
                Gestão da comunidade anônima, acolhimento humano e suporte a acessos
              </p>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-semibold hover:bg-[#F3D6CB]/60 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-5xl mx-auto mt-5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#F3D6CB]/40 dark:border-[#382C29]">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'resumo'
                  ? 'bg-[#8C4A3C] text-white shadow-xs'
                  : 'text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumo</span>
            </button>

            <button
              onClick={() => setActiveTab('moderacao')}
              className={`py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer relative ${
                activeTab === 'moderacao'
                  ? 'bg-[#8C4A3C] text-white shadow-xs'
                  : 'text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Moderação</span>
              {openReportsCount + pendingRiskAlertsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#B03622] text-white text-[10px] font-bold flex items-center justify-center">
                  {openReportsCount + pendingRiskAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('perguntas')}
              className={`py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'perguntas'
                  ? 'bg-[#8C4A3C] text-white shadow-xs'
                  : 'text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Pergunta do Dia</span>
            </button>

            <button
              onClick={() => setActiveTab('turmas')}
              className={`py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'turmas'
                  ? 'bg-[#8C4A3C] text-white shadow-xs'
                  : 'text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Turmas</span>
            </button>

            <button
              onClick={() => setActiveTab('maes')}
              className={`py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'maes'
                  ? 'bg-[#8C4A3C] text-white shadow-xs'
                  : 'text-[#3D3230]/70 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Mães e Acesso</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6">
        {/* ========================================================= */}
        {/* TAB 1: RESUMO                                             */}
        {/* ========================================================= */}
        {activeTab === 'resumo' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#3D3230]/65 dark:text-[#A79895] uppercase tracking-wider">
                    Acesso Ativo
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#6F7F62]/10 text-[#6F7F62] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-[#3D3230] dark:text-[#F8ECE8]">
                  {stats?.totalActiveMothers || 486}
                </div>
                <p className="text-[11px] text-[#6F7F62] font-semibold mt-1">
                  Mães com acesso regular
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#3D3230]/65 dark:text-[#A79895] uppercase tracking-wider">
                    Novas (7 dias)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#8C4A3C]/10 text-[#8C4A3C] flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-[#8C4A3C] dark:text-[#F3D6CB]">
                  +{stats?.newMothersLast7Days || 34}
                </div>
                <p className="text-[11px] text-[#8C4A3C] font-semibold mt-1">
                  Novos cadastros na semana
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#3D3230]/65 dark:text-[#A79895] uppercase tracking-wider">
                    Ativas Hoje
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#E8C547]/20 text-[#A67C00] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-[#3D3230] dark:text-[#F8ECE8]">
                  {stats?.activeMothersToday || 128}
                </div>
                <p className="text-[11px] text-[#3D3230]/60 dark:text-[#A79895] mt-1">
                  Participação em posts & salas
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#3D3230]/65 dark:text-[#A79895] uppercase tracking-wider">
                    Posts e Respostas
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#8C4A3C]/10 text-[#8C4A3C] flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-[#3D3230] dark:text-[#F8ECE8]">
                  {stats?.postsAndCommentsToday || 62}
                </div>
                <p className="text-[11px] text-[#3D3230]/60 dark:text-[#A79895] mt-1">
                  Interações geradas hoje
                </p>
              </div>
            </div>

            {/* Moderation Alert Bar if pending items */}
            {openReportsCount + pendingRiskAlertsCount > 0 && (
              <div className="p-4 rounded-2xl bg-[#B03622]/10 border border-[#B03622]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#B03622] shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#B03622]">
                      Atenção da moderação necessária
                    </h4>
                    <p className="text-xs text-[#B03622]/90">
                      Há {openReportsCount} denúncia(s) aberta(s) e {pendingRiskAlertsCount} alerta(s) de palavras de risco aguardando checagem.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('moderacao')}
                  className="py-2 px-3.5 rounded-xl bg-[#B03622] text-white text-xs font-bold hover:bg-[#8f2b1a] transition cursor-pointer"
                >
                  Abrir Fila de Moderação
                </button>
              </div>
            )}

            {/* 30-Day Activity Chart */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
                    Evolução da Comunidade (Últimos 30 Dias)
                  </h3>
                  <p className="text-xs text-[#3D3230]/60 dark:text-[#A79895]">
                    Crescimento orgânico de mães ativas e volume de mensagens acolhidas
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#8C4A3C]" />
                    <span className="font-medium text-[#3D3230] dark:text-[#E0D0CC]">Mães Ativas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#6F7F62]" />
                    <span className="font-medium text-[#3D3230] dark:text-[#E0D0CC]">Posts / Dia</span>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full h-56 pt-2">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mothersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8C4A3C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8C4A3C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#F3D6CB" strokeDasharray="3 3" strokeOpacity="0.5" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#F3D6CB" strokeDasharray="3 3" strokeOpacity="0.5" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="#F3D6CB" strokeDasharray="3 3" strokeOpacity="0.5" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#F3D6CB" strokeOpacity="0.7" />

                  {stats?.chart30Days && stats.chart30Days.length > 0 && (
                    <>
                      {/* Area Fill for Mothers */}
                      <path
                        d={`M 0,180 ${stats.chart30Days
                          .map((pt, idx) => {
                            const x = (idx / (stats.chart30Days.length - 1)) * 600;
                            // scale mothers 350-520 to y 160-30
                            const y = 170 - ((pt.mothers - 350) / 180) * 130;
                            return `L ${x},${Math.max(20, Math.min(175, y))}`;
                          })
                          .join(' ')} L 600,180 Z`}
                        fill="url(#mothersGrad)"
                      />

                      {/* Line for Mothers */}
                      <path
                        d={`M 0,${170 - (((stats.chart30Days[0]?.mothers || 380) - 350) / 180) * 130} ${stats.chart30Days
                          .map((pt, idx) => {
                            const x = (idx / (stats.chart30Days.length - 1)) * 600;
                            const y = 170 - ((pt.mothers - 350) / 180) * 130;
                            return `L ${x},${Math.max(20, Math.min(175, y))}`;
                          })
                          .join(' ')}`}
                        fill="none"
                        stroke="#8C4A3C"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Bars / Points for daily posts */}
                      {stats.chart30Days.map((pt, idx) => {
                        const x = (idx / (stats.chart30Days.length - 1)) * 600;
                        const barHeight = Math.min(50, pt.posts * 2.2);
                        return (
                          <rect
                            key={idx}
                            x={x - 2.5}
                            y={180 - barHeight}
                            width="5"
                            height={barHeight}
                            rx="2"
                            fill="#6F7F62"
                            opacity="0.85"
                          />
                        );
                      })}
                    </>
                  )}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] text-[#3D3230]/50 dark:text-[#A79895] px-1 pt-1">
                  <span>30 dias atrás</span>
                  <span>15 dias atrás</span>
                  <span>Hoje ({new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})</span>
                </div>
              </div>
            </div>

            {/* Most Active Turmas ranking */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
                Turmas Mais Ativas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats?.mostActiveTurmas.map((t, idx) => {
                  const maxCount = stats.mostActiveTurmas[0]?.count || 100;
                  const pct = Math.round((t.count / maxCount) * 100);
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#8C4A3C] text-white text-[11px] font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8]">
                            {t.label}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#8C4A3C] dark:text-[#F3D6CB]">
                          {t.count} mães
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8C4A3C] to-[#A65D4F]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MODERAÇÃO & ALERTAS DE RISCO                       */}
        {/* ========================================================= */}
        {activeTab === 'moderacao' && (
          <div className="space-y-6">
            {/* Moderation Sub-tabs */}
            <div className="flex gap-2 p-1.5 rounded-2xl bg-[#FBEFEA] dark:bg-[#201918] max-w-md">
              <button
                onClick={() => setModerationSubTab('denuncias')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  moderationSubTab === 'denuncias'
                    ? 'bg-white dark:bg-[#2F211D] text-[#8C4A3C] dark:text-[#F3D6CB] shadow-xs'
                    : 'text-[#3D3230]/70 dark:text-[#D1C2BE]'
                }`}
              >
                <span>Fila de Denúncias</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#8C4A3C] text-white text-[10px]">
                  {openReportsCount}
                </span>
              </button>

              <button
                onClick={() => setModerationSubTab('risco')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  moderationSubTab === 'risco'
                    ? 'bg-white dark:bg-[#2F211D] text-[#8C4A3C] dark:text-[#F3D6CB] shadow-xs'
                    : 'text-[#3D3230]/70 dark:text-[#D1C2BE]'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#B03622]" />
                <span>Alertas de Risco</span>
                {pendingRiskAlertsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#B03622] text-white text-[10px]">
                    {pendingRiskAlertsCount}
                  </span>
                )}
              </button>
            </div>

            {/* SUB-TAB 1: DENÚNCIAS */}
            {moderationSubTab === 'denuncias' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
                    Denúncias Abertas ({openReportsCount})
                  </h3>
                  <span className="text-xs text-[#3D3230]/60 dark:text-[#A79895]">
                    {reports.length} histórico total
                  </span>
                </div>

                {reports.filter((r) => r.status === 'aberta').length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-[#6F7F62] mx-auto" />
                    <h4 className="font-serif font-bold text-base text-[#3D3230] dark:text-[#F8ECE8]">
                      Nenhuma denúncia pendente!
                    </h4>
                    <p className="text-xs text-[#3D3230]/65 dark:text-[#D1C2BE] max-w-sm mx-auto">
                      A comunidade está tranquila e com acolhimento mútuo respeitado.
                    </p>
                  </div>
                ) : (
                  reports
                    .filter((r) => r.status === 'aberta')
                    .map((report) => (
                      <div
                        key={report.id}
                        className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border-2 border-[#B03622]/20 dark:border-[#B03622]/40 shadow-xs space-y-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-[#B03622]/10 text-[#B03622] text-xs font-bold uppercase tracking-wider">
                              {report.target_type}
                            </span>
                            <span className="text-xs text-[#3D3230]/60 dark:text-[#A79895]">
                              Denunciado por <strong className="text-[#3D3230] dark:text-[#F8ECE8]">{report.reporter_nickname}</strong>
                            </span>
                          </div>
                          <span className="text-[11px] text-[#3D3230]/50 dark:text-[#A79895]">
                            {new Date(report.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        {/* Motivo */}
                        <div className="p-3 rounded-2xl bg-[#FBEFEA] dark:bg-[#2E1E1C] text-xs space-y-1">
                          <span className="font-bold text-[#8C4A3C] dark:text-[#F3D6CB] block">
                            Motivo alegado:
                          </span>
                          <p className="text-[#3D3230] dark:text-[#E0D0CC] italic">
                            "{report.reason}"
                          </p>
                        </div>

                        {/* Conteúdo Reportado */}
                        <div className="p-3.5 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29] space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-[#3D3230]/60 dark:text-[#A79895]">
                            <span>Conteúdo do autor: <strong>{report.author_nickname}</strong></span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] font-medium leading-relaxed">
                            {report.target_content}
                          </p>
                        </div>

                        {/* Moderation Action Buttons */}
                        <div className="pt-2 border-t border-[#F3D6CB]/40 dark:border-[#382C29] flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => handleResolveReport(report, 'manter')}
                            className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#3D3230] dark:text-[#F8ECE8] text-xs font-semibold transition cursor-pointer"
                          >
                            Manter Conteúdo (Resolver)
                          </button>

                          <button
                            onClick={() => handleResolveReport(report, 'ocultar')}
                            className="py-2 px-3 rounded-xl bg-[#E8C547]/20 hover:bg-[#E8C547]/30 text-[#8F6B00] dark:text-[#F5DC7A] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar Conteúdo</span>
                          </button>

                          <button
                            onClick={() => handleResolveReport(report, 'advertir')}
                            className="py-2 px-3 rounded-xl bg-[#8C4A3C]/15 hover:bg-[#8C4A3C]/25 text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Advertir Mãe</span>
                          </button>

                          <button
                            onClick={() => setBanConfirmTarget(report)}
                            className="py-2 px-3 rounded-xl bg-[#B03622] hover:bg-[#8f2b1a] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Banir da Comunidade</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* SUB-TAB 2: ALERTAS DE RISCO */}
            {moderationSubTab === 'risco' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-[#B03622]/10 border border-[#B03622]/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#B03622] font-bold text-sm">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Acolhimento Humano e Prevenção de Crise</span>
                  </div>
                  <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE]">
                    Estes textos acionaram as palavras de risco cadastradas (ex: desespero extremo, intenção autolesiva ou ideação).
                    O app já exibiu o modal acolhedor com CVV 188 e SAMU 192 no momento do envio. Aqui você faz o acompanhamento humanizado.
                  </p>
                </div>

                {riskAlerts.length === 0 ? (
                  <p className="text-xs text-[#3D3230]/60 text-center py-8">
                    Nenhum alerta de risco registrado.
                  </p>
                ) : (
                  riskAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-3xl bg-white dark:bg-[#251E1C] border ${
                        alert.status === 'pendente'
                          ? 'border-[#B03622]/40 shadow-xs'
                          : 'border-[#F3D6CB]/60 opacity-80'
                      } space-y-2.5`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-[#B03622] text-white text-[10px] font-bold">
                            Expressão: "{alert.matched_word}"
                          </span>
                          <span className="text-xs font-bold text-[#3D3230] dark:text-[#F8ECE8]">
                            {alert.user_nickname || 'Mãe Anônima'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#3D3230]/50 dark:text-[#A79895]">
                          {new Date(alert.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] italic bg-[#FBF3EF] dark:bg-[#1E1817] p-3 rounded-2xl border border-[#F3D6CB]/40">
                        "{alert.text}"
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`text-xs font-bold ${
                            alert.status === 'pendente' ? 'text-[#B03622]' : 'text-[#6F7F62]'
                          }`}
                        >
                          {alert.status === 'pendente' ? '● Pendente de acolhimento' : '✓ Acompanhado'}
                        </span>

                        {alert.status === 'pendente' && (
                          <button
                            onClick={() => handleMarkAccompanied(alert.id)}
                            className="py-1.5 px-3 rounded-xl bg-[#6F7F62] hover:bg-[#5b6a50] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marcar como Acompanhado</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PERGUNTA DO DIA                                    */}
        {/* ========================================================= */}
        {activeTab === 'perguntas' && (
          <div className="space-y-6">
            {/* Header with suggestions trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#8C4A3C] dark:text-[#F3D6CB]">
                  Pergunta do Dia para as Turmas
                </h3>
                <p className="text-xs text-[#3D3230]/65 dark:text-[#D1C2BE]">
                  Agende perguntas acolhedoras diárias que aparecem no topo de cada turma
                </p>
              </div>

              <button
                onClick={() => setShowSuggestionsDrawer(!showSuggestionsDrawer)}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FBEFEA] to-[#F3D6CB]/60 dark:from-[#322320] dark:to-[#251E1C] border border-[#8C4A3C]/30 text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-bold flex items-center justify-center gap-2 hover:border-[#8C4A3C] transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#8C4A3C]" />
                <span>{showSuggestionsDrawer ? 'Fechar Sugestões' : 'Ver 30 Sugestões Prontas'}</span>
                {showSuggestionsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* 30 Suggestions Box Drawer */}
            {showSuggestionsDrawer && (
              <div className="p-5 rounded-3xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#382C29] space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB]">
                    Banco de 30 Sugestões Acolhedoras (1 toque para usar):
                  </h4>
                  <span className="text-[11px] text-[#3D3230]/60">30 perguntas prontas</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 pr-2">
                  {READY_QUESTION_SUGGESTIONS.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 hover:border-[#8C4A3C] transition flex items-center justify-between gap-2"
                    >
                      <p className="text-xs text-[#3D3230] dark:text-[#F8ECE8] leading-tight">
                        {idx + 1}. {sug}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewQuestionText(sug);
                          showToast('Sugestão copiada para o formulário!');
                        }}
                        className="py-1 px-2.5 rounded-xl bg-[#8C4A3C] text-white text-[10px] font-bold shrink-0 hover:bg-[#73392E] cursor-pointer"
                      >
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create & Schedule Form */}
            <form
              onSubmit={handleSaveScheduledQuestion}
              className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-4"
            >
              <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8] uppercase tracking-wider">
                Nova Pergunta Programada
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                    Data de Exibição
                  </label>
                  <input
                    type="date"
                    required
                    value={newQuestionDate}
                    onChange={(e) => setNewQuestionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                    Turma Alvo
                  </label>
                  <select
                    value={newQuestionTurma}
                    onChange={(e) => setNewQuestionTurma(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40"
                  >
                    <option value="all">Todas as turmas ativas simultaneamente</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC] mb-1">
                  Texto da Pergunta
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: O que ninguém te contou sobre o puerpério e você gostaria de ter sabido antes?"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full p-3.5 bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingQuestion || !newQuestionText.trim()}
                  className="py-2.5 px-5 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSavingQuestion ? 'Salvando...' : 'Agendar Pergunta'}</span>
                </button>
              </div>
            </form>

            {/* List of Scheduled / Active Questions */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB] uppercase tracking-wider">
                Cronograma de Perguntas ({scheduledQuestions.length})
              </h4>

              {scheduledQuestions.length === 0 ? (
                <p className="text-xs text-[#3D3230]/60 text-center py-6">
                  Nenhuma pergunta agendada no momento.
                </p>
              ) : (
                scheduledQuestions.map((q) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isToday = q.date === todayStr;
                  const isFuture = q.date > todayStr;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-3xl bg-white dark:bg-[#251E1C] border ${
                        isToday
                          ? 'border-[#8C4A3C] shadow-xs'
                          : 'border-[#F3D6CB]/60 dark:border-[#382C29]'
                      } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isToday
                                ? 'bg-[#8C4A3C] text-white'
                                : isFuture
                                ? 'bg-[#6F7F62]/15 text-[#6F7F62]'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {isToday ? 'Hoje em Destaque' : isFuture ? 'Agendada' : 'Passada'}
                          </span>
                          <span className="text-xs font-semibold text-[#3D3230]/70 dark:text-[#A79895]">
                            {new Date(q.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'long',
                            })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-[#3D3230] dark:text-[#F8ECE8]">
                          "{q.question}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteScheduledQuestion(q.id)}
                        className="p-2 rounded-xl text-[#B03622] hover:bg-[#B03622]/10 transition cursor-pointer shrink-0"
                        title="Remover pergunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TURMAS                                             */}
        {/* ========================================================= */}
        {activeTab === 'turmas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#8C4A3C] dark:text-[#F3D6CB]">
                  Turmas da Maternidade
                </h3>
                <p className="text-xs text-[#3D3230]/65 dark:text-[#D1C2BE]">
                  Monitore o número de mães por mês e junte turmas pequenas para não deixar ninguém sem acolhimento
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {turmas.map((turma) => (
                <div
                  key={turma.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-[#3D3230] dark:text-[#F8ECE8]">
                        {turma.label}
                      </h4>
                      {turma.is_merged && (
                        <span className="px-2 py-0.5 rounded-full bg-[#6F7F62]/15 text-[#6F7F62] text-[10px] font-bold">
                          Unida com {turma.merged_with_label}
                        </span>
                      )}
                      {(turma.mothers_count || 0) < 20 && !turma.is_merged && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E8C547]/20 text-[#8F6B00] text-[10px] font-bold">
                          Turma pequena
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#3D3230]/70 dark:text-[#D1C2BE]">
                      <span><strong>{turma.mothers_count}</strong> mães acolhidas</span>
                      <span>•</span>
                      <span><strong>{turma.posts_this_week || 12}</strong> posts esta semana</span>
                    </div>
                  </div>

                  {/* Merge Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {turma.is_merged ? (
                      <button
                        onClick={() => handleToggleMergeTurma(turma.id)}
                        className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-[#3D3230] dark:text-[#F8ECE8] text-xs font-semibold transition cursor-pointer"
                      >
                        Desfazer Junção
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // Find adjacent turma
                          const adjacent = turmas.find((x) => x.id !== turma.id);
                          if (adjacent) {
                            handleToggleMergeTurma(turma.id, adjacent.id);
                          }
                        }}
                        className="py-2 px-3.5 rounded-xl bg-[#6F7F62] hover:bg-[#5b6a50] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Juntar com Turma Vizinha</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MÃES E GESTÃO DE ACESSO                            */}
        {/* ========================================================= */}
        {activeTab === 'maes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#8C4A3C] dark:text-[#F3D6CB]">
                  Mães e Suporte a Acessos
                </h3>
                <p className="text-xs text-[#3D3230]/65 dark:text-[#D1C2BE]">
                  Buscar por apelido anônimo ou e-mail para estender ou liberar acesso manualmente
                </p>
              </div>

              {/* Privacy badge */}
              <div className="px-3 py-1.5 rounded-2xl bg-[#6F7F62]/10 border border-[#6F7F62]/30 text-[#6F7F62] text-xs font-bold flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Registros pessoais preservados e estritamente privados</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#3D3230]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por apelido anônimo ou e-mail da mãe..."
                value={searchMother}
                onChange={(e) => setSearchMother(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 shadow-xs"
              />
            </div>

            {/* Mothers List */}
            <div className="space-y-3">
              {mothers.length === 0 ? (
                <p className="text-xs text-[#3D3230]/60 text-center py-8">
                  Nenhuma mãe encontrada com o termo pesquisado.
                </p>
              ) : (
                mothers.map((mother) => {
                  const avatar = getAvatarStyle(mother.nickname || 'Mãe');
                  const now = new Date();
                  const accessUntilDate = mother.access_until ? new Date(mother.access_until) : null;
                  const isAccessActive = accessUntilDate ? accessUntilDate > now : false;
                  const daysLeft = accessUntilDate
                    ? Math.max(0, Math.ceil((accessUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                    : 0;

                  return (
                    <div
                      key={mother.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                          style={{ backgroundColor: avatar.bg, color: avatar.text }}
                        >
                          {avatar.initial}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-sm sm:text-base text-[#3D3230] dark:text-[#F8ECE8]">
                              {mother.nickname || 'Mãe Sem Apelido'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] text-[10px] font-bold capitalize">
                              {mother.phase === 'gestante' ? 'Gestante' : 'Mãe'}
                            </span>
                            {mother.banned_community && (
                              <span className="px-2 py-0.5 rounded-md bg-[#B03622] text-white text-[10px] font-bold">
                                Banida
                              </span>
                            )}
                            {(mother.warnings_count || 0) > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-[#E8C547]/30 text-[#8F6B00] text-[10px] font-bold">
                                {mother.warnings_count} aviso(s)
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#3D3230]/60 dark:text-[#A79895] font-mono mt-0.5">
                            {mother.email || 'email-demonstracao@exemplo.com'}
                          </p>

                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span
                              className={`font-semibold flex items-center gap-1 ${
                                isAccessActive ? 'text-[#6F7F62]' : 'text-[#B03622]'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isAccessActive ? 'bg-[#6F7F62]' : 'bg-[#B03622]'
                                }`}
                              />
                              {isAccessActive
                                ? `Acesso ativo (${daysLeft} dias restantes)`
                                : 'Acesso expirado'}
                            </span>
                            {accessUntilDate && (
                              <span className="text-[11px] text-[#3D3230]/40">
                                • até {accessUntilDate.toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for Support & Community */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                        <button
                          onClick={() => setSelectedMotherForAccess(mother)}
                          className="py-2 px-3 rounded-xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Liberar / Estender Acesso</span>
                        </button>

                        <button
                          onClick={() => handleWarnMother(mother)}
                          className="py-2 px-3 rounded-xl bg-[#FBEFEA] hover:bg-[#F3D6CB]/60 text-[#8C4A3C] dark:bg-[#342421] dark:text-[#F3D6CB] text-xs font-semibold transition cursor-pointer"
                        >
                          Advertir
                        </button>

                        {mother.banned_community ? (
                          <button
                            onClick={() => handleToggleMotherBan(mother, false)}
                            className="py-2 px-3 rounded-xl bg-[#6F7F62]/15 text-[#6F7F62] text-xs font-bold hover:bg-[#6F7F62]/25 transition cursor-pointer"
                          >
                            Reativar Comunidade
                          </button>
                        ) : (
                          <button
                            onClick={() => setMotherBanConfirm(mother)}
                            className="py-2 px-3 rounded-xl bg-[#B03622]/10 hover:bg-[#B03622]/20 text-[#B03622] text-xs font-bold transition cursor-pointer"
                          >
                            Banir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: EXTEND ACCESS DIALOG */}
      {selectedMotherForAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
                Estender Acesso de Suporte
              </h3>
              <button
                onClick={() => setSelectedMotherForAccess(null)}
                className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#3D3230]/70 dark:text-[#D1C2BE]">
              Usuária: <strong>{selectedMotherForAccess.nickname || selectedMotherForAccess.email}</strong>
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleExtendAccessDays(selectedMotherForAccess, 30)}
                className="py-2.5 px-2 rounded-xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] text-[#8C4A3C] text-xs font-bold hover:bg-[#FBEFEA] transition cursor-pointer"
              >
                +30 Dias
              </button>
              <button
                onClick={() => handleExtendAccessDays(selectedMotherForAccess, 60)}
                className="py-2.5 px-2 rounded-xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] text-[#8C4A3C] text-xs font-bold hover:bg-[#FBEFEA] transition cursor-pointer"
              >
                +60 Dias
              </button>
              <button
                onClick={() => handleExtendAccessDays(selectedMotherForAccess, 365)}
                className="py-2.5 px-2 rounded-xl bg-[#8C4A3C] text-white text-xs font-bold hover:bg-[#73392E] transition cursor-pointer shadow-xs"
              >
                +1 Ano
              </button>
            </div>

            <div className="pt-2 border-t border-[#F3D6CB]/40 space-y-2">
              <label className="block text-xs font-semibold text-[#3D3230] dark:text-[#E0D0CC]">
                Ou escolher data específica:
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customAccessDate}
                  onChange={(e) => setCustomAccessDate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#1E1817] border border-[#F3D6CB] rounded-xl text-xs text-[#3D3230] dark:text-[#F8ECE8]"
                />
                <button
                  disabled={!customAccessDate}
                  onClick={() => handleCustomDateExtend(selectedMotherForAccess)}
                  className="py-2 px-3 rounded-xl bg-[#8C4A3C] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM BAN FROM REPORT */}
      {banConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#B03622]/40 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B03622]/15 text-[#B03622] flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#B03622]">
                Confirmar Banimento da Comunidade?
              </h3>
              <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE]">
                A usuária <strong>{banConfirmTarget.author_nickname}</strong> não poderá mais postar, responder ou enviar mensagens privadas na comunidade.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#6F7F62]/10 border border-[#6F7F62]/30 text-xs text-[#6F7F62] flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Privacidade garantida:</strong> os registros pessoais dela (diário, mamadas, contrações e cartas) permanecem intactos e acessíveis exclusivamente por ela.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBanConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] text-xs font-bold text-[#3D3230] hover:bg-[#FBEFEA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleResolveReport(banConfirmTarget, 'banir')}
                className="flex-1 py-2.5 rounded-2xl bg-[#B03622] hover:bg-[#8f2b1a] text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Sim, Banir da Turma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT CONFIRM BAN FROM MOTHERS LIST */}
      {motherBanConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-6 shadow-2xl border border-[#B03622]/40 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B03622]/15 text-[#B03622] flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#B03622]">
                Suspender da Comunidade?
              </h3>
              <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE]">
                Usuária: <strong>{motherBanConfirm.nickname || motherBanConfirm.email}</strong>.
                Esta ação impede novas postagens e mensagens privadas.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#6F7F62]/10 border border-[#6F7F62]/30 text-xs text-[#6F7F62] flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Seus registros pessoais continuam preservados e disponíveis para sua jornada individual.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMotherBanConfirm(null)}
                className="flex-1 py-2.5 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] text-xs font-bold text-[#3D3230] hover:bg-[#FBEFEA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleToggleMotherBan(motherBanConfirm, true)}
                className="flex-1 py-2.5 rounded-2xl bg-[#B03622] hover:bg-[#8f2b1a] text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Confirmar Suspensão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
