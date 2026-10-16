import React from 'react';
import { Bell, X, Check, MessageCircle, Heart, Sparkles, MessageSquare } from 'lucide-react';
import { AppNotification } from '../data/types';
import { formatFriendlyDate } from '../lib/dateUtils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm max-h-[85vh] rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-5 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3D6CB]/60 dark:border-[#382C29]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] text-[#8C4A3C] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
                Notificações
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] text-[#6F7F62] dark:text-[#A7B69B] font-semibold">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] text-[#8C4A3C] dark:text-[#F3D6CB] font-semibold hover:underline cursor-pointer"
              >
                Marcar lidas
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2 py-3 flex-1 text-xs">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-[#3D3230]/60 dark:text-[#A79895]">
              <Sparkles className="w-8 h-8 mx-auto text-[#F3D6CB] mb-2" />
              <p>Nenhuma notificação recente.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isHelpful = notif.title.includes('ajudou');
              const isAnswer = notif.title.includes('respondeu');
              const isMessage = notif.title.includes('mensagem');

              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotification?.(notif)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                    notif.read
                      ? 'bg-white/70 dark:bg-[#1E1817]/70 border-[#F3D6CB]/40 dark:border-[#382C29] opacity-80'
                      : 'bg-white dark:bg-[#1E1817] border-[#8C4A3C]/40 dark:border-[#F3D6CB]/40 shadow-xs ring-1 ring-[#8C4A3C]/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FBEFEA] dark:bg-[#342421] flex items-center justify-center shrink-0 mt-0.5">
                    {isHelpful ? (
                      <Heart className="w-4 h-4 text-[#8C4A3C] fill-[#F3D6CB]" />
                    ) : isAnswer ? (
                      <MessageCircle className="w-4 h-4 text-[#6F7F62]" />
                    ) : isMessage ? (
                      <MessageSquare className="w-4 h-4 text-[#8C4A3C]" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#8C4A3C]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs text-[#3D3230] dark:text-[#F8ECE8] truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#8C4A3C] shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#3D3230]/75 dark:text-[#D1C2BE] leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
