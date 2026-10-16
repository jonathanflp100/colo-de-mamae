import React, { useState, useEffect } from 'react';
import { BookHeart, Star, Feather, Download, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { dataService } from '../data/dataService';
import { Milestone, Letter } from '../data/types';
import { MilestonesSection } from '../components/MilestonesSection';
import { LettersSection } from '../components/LettersSection';
import { ExportDiaryModal } from '../components/ExportDiaryModal';

type MemoriesTab = 'milestones' | 'letters';

export const MemoriesPage: React.FC = () => {
  const { user, profile, turma } = useAuth();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<MemoriesTab>('milestones');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      dataService.getMilestones(user.id),
      dataService.getLetters(user.id),
    ]).then(([m, l]) => {
      setMilestones(m);
      setLetters(l);
    });
  }, [user, activeTab]);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      {/* Memories Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#8C4A3C] to-[#73392E] text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <BookHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight">
                Álbum de Memórias
              </h2>
              <p className="text-xs text-white/80">
                Marcos, primeiros momentos e cartas de amor
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            title="Exportar livro de memórias"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29]">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'milestones'
              ? 'bg-[#8C4A3C] text-white shadow-xs'
              : 'text-[#3D3230]/70 dark:text-[#A79895]'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Marcos do Desenvolvimento</span>
        </button>

        <button
          onClick={() => setActiveTab('letters')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'letters'
              ? 'bg-[#8C4A3C] text-white shadow-xs'
              : 'text-[#3D3230]/70 dark:text-[#A79895]'
          }`}
        >
          <Feather className="w-4 h-4" />
          <span>Cartas para o Meu Bebê</span>
        </button>
      </div>

      {/* Active Section */}
      {activeTab === 'milestones' ? <MilestonesSection /> : <LettersSection />}

      {/* Export Modal */}
      <ExportDiaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
        turma={turma}
        milestones={milestones}
        letters={letters}
      />
    </div>
  );
};
