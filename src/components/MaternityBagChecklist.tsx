import React, { useState, useEffect } from 'react';
import { Check, Plus, PackageCheck, User, Baby, Users } from 'lucide-react';
import { dataService } from '../data/dataService';
import { ChecklistItem } from '../data/types';
import { useAuth } from '../hooks/useAuth';

type Category = 'mae' | 'bebe' | 'acompanhante';

export const MaternityBagChecklist: React.FC = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>('mae');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadChecklist = async () => {
    if (!user) return;
    try {
      const allItems = await dataService.getChecklistItems(user.id, 'mala');
      setItems(allItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, [user]);

  const toggleItem = async (item: ChecklistItem) => {
    if (!user) return;
    const updated = { ...item, done: !item.done };
    setItems((prev) =>
      prev.map((i) => (i.item_key === item.item_key ? updated : i))
    );
    await dataService.saveChecklistItem(updated);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItemText.trim()) return;

    const newItem: ChecklistItem = {
      user_id: user.id,
      list: 'mala',
      item_key: `custom_${activeCategory}_${Date.now()}`,
      label: newItemText.trim(),
      category: activeCategory,
      done: false,
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemText('');
    await dataService.saveChecklistItem(newItem);
  };

  // Metrics
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.done).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categoryItems = items.filter((i) => (i.category || 'mae') === activeCategory);
  const categoryDone = categoryItems.filter((i) => i.done).length;

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#8C4A3C]" />
            <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
              Progresso da Mala
            </h4>
          </div>
          <span className="text-xs font-bold text-[#8C4A3C] dark:text-[#F3D6CB]">
            {completedCount} de {totalCount} itens prontos ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-[#F3D6CB]/50 dark:bg-[#342421] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8C4A3C] to-[#6F7F62] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29]">
        <button
          onClick={() => setActiveCategory('mae')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            activeCategory === 'mae'
              ? 'bg-[#8C4A3C] text-white shadow-xs'
              : 'text-[#3D3230]/70 dark:text-[#A79895]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Mãe</span>
        </button>

        <button
          onClick={() => setActiveCategory('bebe')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            activeCategory === 'bebe'
              ? 'bg-[#8C4A3C] text-white shadow-xs'
              : 'text-[#3D3230]/70 dark:text-[#A79895]'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          <span>Bebê</span>
        </button>

        <button
          onClick={() => setActiveCategory('acompanhante')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            activeCategory === 'acompanhante'
              ? 'bg-[#8C4A3C] text-white shadow-xs'
              : 'text-[#3D3230]/70 dark:text-[#A79895]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Acompanhante</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[#3D3230]/60 dark:text-[#A79895]">
          <span>Itens sugeridos para a mala</span>
          <span>{categoryDone}/{categoryItems.length} prontos</span>
        </div>

        {categoryItems.map((item) => (
          <div
            key={item.item_key}
            onClick={() => toggleItem(item)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              item.done
                ? 'bg-[#EEF3EA]/70 dark:bg-[#1E281C]/70 border-[#6F7F62]/40 text-[#435139] dark:text-[#C5D6BF]'
                : 'bg-white dark:bg-[#251E1C] border-[#F3D6CB]/80 dark:border-[#382C29] text-[#3D3230] dark:text-[#F8ECE8] shadow-xs hover:border-[#8C4A3C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                  item.done
                    ? 'bg-[#6F7F62] border-[#6F7F62] text-white'
                    : 'border-[#8C4A3C]/40 bg-white dark:bg-[#1E1817]'
                }`}
              >
                {item.done && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </div>
              <span
                className={`text-xs font-medium leading-relaxed ${
                  item.done ? 'line-through opacity-75' : ''
                }`}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}

        {/* Add custom item form */}
        <form onSubmit={handleAddItem} className="pt-2 flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder={`Adicionar outro item para ${
              activeCategory === 'mae'
                ? 'a mãe'
                : activeCategory === 'bebe'
                ? 'o bebê'
                : 'o acompanhante'
            }...`}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-[#F3D6CB] dark:border-[#382C29] bg-white dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:ring-2 focus:ring-[#8C4A3C]"
          />
          <button
            type="submit"
            disabled={!newItemText.trim()}
            className="px-4 py-2.5 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold shrink-0 shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
