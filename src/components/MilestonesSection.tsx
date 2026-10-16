import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Calendar, Trash2, Heart, Star, CheckCircle, ChevronRight, X } from 'lucide-react';
import { dataService } from '../data/dataService';
import { Milestone, MilestoneKind } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { formatFriendlyDate } from '../lib/dateUtils';

const DEFAULT_SUGGESTIONS = [
  { title: 'Primeiro chute sentido na barriga', kind: 'gestacao' as MilestoneKind },
  { title: 'Primeiro batimento cardíaco no ultrassom', kind: 'gestacao' as MilestoneKind },
  { title: 'Descobri que era você! (Positivo)', kind: 'gestacao' as MilestoneKind },
  { title: 'Primeiro sorriso espontâneo', kind: 'bebe' as MilestoneKind },
  { title: 'Primeira gargalhada gostosa', kind: 'bebe' as MilestoneKind },
  { title: 'Rolou pela primeira vez sozinho', kind: 'bebe' as MilestoneKind },
  { title: 'Primeiro dentinho apontando', kind: 'bebe' as MilestoneKind },
  { title: 'Primeira papinha / introdução alimentar', kind: 'bebe' as MilestoneKind },
];

export const MilestonesSection: React.FC = () => {
  const { user, profile } = useAuth();
  const { locale } = useI18n();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [filter, setFilter] = useState<'todos' | 'gestacao' | 'bebe'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [kind, setKind] = useState<MilestoneKind>(profile?.phase === 'mae' ? 'bebe' : 'gestacao');
  const [saving, setSaving] = useState(false);

  const loadMilestones = async () => {
    if (!user) return;
    const items = await dataService.getMilestones(user.id);
    setMilestones(items);
  };

  useEffect(() => {
    loadMilestones();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !date) return;

    setSaving(true);
    try {
      await dataService.saveMilestone({
        user_id: user.id,
        kind,
        title: title.trim(),
        date,
        note: note.trim() || undefined,
      });

      setTitle('');
      setNote('');
      setIsModalOpen(false);
      await loadMilestones();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este marco do desenvolvimento?')) {
      await dataService.deleteMilestone(id);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filtered = filter === 'todos' ? milestones : milestones.filter((m) => m.kind === filter);

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29]">
          <button
            onClick={() => setFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'todos'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            Todos ({milestones.length})
          </button>
          <button
            onClick={() => setFilter('gestacao')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'gestacao'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            Gestação
          </button>
          <button
            onClick={() => setFilter('bebe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'bebe'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            Bebê
          </button>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setNote('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="px-3 py-2 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Marco</span>
        </button>
      </div>

      {/* Suggested Quick Milestones Carousel */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#3D3230]/70 dark:text-[#A79895] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#8C4A3C]" />
          Sugestões de Momentos Especiais
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DEFAULT_SUGGESTIONS.map((sug) => (
            <button
              key={sug.title}
              onClick={() => {
                setTitle(sug.title);
                setKind(sug.kind);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#FBF3EF] dark:bg-[#1E1817] hover:bg-[#F3D6CB]/50 text-xs font-medium text-[#3D3230] dark:text-[#F8ECE8] border border-[#F3D6CB]/60 dark:border-[#382C29] shrink-0 text-left transition"
            >
              + {sug.title}
            </button>
          ))}
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] text-center">
            <Star className="w-8 h-8 mx-auto text-[#8C4A3C]/40 mb-2" />
            <p className="text-xs text-[#3D3230]/60 dark:text-[#A79895]">
              Nenhum marco registrado nesta categoria ainda. Toque em "Novo Marco" acima para eternizar um momento inesquecível!
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const dateStr = formatFriendlyDate(item.date, locale);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/80 dark:border-[#382C29] shadow-xs flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.kind === 'gestacao'
                        ? 'bg-[#FBEFEA] text-[#8C4A3C]'
                        : 'bg-[#EEF3EA] text-[#435139]'
                    }`}
                  >
                    <Heart className="w-5 h-5 fill-current opacity-80" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.kind === 'gestacao'
                            ? 'bg-[#F3D6CB] text-[#8C4A3C] dark:bg-[#3E2925] dark:text-[#F3D6CB]'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}
                      >
                        {item.kind === 'gestacao' ? 'Gestação' : 'Bebê'}
                      </span>
                      <span className="text-[11px] text-[#3D3230]/60 dark:text-[#A79895] flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
                      {item.title}
                    </h4>

                    {item.note && (
                      <p className="text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] mt-1 leading-relaxed">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-[#3D3230]/30 hover:text-rose-600 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#251E1C] rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-xl text-[#3D3230] dark:text-[#F8ECE8]">
                Novo Marco do Bebê
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#3D3230]/40 hover:text-[#3D3230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                  Qual foi o momento? *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Primeiro sorriso, primeiro chute, segurou meu dedo..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:ring-2 focus:ring-[#8C4A3C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                    Fase
                  </label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as MilestoneKind)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
                  >
                    <option value="gestacao">Gestação</option>
                    <option value="bebe">Bebê</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                  O que você sentiu? (Anotação carinhosa)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Conte um pouco do que aconteceu e a emoção daquele dia..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] text-xs font-bold text-[#3D3230]/70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md hover:brightness-105"
                >
                  {saving ? 'Guardando...' : 'Guardar Marco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
