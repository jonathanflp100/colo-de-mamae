import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  MoreVertical,
  Flag,
  ShieldOff,
  Clock,
  Sparkles,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Post, Comment } from '../data/types';
import { dataService } from '../data/dataService';
import { getAvatarStyle } from '../lib/avatarColor';
import { checkSafety } from '../lib/safety';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserNickname: string;
  onOpenUserProfile: (userId: string, nickname: string) => void;
  onReport: (targetType: any, targetId: string, nickname?: string) => void;
  onBlock: (targetUserId: string) => void;
  onTriggerCrisisModal?: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  currentUserId,
  currentUserNickname,
  onOpenUserProfile,
  onReport,
  onBlock,
  onTriggerCrisisModal,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const loadComments = async () => {
    if (!post) return;
    try {
      setLoading(true);
      const list = await dataService.getComments(post.id, currentUserId);
      setComments(list);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && post) {
      loadComments();
    } else {
      setComments([]);
      setCommentText('');
      setErrorMsg('');
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const authorAvatar = getAvatarStyle(post.author_nickname);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Safety check
    const safety = checkSafety(commentText);
    if (safety.blocked) {
      setErrorMsg(safety.blockReason || 'Mensagem não permitida.');
      return;
    }

    if (safety.hasRiskWords) {
      dataService.recordRiskAlert({
        text: commentText.trim(),
        matched_word: safety.matchedRiskWord || 'palavra de risco',
        user_id: currentUserId,
        user_nickname: currentUserNickname,
      });
      onTriggerCrisisModal?.();
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const newComment = await dataService.createComment({
        post_id: post.id,
        author_id: currentUserId,
        author_nickname: currentUserNickname,
        body: commentText.trim(),
      });

      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao enviar comentário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHelpful = async (commentId: string) => {
    try {
      const result = await dataService.toggleHelpfulVote(commentId, currentUserId);
      setComments((prev) =>
        prev
          .map((c) =>
            c.id === commentId
              ? { ...c, helpful_count: result.helpful_count, user_voted_helpful: result.user_voted }
              : c
          )
          .sort((a, b) => b.helpful_count - a.helpful_count)
      );
    } catch (err) {
      console.error('Error voting helpful:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full h-full sm:h-[90vh] sm:max-w-lg bg-[#FBF3EF] dark:bg-[#1E1817] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#F3D6CB] dark:border-[#382C29]">
        {/* Header */}
        <div className="p-4 bg-white dark:bg-[#251E1C] border-b border-[#F3D6CB]/70 dark:border-[#382C29] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#8C4A3C] dark:text-[#F3D6CB] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
              Post da Comunidade
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Area: Original Post + Comments */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Original Post Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div
                onClick={() => onOpenUserProfile(post.author_id, post.author_nickname)}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-85"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: authorAvatar.bg, color: authorAvatar.text }}
                >
                  {authorAvatar.initial}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8]">
                    {post.author_nickname}
                  </h4>
                  <span className="text-[10px] text-[#3D3230]/60 dark:text-[#A79895] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* Menu */}
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
                        onReport('post', post.id, post.author_nickname);
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
                          onBlock(post.author_id);
                          onClose();
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

            {/* Post Body */}
            <p className="text-xs sm:text-sm text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed mb-3 whitespace-pre-wrap">
              {post.body}
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#3D3230]/65 dark:text-[#A79895] pt-2 border-t border-[#F3D6CB]/30 dark:border-[#382C29]">
              <span className="capitalize font-medium px-2 py-0.5 rounded-lg bg-[#FBEFEA] dark:bg-[#322320] text-[#8C4A3C] dark:text-[#F3D6CB]">
                {post.topic}
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#8C4A3C] dark:text-[#F3D6CB]">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{comments.length} respostas</span>
              </span>
            </div>
          </div>

          {/* Section Divider */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-serif font-bold text-[#8C4A3C] dark:text-[#F3D6CB] uppercase tracking-wider text-[11px]">
              Respostas das Mães ({comments.length})
            </span>
            <span className="text-[10px] text-[#6F7F62] dark:text-[#A7B69B] font-medium">
              Mais úteis no topo
            </span>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="text-center py-6 text-[#8C4A3C]">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
              <p>Carregando respostas...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#251E1C] text-center text-[#3D3230]/60 dark:text-[#A79895]">
              <Sparkles className="w-6 h-6 text-[#F3D6CB] mx-auto mb-1.5" />
              <p>Nenhuma resposta ainda. Seja a primeira a acolher esta mãe!</p>
            </div>
          ) : (
            comments.map((comm) => {
              const commAvatar = getAvatarStyle(comm.author_nickname);
              return (
                <div
                  key={comm.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => onOpenUserProfile(comm.author_id, comm.author_nickname)}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-85"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                        style={{ backgroundColor: commAvatar.bg, color: commAvatar.text }}
                      >
                        {commAvatar.initial}
                      </div>
                      <span className="font-serif font-bold text-xs text-[#3D3230] dark:text-[#F8ECE8]">
                        {comm.author_nickname}
                      </span>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === comm.id ? null : comm.id)}
                        className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-[#3D3230]/50 cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuId === comm.id && (
                        <div className="absolute right-0 top-7 w-40 rounded-xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] p-1.5 shadow-xl z-20 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onReport('comment', comm.id, comm.author_nickname);
                            }}
                            className="w-full flex items-center gap-1.5 p-1.5 rounded-lg text-left hover:bg-[#FBEFEA] text-[#B03622] cursor-pointer"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Denunciar resposta</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#3D3230]/90 dark:text-[#E0D0CC] leading-relaxed whitespace-pre-wrap pl-9">
                    {comm.body}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#F3D6CB]/30 pl-9">
                    <span className="text-[10px] text-[#3D3230]/50 dark:text-[#A79895]">
                      {new Date(comm.created_at).toLocaleDateString()}
                    </span>

                    {/* "Isso me ajudou" Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleHelpful(comm.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 ${
                        comm.user_voted_helpful
                          ? 'bg-[#8C4A3C] text-white shadow-xs'
                          : 'bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] dark:text-[#F3D6CB] hover:bg-[#F3D6CB]/50'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          comm.user_voted_helpful ? 'fill-white text-white' : 'text-[#8C4A3C]'
                        }`}
                      />
                      <span>Isso me ajudou ({comm.helpful_count})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Reply Form */}
        <div className="p-3 bg-white dark:bg-[#251E1C] border-t border-[#F3D6CB]/70 dark:border-[#382C29]">
          {errorMsg && (
            <div className="p-2 mb-2 rounded-xl bg-[#B03622]/10 border border-[#B03622]/30 text-[#B03622] text-[11px]">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              maxLength={600}
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Acolha com palavras amigas..."
              className="flex-1 px-4 py-2.5 bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#3E2B27] rounded-2xl text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none focus:ring-2 focus:ring-[#8C4A3C]/40 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="w-11 h-11 rounded-2xl bg-[#8C4A3C] hover:bg-[#73392E] text-white flex items-center justify-center shadow-xs transition active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
