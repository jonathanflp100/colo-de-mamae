import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Moon,
  MessageCircle,
  Plus,
  Send,
  MoreVertical,
  Flag,
  ShieldOff,
  Bell,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Heart,
  Loader2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Post, PostTopic, NightMessage, AppNotification } from '../data/types';
import { dataService } from '../data/dataService';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { getAvatarStyle } from '../lib/avatarColor';
import { checkSafety } from '../lib/safety';

// Modals
import { PostDetailModal } from '../components/PostDetailModal';
import { NewPostModal } from '../components/NewPostModal';
import { UserProfileModal } from '../components/UserProfileModal';
import { CommunityRulesModal } from '../components/CommunityRulesModal';
import { ReportModal } from '../components/ReportModal';
import { DirectMessagesModal } from '../components/DirectMessagesModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { CrisisSupportModal } from '../components/CrisisSupportModal';

export const TurmaPage: React.FC = () => {
  const { user, profile, turma } = useAuth();
  const { t, locale } = useI18n();

  // Top Tabs: 'feed' (Minha Turma) vs 'night' (Madrugada 🌙)
  const [activeMainTab, setActiveMainTab] = useState<'feed' | 'night'>('feed');

  // Filter chips for Feed
  const [selectedTopic, setSelectedTopic] = useState<PostTopic | 'tudo'>('tudo');

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [questionOfDay, setQuestionOfDay] = useState<Post | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());

  // Night room state
  const [nightMessages, setNightMessages] = useState<NightMessage[]>([]);
  const [nightInput, setNightInput] = useState('');
  const [sendingNight, setSendingNight] = useState(false);
  const [nightError, setNightError] = useState('');
  const [nightOnlineCount, setNightOnlineCount] = useState<number>(38);

  // Modals state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);

  // Report Modal state
  const [reportData, setReportData] = useState<{
    isOpen: boolean;
    targetType: any;
    targetId: string;
    nickname?: string;
  }>({
    isOpen: false,
    targetType: 'post',
    targetId: '',
  });

  // User profile modal state
  const [userProfileData, setUserProfileData] = useState<{
    isOpen: boolean;
    userId: string;
    nickname: string;
    createdAt?: string;
  }>({
    isOpen: false,
    userId: '',
    nickname: '',
  });

  // Initial target for direct message
  const [dmTargetUser, setDmTargetUser] = useState<{ id: string; nickname: string } | null>(null);

  // In-app notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const currentUserId = user?.id || 'demo-user';
  const currentUserNickname = profile?.nickname || 'Mamãe Anônima';

  // Check if current hour is between 22h and 6h (Night Room hours)
  const isNightRoomOpen = useMemo(() => {
    const currentHour = new Date().getHours();
    return currentHour >= 22 || currentHour < 6;
  }, []);

  // Soft random fluctuation of night room mothers count
  useEffect(() => {
    const interval = setInterval(() => {
      setNightOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
        return Math.max(22, Math.min(64, prev + delta));
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Fetch posts
  const fetchPosts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoadingPosts(true);
        setPage(1);
      }
      const currentPage = reset ? 1 : page;
      const topicFilter = selectedTopic === 'tudo' ? undefined : selectedTopic;
      const turmaId = turma?.id || 'turma-demo';

      const result = await dataService.getPosts(turmaId, currentUserId, topicFilter, currentPage, 20);

      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }
      setHasMore(result.hasMore);

      // Also get Question of Day
      if (reset) {
        const qod = await dataService.getQuestionOfDay(turmaId);
        setQuestionOfDay(qod);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [selectedTopic, turma?.id]);

  // Fetch night messages
  const fetchNightMessages = async () => {
    try {
      const msgs = await dataService.getNightMessages(locale, currentUserId);
      setNightMessages(msgs);
    } catch (err) {
      console.error('Failed to fetch night messages:', err);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'night' && isNightRoomOpen) {
      fetchNightMessages();
    }
  }, [activeMainTab, isNightRoomOpen, locale]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const notifs = await dataService.getNotifications(currentUserId);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUserId]);

  // Load more posts
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchPosts(false);
  };

  // Create new post
  const handleCreatePost = async (newPostData: { body: string; topic: PostTopic }) => {
    const created = await dataService.createPost({
      turma_id: turma?.id || 'turma-demo',
      author_id: currentUserId,
      author_nickname: currentUserNickname,
      body: newPostData.body,
      topic: newPostData.topic,
    });
    setPosts((prev) => [created, ...prev]);
  };

  // Send night message
  const handleSendNightMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nightInput.trim()) return;

    const safety = checkSafety(nightInput);
    if (safety.blocked) {
      setNightError(safety.blockReason || 'Mensagem não permitida.');
      return;
    }

    if (safety.hasRiskWords) {
      setIsCrisisOpen(true);
    }

    setSendingNight(true);
    setNightError('');

    try {
      const created = await dataService.createNightMessage({
        room: locale,
        author_id: currentUserId,
        author_nickname: currentUserNickname,
        body: nightInput.trim(),
      });
      setNightMessages((prev) => [...prev, created]);
      setNightInput('');
    } catch (err: any) {
      setNightError(err?.message || 'Erro ao enviar mensagem.');
    } finally {
      setSendingNight(false);
    }
  };

  // Block user handler
  const handleBlockUser = async (targetUserId: string) => {
    await dataService.blockUser(currentUserId, targetUserId);
    setPosts((prev) => prev.filter((p) => p.author_id !== targetUserId));
    setNightMessages((prev) => prev.filter((m) => m.author_id !== targetUserId));
  };

  // Unread notification count
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex-1 flex flex-col relative pb-24 animate-in fade-in duration-200">
      {/* 1. Header with Turma info, Notifications, and DMs */}
      <div className="p-4 bg-white dark:bg-[#251E1C] border-b border-[#F3D6CB]/70 dark:border-[#382C29] flex items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6F7F62]" />
            <h2 className="font-serif font-bold text-lg text-[#8C4A3C] dark:text-[#F3D6CB] leading-tight">
              {turma?.label || 'Sua Turma'}
            </h2>
          </div>
          <p className="text-xs text-[#3D3230]/70 dark:text-[#D1C2BE]">
            {turma?.mothers_count || 128} mães acolhidas no mesmo mês
          </p>
        </div>

        {/* Action icons: DMs & Notifications */}
        <div className="flex items-center gap-2">
          {/* Direct Messages Icon */}
          <button
            type="button"
            onClick={() => {
              setDmTargetUser(null);
              setIsDmOpen(true);
            }}
            aria-label="Mensagens privadas"
            className="w-10 h-10 rounded-2xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center hover:bg-[#F3D6CB]/60 transition active:scale-95 cursor-pointer shadow-xs relative"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Notifications Icon with unread badge */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="Notificações"
            className="w-10 h-10 rounded-2xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB] flex items-center justify-center hover:bg-[#F3D6CB]/60 transition active:scale-95 cursor-pointer shadow-xs relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B03622] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Top 2 Tabs Switcher: "Minha Turma" vs "Madrugada 🌙" */}
      <div className="grid grid-cols-2 p-2 bg-[#FBF3EF] dark:bg-[#1A1514] border-b border-[#F3D6CB]/50 dark:border-[#382C29]">
        <button
          type="button"
          onClick={() => setActiveMainTab('feed')}
          className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeMainTab === 'feed'
              ? 'bg-[#8C4A3C] text-white shadow-xs'
              : 'text-[#3D3230]/75 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Feed da Turma</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('night')}
          className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeMainTab === 'night'
              ? 'bg-[#2E2038] text-[#EADBFA] shadow-xs'
              : 'text-[#3D3230]/75 dark:text-[#D1C2BE] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Moon className="w-4 h-4 text-[#D8B4FE]" />
          <span>Madrugada 🌙</span>
        </button>
      </div>

      {/* TAB 1: FEED DA TURMA */}
      {activeMainTab === 'feed' && (
        <div className="p-4 space-y-4 flex-1">
          {/* Question of the Day Highlight Banner */}
          {questionOfDay && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FBEFEA] to-[#F3D6CB]/50 dark:from-[#2B1F1C] dark:to-[#382824] border border-[#F3D6CB] dark:border-[#422C28] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#8C4A3C] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Pergunta do Dia
                </span>
                <span className="text-[11px] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold">
                  {questionOfDay.comment_count} respostas
                </span>
              </div>

              <p className="font-serif font-bold text-sm sm:text-base text-[#3D3230] dark:text-[#F8ECE8] leading-snug mb-3">
                "{questionOfDay.body}"
              </p>

              <button
                type="button"
                onClick={() => setSelectedPost(questionOfDay)}
                className="w-full py-2.5 px-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#422C28] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold text-xs shadow-xs hover:bg-[#FBEFEA] transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Responder na pergunta do dia</span>
              </button>
            </div>
          )}

          {/* Topic Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'tudo', label: 'Tudo' },
              { id: 'duvida', label: 'Dúvidas' },
              { id: 'desabafo', label: 'Desabafos' },
              { id: 'conquista', label: 'Conquistas' },
              { id: 'dica', label: 'Dicas' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedTopic(chip.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedTopic === chip.id
                    ? 'bg-[#8C4A3C] text-white shadow-xs'
                    : 'bg-white dark:bg-[#251E1C] text-[#3D3230]/75 dark:text-[#D1C2BE] border border-[#F3D6CB]/60 dark:border-[#382C29] hover:bg-[#FBEFEA]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Community Rules Link */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[11px] text-[#3D3230]/60 dark:text-[#A79895]">
              Espaço anônimo & protegido
            </span>
            <button
              type="button"
              onClick={() => setIsRulesOpen(true)}
              className="text-[11px] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#6F7F62]" />
              <span>Regras da comunidade</span>
            </button>
          </div>

          {/* Posts List */}
          {loadingPosts ? (
            <div className="text-center py-16 text-[#8C4A3C]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-xs">Carregando conversas da sua turma...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#251E1C] text-center text-[#3D3230]/65 dark:text-[#A79895] space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-[#F3D6CB]" />
              <p className="font-semibold text-sm">Nenhuma postagem neste assunto ainda.</p>
              <p className="text-xs">Seja a primeira mamãe a compartilhar com sua turma!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const avatar = getAvatarStyle(post.author_nickname);
                const isExpanded = expandedPostIds.has(post.id);

                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2.5 transition"
                  >
                    {/* Post Top Row */}
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() =>
                          setUserProfileData({
                            isOpen: true,
                            userId: post.author_id,
                            nickname: post.author_nickname,
                            createdAt: post.created_at,
                          })
                        }
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-85"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                          style={{ backgroundColor: avatar.bg, color: avatar.text }}
                        >
                          {avatar.initial}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8]">
                            {post.author_nickname}
                          </h4>
                          <span className="text-[10px] text-[#3D3230]/50 dark:text-[#A79895]">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Topic Badge & Options Menu */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold capitalize px-2 py-0.5 rounded-lg bg-[#FBEFEA] dark:bg-[#322320] text-[#8C4A3C] dark:text-[#F3D6CB]">
                          {post.topic}
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                            className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/60 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === post.id && (
                            <div className="absolute right-0 top-8 w-44 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] p-1.5 shadow-xl z-20 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setReportData({
                                    isOpen: true,
                                    targetType: 'post',
                                    targetId: post.id,
                                    nickname: post.author_nickname,
                                  });
                                }}
                                className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-[#FBEFEA] text-[#B03622] cursor-pointer"
                              >
                                <Flag className="w-3.5 h-3.5" />
                                <span>Denunciar post</span>
                              </button>
                              {post.author_id !== currentUserId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleBlockUser(post.author_id);
                                  }}
                                  className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/10 text-[#3D3230] dark:text-[#E0D0CC] cursor-pointer"
                                >
                                  <ShieldOff className="w-3.5 h-3.5" />
                                  <span>Bloquear esta mãe</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post Content with "Ver mais" if needed */}
                    <p
                      className={`text-xs sm:text-sm text-[#3D3230]/90 dark:text-[#E0D0CC] leading-relaxed whitespace-pre-wrap ${
                        !isExpanded ? 'line-clamp-5' : ''
                      }`}
                    >
                      {post.body}
                    </p>

                    {post.body.length > 250 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = new Set(expandedPostIds);
                          if (isExpanded) updated.delete(post.id);
                          else updated.add(post.id);
                          setExpandedPostIds(updated);
                        }}
                        className="text-[11px] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold underline underline-offset-2 cursor-pointer"
                      >
                        {isExpanded ? 'Ver menos' : 'Ver mais'}
                      </button>
                    )}

                    {/* Post Bottom Row: Reply Button */}
                    <div className="pt-2 border-t border-[#F3D6CB]/40 dark:border-[#382C29] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedPost(post)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#8C4A3C] dark:text-[#F3D6CB] hover:underline cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          {post.comment_count > 0
                            ? `${post.comment_count} respostas`
                            : 'Acolher com uma resposta'}
                        </span>
                      </button>

                      <span className="text-[10px] text-[#6F7F62] dark:text-[#A7B69B] font-medium">
                        Toque para conversar
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="py-2.5 px-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-semibold shadow-xs hover:bg-[#FBEFEA] cursor-pointer"
                  >
                    Carregar mais conversas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Floating Action Button: "+ Perguntar" */}
          <button
            type="button"
            onClick={() => setIsNewPostOpen(true)}
            className="fixed bottom-22 right-5 z-40 px-4 py-3 rounded-full bg-[#8C4A3C] hover:bg-[#73392E] text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition active:scale-95 cursor-pointer border border-white/20"
          >
            <Plus className="w-5 h-5" />
            <span>Perguntar</span>
          </button>
        </div>
      )}

      {/* TAB 2: SALA DA MADRUGADA 🌙 (Open 22h to 06h) */}
      {activeMainTab === 'night' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {!isNightRoomOpen ? (
            // CLOSED OUTSIDE 22h - 06h
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#1C1624] to-[#120E18] text-[#EADBFA]">
              <div className="w-20 h-20 rounded-full bg-[#2E2038] text-[#D8B4FE] flex items-center justify-center mb-4 shadow-xl border border-[#D8B4FE]/20">
                <Moon className="w-10 h-10 fill-[#D8B4FE]/30 animate-pulse" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#EADBFA] mb-2">
                Sala da Madrugada 🌙
              </h3>
              <p className="text-sm text-[#D8B4FE]/80 max-w-xs leading-relaxed mb-6">
                A Sala da Madrugada abre às <strong>22h</strong> e vai até as <strong>06h</strong> da manhã, horário das mamadas silenciosas. Até lá, sua turma está pertinho no Feed!
              </p>
              <button
                type="button"
                onClick={() => setActiveMainTab('feed')}
                className="py-3 px-6 rounded-2xl bg-[#8C4A3C] text-white font-semibold text-xs shadow-md cursor-pointer hover:bg-[#73392E] transition active:scale-95"
              >
                Voltar para o Feed da Turma
              </button>
            </div>
          ) : (
            // OPEN 22h - 06h: Midnight Blue & Soft Lilac Theme
            <div className="flex-1 flex flex-col bg-[#140F1D] text-[#EADBFA] overflow-hidden">
              {/* Night Room Header */}
              <div className="p-3 bg-[#1C1528] border-b border-[#2E2038] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-ping" />
                  <span className="font-serif font-bold text-sm text-[#EADBFA]">
                    🌙 {nightOnlineCount} mães acordadas agora
                  </span>
                </div>
                <span className="text-[10px] text-[#C084FC] font-semibold bg-[#2E2038] px-2.5 py-1 rounded-full">
                  Sala {locale.toUpperCase()}
                </span>
              </div>

              {/* Pinned Auto Message */}
              <div className="px-4 py-2.5 bg-[#251936] border-b border-[#3B2854] text-center text-xs font-serif italic text-[#F3E8FF]">
                "Madrugada difícil? Estamos acordadas com você. 💛"
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {nightMessages.map((msg) => {
                  const isMe = msg.author_id === currentUserId;
                  const av = getAvatarStyle(msg.author_nickname);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#A855F7]">
                        <span>{msg.author_nickname}</span>
                        <span>•</span>
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl leading-relaxed max-w-[85%] shadow-sm ${
                          isMe
                            ? 'bg-[#7E22CE] text-white rounded-br-xs'
                            : 'bg-[#221A30] text-[#F3E8FF] border border-[#3B2854] rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Night Room Error */}
              {nightError && (
                <div className="p-2 bg-[#B03622]/20 border-t border-[#B03622]/40 text-[#FCA5A5] text-[11px] text-center">
                  {nightError}
                </div>
              )}

              {/* Night Input Bar */}
              <form
                onSubmit={handleSendNightMessage}
                className="p-3 bg-[#1C1528] border-t border-[#2E2038] flex items-center gap-2"
              >
                <input
                  type="text"
                  maxLength={300}
                  value={nightInput}
                  onChange={(e) => {
                    setNightInput(e.target.value);
                    setNightError('');
                  }}
                  placeholder="Escreva para as mães da madrugada..."
                  className="flex-1 px-4 py-2.5 bg-[#140F1D] border border-[#3B2854] rounded-2xl text-xs text-[#F3E8FF] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/40 min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={sendingNight || !nightInput.trim()}
                  className="w-11 h-11 rounded-2xl bg-[#7E22CE] hover:bg-[#6B21A8] text-white flex items-center justify-center shadow-xs transition active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
                >
                  {sendingNight ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        currentUserId={currentUserId}
        currentUserNickname={currentUserNickname}
        onOpenUserProfile={(uId, nick) =>
          setUserProfileData({
            isOpen: true,
            userId: uId,
            nickname: nick,
          })
        }
        onReport={(targetType, targetId, nick) =>
          setReportData({ isOpen: true, targetType, targetId, nickname: nick })
        }
        onBlock={handleBlockUser}
        onTriggerCrisisModal={() => setIsCrisisOpen(true)}
      />

      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onSubmit={handleCreatePost}
        onTriggerCrisisModal={() => setIsCrisisOpen(true)}
      />

      <CommunityRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <UserProfileModal
        isOpen={userProfileData.isOpen}
        onClose={() => setUserProfileData({ ...userProfileData, isOpen: false })}
        userId={userProfileData.userId}
        nickname={userProfileData.nickname}
        isSameTurma={true}
        turmaLabel={turma?.label || 'Turma Ativa'}
        createdAt={userProfileData.createdAt}
        currentUserCreatedAt={user?.created_at}
        onStartDm={(uId, nick) => {
          setDmTargetUser({ id: uId, nickname: nick });
          setIsDmOpen(true);
        }}
        onBlockUser={handleBlockUser}
      />

      <ReportModal
        isOpen={reportData.isOpen}
        onClose={() => setReportData({ ...reportData, isOpen: false })}
        targetType={reportData.targetType}
        targetId={reportData.targetId}
        reporterId={currentUserId}
        targetAuthorNickname={reportData.nickname}
      />

      <DirectMessagesModal
        isOpen={isDmOpen}
        onClose={() => {
          setIsDmOpen(false);
          setDmTargetUser(null);
        }}
        currentUserId={currentUserId}
        initialTargetUser={dmTargetUser}
        onReport={(targetType, targetId, nick) =>
          setReportData({ isOpen: true, targetType, targetId, nickname: nick })
        }
        onBlock={handleBlockUser}
        onTriggerCrisisModal={() => setIsCrisisOpen(true)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={async () => {
          await dataService.markAllNotificationsAsRead(currentUserId);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onSelectNotification={(notif) => {
          dataService.markNotificationAsRead(notif.id);
          setIsNotificationsOpen(false);
          if (notif.title.includes('mensagem')) {
            setIsDmOpen(true);
          } else if (questionOfDay) {
            setSelectedPost(questionOfDay);
          }
        }}
      />

      <CrisisSupportModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        onProceed={() => setIsCrisisOpen(false)}
      />
    </div>
  );
};
