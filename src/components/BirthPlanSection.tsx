import React, { useState, useEffect } from 'react';
import { FileHeart, Printer, Copy, Check, Info, Sparkles, X } from 'lucide-react';
import { dataService } from '../data/dataService';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../config/constants';

interface BirthPlanOptions {
  motherName: string;
  partnerName: string;
  doctorOrHospital: string;
  additionalNotes: string;
  // Sections
  labor: Record<string, boolean>;
  painRelief: Record<string, boolean>;
  delivery: Record<string, boolean>;
  postpartum: Record<string, boolean>;
}

const DEFAULT_OPTIONS: BirthPlanOptions = {
  motherName: '',
  partnerName: '',
  doctorOrHospital: '',
  additionalNotes: '',
  labor: {
    luz_baixa: true,
    musica: true,
    livre_movimento: true,
    chuveiro_banheira: true,
    presenca_acompanhante: true,
    toques_restritos: true,
  },
  painRelief: {
    metodos_naturais: true,
    bola_massagem: true,
    analgesia_sob_demanda: true,
    sem_ocitocina_rotina: true,
    sem_amniotomia_rotina: true,
  },
  delivery: {
    posicao_livre: true,
    puxos_espontaneos: true,
    sem_episiotomia: true,
    luz_suave_nascimento: true,
  },
  postpartum: {
    pele_a_pele_golden_hour: true,
    clampeamento_tardio: true,
    amamentacao_primeira_hora: true,
    adiar_banho_24h: true,
    exames_no_colo: true,
  },
};

const LABOR_ITEMS = [
  { key: 'luz_baixa', label: 'Ambiente calmo, silencioso e com luz baixa/indireta' },
  { key: 'musica', label: 'Permissão para ouvir minha própria trilha sonora' },
  { key: 'livre_movimento', label: 'Liberdade total para caminhar, mudar de posição e usar o banheiro' },
  { key: 'chuveiro_banheira', label: 'Acesso ao chuveiro ou banheira morna para alívio' },
  { key: 'presenca_acompanhante', label: 'Presença contínua e irrestrita do meu acompanhante de escolha' },
  { key: 'toques_restritos', label: 'Toques vaginais restritos ao mínimo indispensável e com aviso prévio' },
];

const PAIN_RELIEF_ITEMS = [
  { key: 'metodos_naturais', label: 'Métodos naturais prioritários (respiração, massagens, compressas mornas)' },
  { key: 'bola_massagem', label: 'Uso livre da bola de pilates e banqueta de parto' },
  { key: 'analgesia_sob_demanda', label: 'Analgesia peridural disponível caso eu expressamente a requisite' },
  { key: 'sem_ocitocina_rotina', label: 'Não administrar ocitocina sintética de rotina sem consentimento' },
  { key: 'sem_amniotomia_rotina', label: 'Não romper a bolsa das águas artificialmente sem consentimento' },
];

const DELIVERY_ITEMS = [
  { key: 'posicao_livre', label: 'Escolha livre da posição para o parto (vertical, cócoras, 4 apoios, lateral)' },
  { key: 'puxos_espontaneos', label: 'Puxos fisiológicos espontâneos (força no meu próprio ritmo respiratório)' },
  { key: 'sem_episiotomia', label: 'Não realizar episiotomia de rotina (corte cirúrgico do períneo)' },
  { key: 'luz_suave_nascimento', label: 'Luz suave e acolhedora no exato instante do nascimento' },
];

const POSTPARTUM_ITEMS = [
  { key: 'pele_a_pele_golden_hour', label: 'Contato pele a pele imediato na primeira hora de vida ("Golden Hour")' },
  { key: 'clampeamento_tardio', label: 'Clampeamento tardio do cordão (aguardar parar de pulsar completamente)' },
  { key: 'amamentacao_primeira_hora', label: 'Incentivo ao aleitamento materno na primeira hora no meu colo' },
  { key: 'adiar_banho_24h', label: 'Adiar o primeiro banho por no mínimo 24h para absorção do vérnix protetor' },
  { key: 'exames_no_colo', label: 'Procedimentos de rotina (pesagem, colírio, vitamina K) realizados ao meu lado' },
];

