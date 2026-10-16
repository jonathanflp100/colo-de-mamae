import React, { useState, useEffect } from 'react';
import { BookHeart, Plus, Calendar, Trash2, BookOpen, X, Sparkles, Feather } from 'lucide-react';
import { dataService } from '../data/dataService';
import { Letter } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { formatFriendlyDate } from '../lib/dateUtils';

export const LettersSection: React.FC = () => {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [readingLetter, setReadingLetter] = useState<Letter | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const loadLetters = async () => {
    if (!user) return;
    const items = await dataService.getLetters(user.id);
    setLetters(items);
  };

  useEffect(() => {
    loadLetters();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !body.trim()) return;

    setSaving(true);
    try {
      await dataService.saveLetter({
        user_id: user.id,
        title: title.trim(),
        body: body.trim(),
        created_at: new Date().toISOString(),
      });

      setTitle('');
      setBody('');
      setIsEditorOpen(false);
      await loadLetters();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Deseja excluir esta carta?')) {
      await dataService.deleteLetter(id);
      setLetters((prev) => prev.filter((l) => l.id !== id));
      if (readingLetter?.id === id) setReadingLetter(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
            Cartas para o Futuro
          </h4>
          <p className="text-[11px] text-[#3D3230]/65 dark:text-[#A79895]">
            Palavras de amor guardadas para o seu filho ler um dia
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setBody('');
            setIsEditorOpen(true);
          }}
          className="px-3 py-2 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition"
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Escrever Carta</span>
        </button>
      </div>

      {/* Letters List */}
      <div className="space-y-3">
        {letters.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] text-center">
            <BookHeart className="w-10 h-10 mx-auto text-[#8C4A3C]/40 mb-2" />
            <h5 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
              Nenhuma carta ainda
            </h5>
            <p className="text-xs text-[#3D3230]/60 dark:text-[#A79895] max-w-xs mx-auto mt-1">
              Escreva hoje o que o seu coração sente: a espera, a alegria do primeiro toque, os sonhos que você tem para ele(a).
            </p>
          </div>
        ) : (
          letters.map((letter) => {
            const dateStr = formatFriendlyDate(letter.created_at.slice(0, 10), locale);
            return (
              <div
                key={letter.id}
                onClick={() => setReadingLetter(letter)}
                className="p-5 rounded-3xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/80 dark:border-[#382C29] shadow-xs hover:border-[#8C4A3C] cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#6F7F62] dark:text-[#A7B69B] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {dateStr}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#8C4A3C] group-hover:underline flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Ler carta
                    </span>
                    <button
                      onClick={(e) => handleDelete(letter.id, e)}
                      className="p-1 text-[#3D3230]/30 hover:text-rose-600 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-serif font-bold text-base text-[#3D3230] dark:text-[#F8ECE8]">
                  {letter.title}
                </h4>

                <p className="text-xs text-[#3D3230]/75 dark:text-[#D1C2BE] line-clamp-3 leading-relaxed font-serif italic">
                  "{letter.body}"
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#251E1C] rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Feather className="w-5 h-5 text-[#8C4A3C]" />
                <h3 className="font-serif font-bold text-xl text-[#3D3230] dark:text-[#F8ECE8]">
                  Escrever para o Meu Bebê
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-full text-[#3D3230]/40 hover:text-[#3D3230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                  Título da Carta *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: No dia em que você começou a chutar..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-sm text-[#3D3230] dark:text-[#F8ECE8] focus:ring-2 focus:ring-[#8C4A3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                  Sua mensagem de amor *
                </label>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escreva com todo o seu coração para o seu filho(a) ler no futuro..."
                  rows={8}
                  className="w-full p-4 rounded-2xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/30 dark:bg-[#1E1817] text-sm font-serif leading-relaxed text-[#3D3230] dark:text-[#F8ECE8] focus:ring-2 focus:ring-[#8C4A3C]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] text-xs font-bold text-[#3D3230]/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md hover:brightness-105"
                >
                  {saving ? 'Guardando...' : 'Guardar Carta com Amor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Reading Mode Modal */}
      {readingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#FAF5F0] dark:bg-[#1E1817] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DCD8] dark:border-[#382C29] max-h-[90vh] flex flex-col relative overflow-hidden">
            {/* Book Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DCD8] dark:border-[#382C29]">
              <div className="flex items-center gap-2 text-[#8C4A3C]">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Modo Livro de Memórias
                </span>
              </div>
              <button
                onClick={() => setReadingLetter(null)}
                className="p-1.5 rounded-full text-[#3D3230]/50 hover:text-[#3D3230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Book Body */}
            <div className="my-6 overflow-y-auto flex-1 space-y-4 pr-1">
              <span className="text-xs text-[#6F7F62] font-semibold block">
                {formatFriendlyDate(readingLetter.created_at.slice(0, 10), locale)}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3D3230] dark:text-[#F8ECE8] leading-tight">
                {readingLetter.title}
              </h3>
              <div className="h-0.5 w-12 bg-[#8C4A3C]/40 rounded-full my-3" />
              <p className="font-serif text-base leading-relaxed text-[#3D3230]/90 dark:text-[#EDE1DC] whitespace-pre-wrap">
                {readingLetter.body}
              </p>
            </div>

            {/* Book Footer */}
            <div className="pt-4 border-t border-[#E8DCD8] dark:border-[#382C29] flex justify-end">
              <button
                onClick={() => setReadingLetter(null)}
                className="px-5 py-2.5 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md hover:brightness-105"
              >
                Fechar Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
