import React, { useState, useEffect } from 'react';
import {
  Siren,
  X,
  PhoneCall,
  AlertTriangle,
  HeartPulse,
  Baby,
  Edit2,
  Plus,
  Save,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { useI18n } from '../i18n';

interface HealthContact {
  type: string;
  name: string;
  phone: string;
}

const STORAGE_CONTACTS = 'colodemae_health_contacts';

interface WarningSignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'gestante' | 'bebe';
}

export const WarningSignsModal: React.FC<WarningSignsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'gestante',
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'gestante' | 'bebe'>(defaultTab);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // Health contacts state
  const [contacts, setContacts] = useState<HealthContact[]>(() => {
    const saved = localStorage.getItem(STORAGE_CONTACTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      { type: 'Maternidade de Referência', name: 'Maternidade Central', phone: '(11) 3000-0000' },
      { type: 'Pediatra / Obstetra', name: 'Dra. Luísa', phone: '(11) 98765-4321' },
      { type: 'Unidade Básica de Saúde', name: 'UBS Ninho Acolhedor', phone: '156' },
      { type: 'Pessoa de Confiança', name: 'Madrinha / Parceiro(a)', phone: '' },
    ];
  });

  const [editingContacts, setEditingContacts] = useState<HealthContact[]>(contacts);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleSaveContacts = () => {
    setContacts(editingContacts);
    localStorage.setItem(STORAGE_CONTACTS, JSON.stringify(editingContacts));
    setShowContactsModal(false);
  };

  const handleContactChange = (index: number, field: keyof HealthContact, val: string) => {
    const updated = [...editingContacts];
    updated[index] = { ...updated[index], [field]: val };
    setEditingContacts(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg bg-[#FFF9F8] dark:bg-[#1E1716] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-[#B03622]">
        {/* Alert Header */}
        <div className="p-4 bg-[#B03622] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Siren className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold tracking-tight text-white leading-tight">
                Procure atendimento imediatamente se…
              </h2>
              <p className="text-[11px] text-white/90">
                Informação que protege você e seu bebê
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: "Na gestação" and "No bebê" */}
        <div className="grid grid-cols-2 p-2 bg-[#FBEFEA] dark:bg-[#2A1D1A] border-b border-[#B03622]/20">
          <button
            type="button"
            onClick={() => setActiveTab('gestante')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'gestante'
                ? 'bg-white dark:bg-[#1E1716] text-[#B03622] shadow-xs'
                : 'text-[#3D3230]/75 dark:text-[#E0D0CC] hover:bg-white/40'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Na gestação</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bebe')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'bebe'
                ? 'bg-white dark:bg-[#1E1716] text-[#B03622] shadow-xs'
                : 'text-[#3D3230]/75 dark:text-[#E0D0CC] hover:bg-white/40'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>No bebê</span>
          </button>
        </div>

        {/* Scrollable Checklist */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 text-[#3D3230] dark:text-[#F3D6CB]">
          {activeTab === 'gestante' ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B03622] mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Sinais de Alerta Gestacional:</span>
              </div>

              {[
                { title: 'Sangramento vaginal', desc: 'De qualquer intensidade ou coloração avermelhada/escura.' },
                { title: 'Perda de líquido', desc: 'Saída contínua de líquido transparente ou esverdeado pela vagina.' },
                { title: 'Dor forte ou contrações regulares antes de 37 semanas', desc: 'Endurecimento rítmico e doloroso da barriga que não cessa com o repouso.' },
                { title: 'Febre de 37,8 °C ou mais', desc: 'Aumento da temperatura axilar acompanhado ou não de calafrios.' },
                { title: 'Dor de cabeça forte com visão embaçada', desc: 'Cefaleia resistente a analgésicos comuns, pontos brilhantes (escotomas) ou zumbido no ouvido.' },
                { title: 'Inchaço repentino no rosto e nas mãos', desc: 'Edema de aparecimento súbito ao acordar.' },
                { title: 'Bebê se mexendo menos que o habitual', desc: 'Diminuição nítida dos movimentos fetais (a partir de 28 semanas).' },
                { title: 'Ardência ao urinar', desc: 'Sensação de queimação, urina turva com cheiro forte ou vontade frequente e dolorosa.' },
                { title: 'Vômitos que não param', desc: 'Incapacidade total de reter líquidos ou alimentos por mais de 12 horas.' },
                { title: 'Dor e inchaço em uma perna só', desc: 'Assimetria nas panturrilhas, vermelhidão local ou dor ao apoiar o pé.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] flex items-start gap-3 shadow-xs"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B03622] mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#B03622] leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B03622] mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Sinais de Alerta no Recém-Nascido:</span>
              </div>

              {[
                { title: 'Febre de 37,8 °C ou mais', desc: 'Em bebês com menos de 3 meses, febre é SEMPRE uma emergência médica imediata.' },
                { title: 'Temperatura abaixo de 36 °C', desc: 'Hipotermia; o corpinho do recém-nascido fica frio e não aquece mesmo com agasalho.' },
                { title: 'Dificuldade para respirar', desc: 'Respiração acelerada, narinas batendo, gemidos ou peito afundando sob as costelas.' },
                { title: 'Lábios arroxeados ou pele azulada', desc: 'Cianose central indicando baixa oxigenação sanguínea.' },
                { title: 'Muito mole ou difícil de acordar', desc: 'Hipotonia extrema, letargia e ausência de reação ao toque materno.' },
                { title: 'Recusa em mamar', desc: 'Não pega o peito nem a mamadeira por duas ou mais mamadas consecutivas.' },
                { title: 'Vômitos em jato ou verdes', desc: 'Vômitos frequentes expelidos com força ou com coloração escura/biliar.' },
                { title: 'Menos de 6 fraldas molhadas por dia', desc: 'Sinal de desidratação (após o 5º dia de vida do bebê).' },
                { title: 'Pele amarela até a barriga ou pernas', desc: 'Icterícia intensa progredindo para além do rosto e olhos.' },
                { title: 'Umbigo vermelho com pus ou mau cheiro', desc: 'Inflamação ou infecção da base do coto umbilical.' },
                { title: 'Cocô branco, cinza ou com sangue', desc: 'Fezes acólicas (sem cor) ou presença visível de sangue nas fezes.' },
                { title: 'Convulsão', desc: 'Tremores involuntários ritmados que não param ao segurar o membro ou fixação do olhar.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB] dark:border-[#382C29] flex items-start gap-3 shadow-xs"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B03622] mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#B03622] leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#3D3230]/80 dark:text-[#D1C2BE] mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Large Action Buttons */}
        <div className="p-4 bg-white dark:bg-[#221918] border-t border-[#F3D6CB]/60 dark:border-[#382C29] space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Ligar para o SAMU 192 */}
            <a
              href="tel:192"
              className="py-3 px-4 rounded-2xl bg-[#B03622] hover:bg-[#8F2B1A] text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>Ligar para o SAMU (192)</span>
            </a>

            {/* Meus contatos de saúde */}
            <button
              type="button"
              onClick={() => {
                setEditingContacts(contacts);
                setShowContactsModal(true);
              }}
              className="py-3 px-4 rounded-2xl bg-[#FBEFEA] dark:bg-[#342421] border border-[#B03622]/40 text-[#B03622] dark:text-[#F3D6CB] text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Phone className="w-4 h-4" />
              <span>Meus contatos de saúde</span>
            </button>
          </div>

          {/* Footer note */}
          <div className="pt-1 text-center">
            <p className="text-[11px] text-[#3D3230]/65 dark:text-[#A79895] font-medium flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B03622]" />
              <span>Este app não substitui o atendimento médico.</span>
            </p>
          </div>
        </div>

        {/* Editable Health Contacts Modal */}
        {showContactsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-[#FBF3EF] dark:bg-[#251E1C] p-5 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29] max-h-[88vh] overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-base text-[#8C4A3C] dark:text-[#F3D6CB]">
                  Meus Contatos de Saúde
                </h3>
                <button
                  onClick={() => setShowContactsModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#3D3230]/70 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1 mb-4">
                {editingContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-2xl bg-white dark:bg-[#1E1817] border border-[#F3D6CB] dark:border-[#382C29] space-y-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C4A3C] dark:text-[#F3D6CB]">
                      {contact.type}
                    </span>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      placeholder="Nome do profissional / local"
                      className="w-full px-3 py-1.5 bg-[#FBF3EF] dark:bg-[#251E1C] rounded-lg text-xs font-semibold text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      placeholder="Telefone (com DDD)"
                      className="w-full px-3 py-1.5 bg-[#FBF3EF] dark:bg-[#251E1C] rounded-lg text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowContactsModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] text-xs font-semibold text-[#3D3230] dark:text-[#D1C2BE] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveContacts}
                  className="flex-1 py-2.5 rounded-xl bg-[#8C4A3C] hover:bg-[#73392E] text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar contatos</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