export const BirthPlanSection: React.FC = () => {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<BirthPlanOptions>(DEFAULT_OPTIONS);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    dataService.getBirthPlan(user.id).then((saved) => {
      if (saved?.data) {
        setPlan((prev) => ({
          ...prev,
          ...saved.data,
          motherName: saved.data.motherName || profile?.nickname || '',
        }));
      } else {
        setPlan((prev) => ({
          ...prev,
          motherName: profile?.nickname || '',
        }));
      }
    });
  }, [user, profile]);

  const toggleOption = (section: 'labor' | 'painRelief' | 'delivery' | 'postpartum', key: string) => {
    setPlan((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await dataService.saveBirthPlan(user.id, plan);
    } finally {
      setSaving(false);
    }
  };

  const generateFormattedText = () => {
    const lines = [
      `PLANO DE PARTO — ${APP_NAME}`,
      `Gestante: ${plan.motherName || 'Não informada'}`,
      plan.partnerName ? `Acompanhante: ${plan.partnerName}` : '',
      plan.doctorOrHospital ? `Equipe / Hospital: ${plan.doctorOrHospital}` : '',
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      '',
      'Apresento aqui meus desejos e preferências para o nascimento do meu bebê. Peço que a equipe me consulte e informe com carinho sobre qualquer intervenção necessária.',
      '',
      '1. TRABALHO DE PARTO & AMBIENTE:',
      ...LABOR_ITEMS.filter((i) => plan.labor[i.key]).map((i) => ` • ${i.label}`),
      '',
      '2. ALÍVIO DA DOR:',
      ...PAIN_RELIEF_ITEMS.filter((i) => plan.painRelief[i.key]).map((i) => ` • ${i.label}`),
      '',
      '3. PARTO / EXPULSIVO:',
      ...DELIVERY_ITEMS.filter((i) => plan.delivery[i.key]).map((i) => ` • ${i.label}`),
      '',
      '4. PÓS-PARTO IMEDIATO E RECÉM-NASCIDO:',
      ...POSTPARTUM_ITEMS.filter((i) => plan.postpartum[i.key]).map((i) => ` • ${i.label}`),
    ];

    if (plan.additionalNotes.trim()) {
      lines.push('', 'OBSERVAÇÕES ADICIONAIS:');
      lines.push(plan.additionalNotes.trim());
    }

    return lines.filter((l) => l !== undefined).join('\n');
  };

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(generateFormattedText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Introduction Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileHeart className="w-5 h-5 text-[#8C4A3C]" />
            <h4 className="font-serif font-bold text-sm text-[#3D3230] dark:text-[#F8ECE8]">
              Seu Plano de Parto Acolhedor
            </h4>
          </div>
          <button
            onClick={() => {
              handleSave();
              setShowPrintModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#8C4A3C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Gerar / Imprimir</span>
          </button>
        </div>
        <p className="text-xs text-[#3D3230]/75 dark:text-[#D1C2BE] leading-relaxed">
          Selecione suas preferências para o trabalho de parto, alívio da dor e pós-parto imediato. Você poderá imprimir e entregar à sua equipe médica.
        </p>
      </div>

      {/* Basic Info Inputs */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-3">
        <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-[#3D3230]/70 dark:text-[#A79895]">
          Dados do Parto
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <input
            type="text"
            value={plan.motherName}
            onChange={(e) => setPlan({ ...plan, motherName: e.target.value })}
            placeholder="Nome da gestante"
            className="px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
          />
          <input
            type="text"
            value={plan.partnerName}
            onChange={(e) => setPlan({ ...plan, partnerName: e.target.value })}
            placeholder="Nome do acompanhante"
            className="px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
          />
          <input
            type="text"
            value={plan.doctorOrHospital}
            onChange={(e) => setPlan({ ...plan, doctorOrHospital: e.target.value })}
            placeholder="Hospital / Maternidade / Obstetra"
            className="px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
          />
        </div>
      </div>

      {/* Section 1: Trabalho de Parto */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2.5">
        <h5 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB]">
          1. Trabalho de Parto & Ambiente
        </h5>
        <div className="space-y-2">
          {LABOR_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FBF3EF]/40 dark:bg-[#1E1817] hover:bg-[#FBF3EF] transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!plan.labor[item.key]}
                onChange={() => toggleOption('labor', item.key)}
                className="mt-0.5 rounded-sm border-[#8C4A3C] text-[#8C4A3C] focus:ring-[#8C4A3C]"
              />
              <span className="text-xs text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 2: Alívio da Dor */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2.5">
        <h5 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB]">
          2. Alívio da Dor
        </h5>
        <div className="space-y-2">
          {PAIN_RELIEF_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FBF3EF]/40 dark:bg-[#1E1817] hover:bg-[#FBF3EF] transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!plan.painRelief[item.key]}
                onChange={() => toggleOption('painRelief', item.key)}
                className="mt-0.5 rounded-sm border-[#8C4A3C] text-[#8C4A3C] focus:ring-[#8C4A3C]"
              />
              <span className="text-xs text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 3: Parto / Expulsivo */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2.5">
        <h5 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB]">
          3. Parto & Nascimento
        </h5>
        <div className="space-y-2">
          {DELIVERY_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FBF3EF]/40 dark:bg-[#1E1817] hover:bg-[#FBF3EF] transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!plan.delivery[item.key]}
                onChange={() => toggleOption('delivery', item.key)}
                className="mt-0.5 rounded-sm border-[#8C4A3C] text-[#8C4A3C] focus:ring-[#8C4A3C]"
              />
              <span className="text-xs text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 4: Pós-Parto Imediato */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] shadow-xs space-y-2.5">
        <h5 className="font-serif font-bold text-sm text-[#8C4A3C] dark:text-[#F3D6CB]">
          4. Pós-Parto Imediato & Bebê
        </h5>
        <div className="space-y-2">
          {POSTPARTUM_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FBF3EF]/40 dark:bg-[#1E1817] hover:bg-[#FBF3EF] transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!plan.postpartum[item.key]}
                onChange={() => toggleOption('postpartum', item.key)}
                className="mt-0.5 rounded-sm border-[#8C4A3C] text-[#8C4A3C] focus:ring-[#8C4A3C]"
              />
              <span className="text-xs text-[#3D3230] dark:text-[#F8ECE8] leading-relaxed">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md hover:brightness-105 active:scale-98 transition"
        >
          {saving ? 'Salvando preferências...' : 'Salvar Alterações do Plano de Parto'}
        </button>
      </div>

      {/* Formatted View & Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#251E1C] rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3D6CB]/60 dark:border-[#382C29]">
              <div className="flex items-center gap-2">
                <FileHeart className="w-5 h-5 text-[#8C4A3C]" />
                <h3 className="font-serif font-bold text-lg text-[#3D3230] dark:text-[#F8ECE8]">
                  Plano de Parto Formatado
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-full text-[#3D3230]/40 hover:text-[#3D3230]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29] overflow-y-auto flex-1 font-serif text-xs leading-relaxed text-[#3D3230] dark:text-[#F8ECE8] whitespace-pre-wrap select-all">
              {generateFormattedText()}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCopyText}
                className="flex-1 py-3 rounded-2xl border border-[#8C4A3C] text-[#8C4A3C] dark:text-[#F3D6CB] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#8C4A3C]/10 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
