import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  ShieldAlert,
  Send,
  MoreVertical,
  Flag,
  ShieldOff,
  ArrowLeft,
  Loader2,
  Lock,
} from 'lucide-react';
import { DmMessage, DmThread } from '../data/types';
import { dataService } from '../data/dataService';
import { getAvatarStyle } from '../lib/avatarColor';
import { checkSafety, checkDmRateLimit, recordDmSent } from '../lib/safety';

interface DirectMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  initialThreadId?: string | null;
  initialTargetUser?: { id: string; nickname: string } | null;
  onReport: (targetType: any, targetId: string, nickname?: string) => void;
  onBlock: (targetUserId: string) => void;
  onTriggerCrisisModal?: () => void;
}

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  initialThreadId = null,
  initialTargetUser = null,
  onReport,
  onBlock,
  onTriggerCrisisModal,
}) => {
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [activeThread, setActiveThread] = useState<DmThread | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load threads
  const loadThreads = async () => {
    try {
      setLoadingThreads(true);
      const list = await dataService.getDmThreads(currentUserId);
      setThreads(list);

      // If initial target user is passed, create or select thread
      if (initialTargetUser) {
        const thread = await dataService.getOrCreateDmThread(
          currentUserId,
          initialTargetUser.id,
          initialTargetUser.nickname
        );
        setActiveThread(thread);
      } else if (initialThreadId) {
        const matched = list.find((t) => t.id === initialThreadId);
        if (matched) setActiveThread(matched);
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadThreads();
    } else {
      setActiveThread(null);
      setMessages([]);
      setErrorMsg('');
    }
  }, [isOpen]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeThread) return;

    let isMounted = true;
    const fetchMsgs = async () => {
      try {
        setLoadingMessages(true);
        const msgs = await dataService.getDmMessages(activeThread.id, currentUserId);
        if (isMounted) {
          setMessages(msgs);
          await dataService.markDmThreadAsRead(activeThread.id, currentUserId);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMsgs();

    return () => {
      isMounted = false;
    };
  }, [activeThread]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeThread) return;

    // 1. Safety check
    const safety = checkSafety(messageText);
    if (safety.blocked) {
      setErrorMsg(safety.blockReason || 'Mensagem não permitida.');
      return;
    }

    if (safety.hasRiskWords) {
      dataService.recordRiskAlert({
        text: messageText.trim(),
        matched_word: safety.matchedRiskWord || 'palavra de risco',
        user_id: currentUserId,
      });
      onTriggerCrisisModal?.();
    }

    // 2. Rate limit check (20 DMs/day for <7 days accounts)
    const rate = checkDmRateLimit();
    if (!rate.allowed) {
      setErrorMsg('Limite diário de 20 mensagens privadas atingido para contas recentes.');
      return;
    }

    setSending(true);
    setErrorMsg('');

    try {
      const newMsg = await dataService.sendDmMessage(activeThread.id, currentUserId, messageText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setMessageText('');
      recordDmSent();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full h-full sm:h-[88vh] sm:max-w-md bg-[#FBF3EF] dark:bg-[#1E1817] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#F3D6CB] dark:border-[#382C29]">
        {/* Header */}
        <div className="p-3.5 bg-white dark:bg-[#251E1C] border-b border-[#F3D6CB]/70 dark:border-[#382C29] flex items-center justify-between gap-3">
          {activeThread ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActiveThread(null);
                  loadThreads();
                }}
                className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#8C4A3C] dark:text-[#F3D6CB] cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {(() => {
                const av = getAvatarStyle(activeThread.other_user_nickname || 'M');
                return (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: av.bg, color: av.text }}
                  >
                    {av.initial}
                  </div>
                );
              })()}
              <div className="truncate">
                <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8] truncate leading-tight">
                  {activeThread.other_user_nickname}
                </h4>
                <span className="text-[10px] text-[#6F7F62] dark:text-[#A7B69B] font-medium">
                  Conversa privada e anônima
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
                Mensagens Privadas
              </h3>
            </div>
          )}

          <div className="flex items-center gap-1">
            {activeThread && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-9 w-44 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] p-1.5 shadow-xl z-20 text-xs animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onReport('user', activeThread.other_user_id || '', activeThread.other_user_nickname);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-[#FBEFEA] text-[#B03622] cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Denunciar mãe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        if (activeThread.other_user_id) {
                          onBlock(activeThread.other_user_id);
                          setActiveThread(null);
                          loadThreads();
                        }
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/10 text-[#3D3230] dark:text-[#E0D0CC] cursor-pointer"
                    >
                      <ShieldOff className="w-3.5 h-3.5" />
                      <span>Bloquear mãe</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Warning Banner (Strictly fixed) */}
        <div className="px-4 py-2 bg-[#FBEFEA] dark:bg-[#2B1F1C] border-b border-[#F3D6CB] dark:border-[#422C28] flex items-center gap-2 text-[11px] text-[#8C4A3C] dark:text-[#F3D6CB] font-medium leading-tight">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#8C4A3C]" />
          <span>
            Por segurança, não é possível enviar links, telefones ou Pix. Nunca envie dinheiro para ninguém.
          </span>
        </div>

        {/* Content: Threads list OR Active conversation */}
        {!activeThread ? (
          // THREADS LIST
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {loadingThreads ? (
              <div className="text-center py-12 text-[#8C4A3C]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Carregando conversas...</p>
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-16 text-[#3D3230]/65 dark:text-[#A79895] space-y-2">
                <Lock className="w-8 h-8 mx-auto text-[#F3D6CB]" />
                <p className="font-semibold text-sm">Nenhuma conversa privada aberta</p>
                <p className="text-[11px] max-w-xs mx-auto leading-relaxed">
                  Para conversar com outra mãe da sua turma, toque no apelido dela em qualquer postagem.
                </p>
              </div>
            ) : (
              threads.map((thread) => {
                const av = getAvatarStyle(thread.other_user_nickname || 'M');
                const hasUnread = (thread.unread_count || 0) > 0;

                return (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThread(thread)}
                    className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex items-center justify-between gap-3 hover:border-[#8C4A3C]/40 transition cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ backgroundColor: av.bg, color: av.text }}
                      >
                        {av.initial}
                      </div>
                      <div className="truncate">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] truncate">
                          {thread.other_user_nickname}
                        </h4>
                        <p className="text-[11px] text-[#3D3230]/65 dark:text-[#D1C2BE] truncate mt-0.5">
                          {thread.last_message_preview || 'Nova conversa iniciada'}
                        </p>
                      </div>
                    </div>

                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8C4A3C] shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // CONVERSATION VIEW
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF6F3] dark:bg-[#161211]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {loadingMessages ? (
                <div className="text-center py-10 text-[#8C4A3C]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
                  <p>Carregando mensagens...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-[#3D3230]/60 dark:text-[#A79895]">
                  <p>Início da conversa com {activeThread.other_user_nickname}.</p>
                  <p className="text-[10px] mt-1 text-[#6F7F62]">Espaço de respeito e acolhimento.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-[#8C4A3C] text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#251E1C] text-[#3D3230] dark:text-[#F8ECE8] border border-[#F3D6CB]/60 dark:border-[#382C29] rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.body}</p>
                      </div>
                      <span className="text-[9px] text-[#3D3230]/50 dark:text-[#A79895] mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="px-4 py-2 bg-[#B03622]/10 border-t border-[#B03622]/30 text-[#B03622] text-[11px] leading-tight">
                {errorMsg}
              </div>
            )}

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#251E1C] border-t border-[#F3D6CB]/70 dark:border-[#382C29] flex items-center gap-2">
              <input
                type="text"
                maxLength={500}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Escreva uma mensagem acolhedora..."
                className="flex-1 px-4 py-2.5 bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-xl text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[42px]"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="w-10 h-10 rounded-xl bg-[#8C4A3C] hover:bg-[#73392E] text-white flex items-center justify-center shadow-xs transition active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
